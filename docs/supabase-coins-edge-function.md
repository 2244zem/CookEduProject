# CookEdu Supabase Coins Function

Frontend pembayaran koin sekarang memanggil Supabase Edge Function `coins`, bukan endpoint Railway.

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
