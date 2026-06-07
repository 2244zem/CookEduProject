import { createClient, type User } from 'npm:@supabase/supabase-js@2'
import { Pool } from 'https://deno.land/x/postgres@v0.19.3/mod.ts'

type CoinPackageId = 'starter' | 'plus' | 'pro'

type CoinPackage = {
  id: CoinPackageId
  name: string
  coins: number
  amount: number
}

type CoinPurchase = {
  order_id: string
  user_id: string
  coin_amount: number
  status: string
}

type ProfileRole = {
  id: string
  role: string | null
}

const COIN_PACKAGES: Record<CoinPackageId, CoinPackage> = {
  starter: { id: 'starter', name: 'CookEdu Coin Starter', coins: 100, amount: 10000 },
  plus: { id: 'plus', name: 'CookEdu Coin Plus', coins: 275, amount: 25000 },
  pro: { id: 'pro', name: 'CookEdu Coin Pro', coins: 600, amount: 50000 },
}

const SPEND_OPTIONS: Record<string, { label: string; cost: number }> = {
  premium_recipe: { label: 'Unlock resep premium', cost: 25 },
  ai_boost: { label: 'Chef AI Boost', cost: 15 },
  badge: { label: 'Badge kolektor CookEdu', cost: 40 },
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const dbPool = new Pool(requiredEnv('SUPABASE_DB_URL'), 2, true)

class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ status: 'error', message: 'Method tidak didukung.' }, 405)
  }

  try {
    const body = await req.json().catch(() => ({}))
    const user = await requireSupabaseUser(req)
    await ensureProfileForUser(user)
    const action = String(body.action || '')

    if (action === 'qris-checkout') return jsonResponse(await chargeQris(body, user))
    if (action === 'bypass-success') return jsonResponse(await bypassSuccess(body, user))
    if (action === 'wallet-balance') {
      return jsonResponse({ status: 'success', coin_balance: await walletBalance(user.id) })
    }
    if (action === 'wallet-history') return jsonResponse(await walletHistory(user.id, body))
    if (action === 'claim-daily-reward') return jsonResponse(await claimDailyReward(user))
    if (action === 'spend-coins') return jsonResponse(await spendCoins(body, user))
    if (action === 'admin-search-users') return jsonResponse(await adminSearchUsers(body, user))
    if (action === 'admin-give-coins') return jsonResponse(await adminGiveCoins(body, user))
    if (action === 'admin-wallet-audit') return jsonResponse(await adminWalletAudit(body, user))

    return jsonResponse({ status: 'error', message: 'Aksi koin tidak dikenali.' }, 400)
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Supabase Function coins gagal.'
    console.error('[coins]', message)
    return jsonResponse({ status: 'error', message }, status)
  }
})

async function chargeQris(body: Record<string, unknown>, user: User) {
  const packageId = isCoinPackageId(body.package_id) ? body.package_id : 'starter'
  const selectedPackage = COIN_PACKAGES[packageId]
  const orderId = makeOrderId()
  const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY') || ''
  const baseUrl = midtransBaseUrl()

  if (!serverKey) {
    if (!isProductionMode()) {
      await recordPendingPurchase(orderId, user.id, selectedPackage)
      return {
        status: 'success',
        order_id: orderId,
        qris_image_url: sandboxQrPlaceholderUrl(orderId, selectedPackage),
        coin_amount: selectedPackage.coins,
        gross_amount: selectedPackage.amount,
      }
    }

    throw new HttpError(500, 'MIDTRANS_SERVER_KEY belum diatur di Supabase Function Secrets.')
  }

  const payload = {
    payment_type: 'gopay',
    transaction_details: {
      order_id: orderId,
      gross_amount: selectedPackage.amount,
    },
    item_details: [{
      id: selectedPackage.id,
      price: selectedPackage.amount,
      quantity: 1,
      name: selectedPackage.name,
    }],
    customer_details: {
      first_name: String(isPlaceholderIdentity(String(body.customer_name || '')) ? getSafeUsername(user) : body.customer_name),
      email: String(body.customer_email || user.email || ''),
    },
    custom_field1: user.id,
    custom_field2: selectedPackage.id,
    custom_field3: String(selectedPackage.coins),
    gopay: {
      enable_callback: false,
    },
  }

  const response = await fetch(`${baseUrl}/v2/charge`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${serverKey}:`)}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    if (!isProductionMode()) {
      await recordPendingPurchase(orderId, user.id, selectedPackage)
      return {
        status: 'success',
        order_id: orderId,
        qris_image_url: sandboxQrPlaceholderUrl(orderId, selectedPackage),
        coin_amount: selectedPackage.coins,
        gross_amount: selectedPackage.amount,
      }
    }

    const errorPayload = await response.json().catch(() => ({}))
    throw new HttpError(response.status, errorPayload.status_message || 'Gagal membuat QRIS Midtrans.')
  }

  const midtransPayload = await response.json()
  await recordPendingPurchase(orderId, user.id, selectedPackage)

  return {
    status: 'success',
    order_id: orderId,
    qris_image_url: extractQrisImageUrl(midtransPayload, baseUrl, orderId),
    coin_amount: selectedPackage.coins,
    gross_amount: selectedPackage.amount,
  }
}

async function bypassSuccess(body: Record<string, unknown>, user: User) {
  if (isProductionMode()) {
    throw new HttpError(403, 'Sandbox bypass dinonaktifkan saat MIDTRANS_IS_PRODUCTION=true.')
  }

  const orderId = String(body.order_id || '').trim()
  if (!orderId) throw new HttpError(422, 'order_id wajib dikirim.')

  const client = await dbPool.connect()

  try {
    await client.queryArray('begin')

    const purchaseResult = await client.queryObject<CoinPurchase>(
      `select order_id, user_id::text as user_id, coin_amount, status
       from public.coin_purchases
       where order_id = $1 and user_id = $2
       for update`,
      [orderId, user.id],
    )

    const purchase = purchaseResult.rows[0]
    if (!purchase) throw new HttpError(404, 'Order koin tidak ditemukan untuk user aktif.')

    if (purchase.status !== 'pending') {
      const balance = await walletBalanceInClient(client, user.id)
      await client.queryArray('commit')
      return {
        status: 'success',
        order_id: purchase.order_id,
        purchase_status: purchase.status,
        coins_added: 0,
        coin_balance: balance,
      }
    }

    await client.queryObject(
      `update public.coin_purchases
       set status = 'settlement', updated_at = now()
       where order_id = $1 and user_id = $2 and status = 'pending'`,
      [purchase.order_id, user.id],
    )

    const balance = await incrementWalletInClient(client, user.id, Number(purchase.coin_amount || 0))
    await recordWalletTransactionInClient(client, {
      userId: user.id,
      amount: Number(purchase.coin_amount || 0),
      type: 'purchase',
      description: `Pembelian koin ${purchase.order_id}`,
      referenceType: 'coin_purchase',
      referenceId: purchase.order_id,
      metadata: { order_id: purchase.order_id },
      createdBy: user.id,
    })

    await client.queryArray('commit')

    return {
      status: 'success',
      order_id: purchase.order_id,
      purchase_status: 'settlement',
      coins_added: Number(purchase.coin_amount || 0),
      coin_balance: balance,
    }
  } catch (error) {
    await client.queryArray('rollback').catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}

async function walletHistory(userId: string, body: Record<string, unknown>) {
  const limit = clampNumber(Number(body.limit || 20), 1, 50)
  const client = await dbPool.connect()

  try {
    const result = await client.queryObject(
      `select id::text, user_id::text, amount, transaction_type, description,
              reference_type, reference_id, metadata, created_by::text, created_at
       from public.wallet_transactions
       where user_id = $1
       order by created_at desc
       limit $2`,
      [userId, limit],
    )

    return { status: 'success', transactions: result.rows }
  } finally {
    client.release()
  }
}

async function claimDailyReward(user: User) {
  const rewardDate = getJakartaDateKey()
  const rewardAmount = 10
  const client = await dbPool.connect()

  try {
    await client.queryArray('begin')

    const existing = await client.queryObject(
      `select id
       from public.wallet_transactions
       where user_id = $1
         and transaction_type = 'daily_reward'
         and reference_type = 'daily_login'
         and reference_id = $2
       limit 1`,
      [user.id, rewardDate],
    )

    if (existing.rows.length > 0) {
      const balance = await walletBalanceInClient(client, user.id)
      await client.queryArray('commit')
      return {
        status: 'success',
        claimed: false,
        coins_added: 0,
        coin_balance: balance,
        message: 'Bonus harian sudah diklaim hari ini.',
      }
    }

    const balance = await incrementWalletInClient(client, user.id, rewardAmount)
    await recordWalletTransactionInClient(client, {
      userId: user.id,
      amount: rewardAmount,
      type: 'daily_reward',
      description: `Daily login reward ${rewardDate}`,
      referenceType: 'daily_login',
      referenceId: rewardDate,
      metadata: { reward_date: rewardDate },
      createdBy: user.id,
    })

    await client.queryArray('commit')

    return {
      status: 'success',
      claimed: true,
      coins_added: rewardAmount,
      coin_balance: balance,
      message: `Bonus harian +${rewardAmount} koin berhasil diklaim.`,
    }
  } catch (error) {
    await client.queryArray('rollback').catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}

async function spendCoins(body: Record<string, unknown>, user: User) {
  const spendType = String(body.spend_type || '').trim()
  const option = SPEND_OPTIONS[spendType]
  if (!option) throw new HttpError(422, 'Pilihan penggunaan koin tidak tersedia.')

  const referenceId = String(body.reference_id || crypto.randomUUID()).slice(0, 120)
  const client = await dbPool.connect()

  try {
    await client.queryArray('begin')

    const currentBalance = await walletBalanceInClient(client, user.id, true)
    if (currentBalance < option.cost) {
      throw new HttpError(402, `Saldo koin kurang. Butuh ${option.cost} koin.`)
    }

    const balance = await incrementWalletInClient(client, user.id, -option.cost)
    await recordWalletTransactionInClient(client, {
      userId: user.id,
      amount: -option.cost,
      type: 'spend',
      description: option.label,
      referenceType: spendType,
      referenceId,
      metadata: { spend_type: spendType, label: option.label },
      createdBy: user.id,
    })

    await client.queryArray('commit')

    return {
      status: 'success',
      spend_type: spendType,
      coins_spent: option.cost,
      coin_balance: balance,
      message: `${option.label} berhasil dipakai.`,
    }
  } catch (error) {
    await client.queryArray('rollback').catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}

async function adminSearchUsers(body: Record<string, unknown>, adminUser: User) {
  await requireAdmin(adminUser.id)
  const query = String(body.query || '').trim()
  if (query.length < 2) return { status: 'success', users: [] }

  const client = await dbPool.connect()

  try {
    const result = await client.queryObject(
      `select p.id::text,
              p.username,
              p.avatar_url,
              p.role,
              u.email,
              coalesce(w.coin_balance, 0)::int as coin_balance
       from public.profiles p
       left join auth.users u on u.id = p.id
       left join public.user_wallets w on w.user_id = p.id
       where p.username ilike $1 or u.email ilike $1
       order by p.updated_at desc nulls last, p.username asc
       limit 12`,
      [`%${query}%`],
    )

    return { status: 'success', users: result.rows }
  } finally {
    client.release()
  }
}

async function adminGiveCoins(body: Record<string, unknown>, adminUser: User) {
  await requireAdmin(adminUser.id)

  const targetUserId = String(body.target_user_id || '').trim()
  const amount = Number(body.amount || 0)
  const reason = String(body.reason || '').trim()

  if (!isUuid(targetUserId)) throw new HttpError(422, 'Target user tidak valid.')
  if (!Number.isInteger(amount) || amount < 1 || amount > 100000) {
    throw new HttpError(422, 'Jumlah koin harus 1 sampai 100000.')
  }
  if (reason.length < 3) throw new HttpError(422, 'Alasan pemberian koin wajib diisi.')

  const client = await dbPool.connect()

  try {
    await client.queryArray('begin')

    const target = await client.queryObject(
      `select p.id::text, p.username, u.email
       from public.profiles p
       left join auth.users u on u.id = p.id
       where p.id = $1
       limit 1`,
      [targetUserId],
    )

    if (target.rows.length === 0) throw new HttpError(404, 'User target tidak ditemukan.')

    const balance = await incrementWalletInClient(client, targetUserId, amount)
    const referenceId = `ADMIN-GIFT-${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}-${crypto.randomUUID().slice(0, 8)}`

    await recordWalletTransactionInClient(client, {
      userId: targetUserId,
      amount,
      type: 'admin_gift',
      description: reason,
      referenceType: 'admin_gift',
      referenceId,
      metadata: {
        reason,
        target: target.rows[0],
      },
      createdBy: adminUser.id,
    })

    await client.queryObject(
      `insert into public.wallet_admin_audit_logs
       (admin_user_id, target_user_id, action, amount, reason, metadata, created_at)
       values ($1, $2, 'give_coins', $3, $4, $5::jsonb, now())`,
      [
        adminUser.id,
        targetUserId,
        amount,
        reason,
        JSON.stringify({ reference_id: referenceId, target: target.rows[0] }),
      ],
    )

    await client.queryArray('commit')

    return {
      status: 'success',
      target_user_id: targetUserId,
      coins_added: amount,
      coin_balance: balance,
      reference_id: referenceId,
    }
  } catch (error) {
    await client.queryArray('rollback').catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}

async function adminWalletAudit(body: Record<string, unknown>, adminUser: User) {
  await requireAdmin(adminUser.id)
  const limit = clampNumber(Number(body.limit || 25), 1, 100)
  const client = await dbPool.connect()

  try {
    const result = await client.queryObject(
      `select l.id::text,
              l.admin_user_id::text,
              admin.username as admin_username,
              l.target_user_id::text,
              target.username as target_username,
              target_auth.email as target_email,
              l.action,
              l.amount,
              l.reason,
              l.metadata,
              l.created_at
       from public.wallet_admin_audit_logs l
       left join public.profiles admin on admin.id = l.admin_user_id
       left join public.profiles target on target.id = l.target_user_id
       left join auth.users target_auth on target_auth.id = l.target_user_id
       order by l.created_at desc
       limit $1`,
      [limit],
    )

    return { status: 'success', logs: result.rows }
  } finally {
    client.release()
  }
}

async function recordPendingPurchase(orderId: string, userId: string, selectedPackage: CoinPackage) {
  const client = await dbPool.connect()

  try {
    await client.queryObject(
      `insert into public.coin_purchases
       (order_id, user_id, coin_amount, gross_amount, status, created_at, updated_at)
       values ($1, $2, $3, $4, 'pending', now(), now())`,
      [orderId, userId, selectedPackage.coins, selectedPackage.amount],
    )
  } finally {
    client.release()
  }
}

async function ensureProfileForUser(user: User) {
  const client = await dbPool.connect()

  try {
    const username = getSafeUsername(user)

    try {
      await tryInsertProfileInClient(client, user, username)
    } catch (error) {
      if (!isUniqueViolation(error)) throw error
      await tryInsertProfileInClient(client, user, withUserSuffix(username, user.id))
    }
  } finally {
    client.release()
  }
}

async function tryInsertProfileInClient(client: any, user: User, username: string) {
  const avatarUrl = typeof user.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : null

  try {
    await client.queryObject(
      `insert into public.profiles (id, username, avatar_url, updated_at)
       values ($1, $2, $3, now())
       on conflict (id) do nothing`,
      [user.id, username, avatarUrl],
    )
  } catch (error) {
    if (!isMissingColumnError(error)) throw error

    await client.queryObject(
      `insert into public.profiles (id, username)
       values ($1, $2)
       on conflict (id) do nothing`,
      [user.id, username],
    )
  }
}

async function incrementWalletInClient(client: any, userId: string, amount: number) {
  const result = await client.queryObject<{ coin_balance: number }>(
    `insert into public.user_wallets (user_id, coin_balance, updated_at)
     values ($1, $2, now())
     on conflict (user_id) do update
     set coin_balance = greatest(0, coalesce(public.user_wallets.coin_balance, 0) + excluded.coin_balance),
         updated_at = now()
     returning coin_balance::int`,
    [userId, amount],
  )

  return Number(result.rows[0]?.coin_balance || 0)
}

async function recordWalletTransactionInClient(
  client: any,
  input: {
    userId: string
    amount: number
    type: string
    description: string
    referenceType?: string
    referenceId?: string
    metadata?: Record<string, unknown>
    createdBy?: string
  },
) {
  await client.queryObject(
    `insert into public.wallet_transactions
     (user_id, amount, transaction_type, description, reference_type, reference_id, metadata, created_by, created_at)
     values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, now())`,
    [
      input.userId,
      input.amount,
      input.type,
      input.description,
      input.referenceType || null,
      input.referenceId || null,
      JSON.stringify(input.metadata || {}),
      input.createdBy || null,
    ],
  )
}

async function walletBalance(userId: string) {
  const client = await dbPool.connect()

  try {
    return await walletBalanceInClient(client, userId)
  } finally {
    client.release()
  }
}

async function walletBalanceInClient(
  client: any,
  userId: string,
  lock = false,
) {
  const result = await client.queryObject<{ coin_balance: number }>(
    `select coalesce(coin_balance, 0)::int as coin_balance
     from public.user_wallets
     where user_id = $1
     ${lock ? 'for update' : ''}`,
    [userId],
  )

  return Number(result.rows[0]?.coin_balance || 0)
}

async function requireSupabaseUser(req: Request) {
  const authHeader = req.headers.get('Authorization') || ''
  const jwt = authHeader.replace(/^Bearer\s+/i, '').trim()

  if (!jwt) throw new HttpError(401, 'Sesi Supabase tidak ditemukan. Silakan login ulang.')

  const supabaseUrl = requiredEnv('SUPABASE_URL')
  const serviceRoleKey = getSupabaseServiceRoleKey()
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data, error } = await admin.auth.getUser(jwt)
  if (error || !data.user) {
    throw new HttpError(401, 'Sesi Supabase tidak valid. Silakan login ulang.')
  }

  return data.user
}

async function requireAdmin(userId: string) {
  const client = await dbPool.connect()

  try {
    const result = await client.queryObject<ProfileRole>(
      `select id::text, role
       from public.profiles
       where id = $1
       limit 1`,
      [userId],
    )

    if (result.rows[0]?.role !== 'admin') {
      throw new HttpError(403, 'Akses admin diperlukan untuk aksi wallet ini.')
    }
  } finally {
    client.release()
  }
}

function getSupabaseServiceRoleKey() {
  const legacyKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (legacyKey) return legacyKey

  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys) as Record<string, unknown>
      const preferred = parsed.service_role || parsed.serviceRole || parsed.secret
      if (typeof preferred === 'string') return preferred

      const firstString = Object.values(parsed).find((value) => typeof value === 'string')
      if (typeof firstString === 'string') return firstString
    } catch {
      // Fall through to the explicit setup error below.
    }
  }

  throw new HttpError(500, 'SUPABASE_SERVICE_ROLE_KEY belum tersedia di Edge Function.')
}

function isCoinPackageId(value: unknown): value is CoinPackageId {
  return value === 'starter' || value === 'plus' || value === 'pro'
}

function makeOrderId() {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(2, 14)
  const suffix = crypto.randomUUID().slice(0, 8).toUpperCase()
  return `COOKEDU-QRIS-${stamp}${suffix}`
}

function midtransBaseUrl() {
  return isProductionMode()
    ? 'https://api.midtrans.com'
    : 'https://api.sandbox.midtrans.com'
}

function isProductionMode() {
  return String(Deno.env.get('MIDTRANS_IS_PRODUCTION') || 'false').toLowerCase() === 'true'
}

function extractQrisImageUrl(payload: Record<string, unknown>, baseUrl: string, orderId: string) {
  const actions = Array.isArray(payload.actions) ? payload.actions : []
  const qrAction = actions.find((action) => {
    const url = (action as { url?: unknown }).url
    return typeof url === 'string' && url.includes('qr-code')
  }) as { url?: string } | undefined

  return qrAction?.url || `${baseUrl}/v2/gopay/${orderId}/qr-code`
}

function sandboxQrPlaceholderUrl(orderId: string, selectedPackage: CoinPackage) {
  const amount = new Intl.NumberFormat('id-ID').format(selectedPackage.amount)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="28" fill="#f8fafc"/>
  <rect x="34" y="34" width="188" height="188" rx="18" fill="#ffffff" stroke="#0891b2" stroke-width="4"/>
  <rect x="54" y="54" width="46" height="46" rx="8" fill="#0f172a"/>
  <rect x="156" y="54" width="46" height="46" rx="8" fill="#0f172a"/>
  <rect x="54" y="156" width="46" height="46" rx="8" fill="#0f172a"/>
  <rect x="116" y="74" width="14" height="14" fill="#0891b2"/>
  <rect x="132" y="90" width="14" height="14" fill="#0f172a"/>
  <rect x="116" y="122" width="14" height="14" fill="#0f172a"/>
  <rect x="148" y="122" width="14" height="14" fill="#0891b2"/>
  <rect x="132" y="148" width="14" height="14" fill="#0f172a"/>
  <rect x="164" y="164" width="14" height="14" fill="#0891b2"/>
  <rect x="180" y="148" width="14" height="14" fill="#0f172a"/>
  <text x="128" y="232" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#0f172a">Sandbox QRIS Rp${amount}</text>
  <text x="128" y="246" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" font-weight="700" fill="#64748b">${orderId}</text>
</svg>`

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

function getJakartaDateKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.floor(value)))
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function isUniqueViolation(error: unknown) {
  const err = error as { code?: string; message?: string } | null
  return err?.code === '23505' || /duplicate key|unique constraint/i.test(err?.message || '')
}

function isMissingColumnError(error: unknown) {
  const err = error as { code?: string; message?: string } | null
  return err?.code === '42703' || /column .* does not exist/i.test(err?.message || '')
}

function getSafeUsername(user: User) {
  const metadata = user.user_metadata || {}
  const candidate = [
    metadata.username ||
    '',
    metadata.name ||
    '',
    metadata.full_name ||
    '',
    user.email?.split('@')[0] ||
    `koki-${user.id.slice(0, 8)}`,
  ]
    .map((item) => String(item || '').trim())
    .find((item) => !isPlaceholderIdentity(item)) || `koki-${user.id.slice(0, 8)}`

  const safeCandidate = String(candidate)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)

  return safeCandidate.length >= 2 ? safeCandidate : `koki-${user.id.slice(0, 8)}`
}

function isPlaceholderIdentity(value?: string | null) {
  const normalized = String(value || '').trim().toLowerCase()
  return !normalized || ['john doe', 'johndoe', 'user', 'user cookedu', 'cookedu user'].includes(normalized)
}

function withUserSuffix(username: string, userId: string) {
  const base = username
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'koki'

  return `${base}-${userId.slice(0, 8)}`
}

function requiredEnv(key: string) {
  const value = Deno.env.get(key)
  if (!value) throw new HttpError(500, `${key} belum tersedia di Edge Function.`)
  return value
}

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}
