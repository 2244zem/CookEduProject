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

const COIN_PACKAGES: Record<CoinPackageId, CoinPackage> = {
  starter: {
    id: 'starter',
    name: 'CookEdu Coin Starter',
    coins: 100,
    amount: 10000,
  },
  plus: {
    id: 'plus',
    name: 'CookEdu Coin Plus',
    coins: 275,
    amount: 25000,
  },
  pro: {
    id: 'pro',
    name: 'CookEdu Coin Pro',
    coins: 600,
    amount: 50000,
  },
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
    const action = String(body.action || '')

    if (action === 'qris-checkout') {
      return jsonResponse(await chargeQris(body, user))
    }

    if (action === 'bypass-success') {
      return jsonResponse(await bypassSuccess(body, user))
    }

    if (action === 'wallet-balance') {
      return jsonResponse({
        status: 'success',
        coin_balance: await walletBalance(user.id),
      })
    }

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
      first_name: String(body.customer_name || user.user_metadata?.username || user.email || 'CookEdu User'),
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
    if (!purchase) {
      throw new HttpError(404, 'Order koin tidak ditemukan untuk user aktif.')
    }

    if (purchase.status !== 'pending') {
      const balanceResult = await client.queryObject<{ coin_balance: number }>(
        `select coalesce(coin_balance, 0)::int as coin_balance
         from public.user_wallets
         where user_id = $1`,
        [user.id],
      )

      await client.queryArray('commit')
      return {
        status: 'success',
        order_id: purchase.order_id,
        purchase_status: purchase.status,
        coins_added: 0,
        coin_balance: Number(balanceResult.rows[0]?.coin_balance || 0),
      }
    }

    await client.queryObject(
      `update public.coin_purchases
       set status = 'settlement', updated_at = now()
       where order_id = $1 and user_id = $2 and status = 'pending'`,
      [purchase.order_id, user.id],
    )

    await client.queryObject(
      `insert into public.user_wallets (user_id, coin_balance)
       values ($1, $2)
       on conflict (user_id) do update
       set coin_balance = coalesce(public.user_wallets.coin_balance, 0) + excluded.coin_balance`,
      [user.id, Number(purchase.coin_amount || 0)],
    )

    const balanceResult = await client.queryObject<{ coin_balance: number }>(
      `select coalesce(coin_balance, 0)::int as coin_balance
       from public.user_wallets
       where user_id = $1`,
      [user.id],
    )

    await client.queryArray('commit')

    return {
      status: 'success',
      order_id: purchase.order_id,
      purchase_status: 'settlement',
      coins_added: Number(purchase.coin_amount || 0),
      coin_balance: Number(balanceResult.rows[0]?.coin_balance || 0),
    }
  } catch (error) {
    await client.queryArray('rollback').catch(() => undefined)
    throw error
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

async function walletBalance(userId: string) {
  const client = await dbPool.connect()

  try {
    const result = await client.queryObject<{ coin_balance: number }>(
      `select coalesce(coin_balance, 0)::int as coin_balance
       from public.user_wallets
       where user_id = $1`,
      [userId],
    )

    return Number(result.rows[0]?.coin_balance || 0)
  } finally {
    client.release()
  }
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
