# CookEdu Supabase Coins Function

Frontend pembayaran koin sekarang memanggil Supabase Edge Function `coins`, bukan endpoint Railway.

## Schema

Sebelum deploy function terbaru, jalankan SQL ini di Supabase SQL Editor:

```text
supabase_wallet_system.sql
```

File ini menyiapkan:

- `public.user_wallets`
- `public.coin_purchases`
- `public.wallet_transactions`
- `public.wallet_admin_audit_logs`

Script ini tidak mengubah tabel `recipes`.

## Secrets

Jangan commit Midtrans Server Key ke repository. Simpan di Supabase Function Secrets:

```bash
npx supabase secrets set MIDTRANS_SERVER_KEY=<midtrans-server-key> --project-ref lhjdwmkceagdtnexiuek
npx supabase secrets set MIDTRANS_IS_PRODUCTION=false --project-ref lhjdwmkceagdtnexiuek
```

Gunakan `MIDTRANS_IS_PRODUCTION=false` untuk sandbox dan tombol debug bypass. Jika diubah ke `true`, bypass otomatis ditolak.

## Deploy

```bash
npx supabase functions deploy coins --project-ref lhjdwmkceagdtnexiuek
```

Function ini memakai session Supabase aktif dari React, membaca saldo dari `public.user_wallets`, membuat pending purchase di `public.coin_purchases`, dan menjalankan bypass sukses dengan transaksi SQL langsung ke database Supabase.

## Function Actions

Function `coins` melayani:

- `qris-checkout`
- `bypass-success`
- `wallet-balance`
- `wallet-history`
- `claim-daily-reward`
- `spend-coins`
- `admin-search-users`
- `admin-give-coins`
- `admin-wallet-audit`
