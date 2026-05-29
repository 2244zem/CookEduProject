# 🍳 COOKEDU: The Smart Culinary Ecosystem

**CookEdu** bukan sekadar aplikasi resep biasa; ini adalah platform edukasi kuliner modern yang menggabungkan kecerdasan buatan (AI), psikologi desain (UI/UX), dan gamifikasi. Aplikasi ini dirancang untuk memandu pengguna dari pemula hingga menjadi *Master Chef* di dapur mereka sendiri.

## ✨ Fitur Utama (Core Features)
1. **Smart Weather Telemetry:** Aplikasi secara otomatis membaca cuaca di lokasi pengguna dan merekomendasikan masakan yang cocok (misalnya: sup hangat saat hujan, atau salad segar saat panas).
2. **AI Chef Assistant & Fridge Scanner:** Menggunakan AI untuk berinteraksi dengan pengguna dan merekomendasikan resep brilian hanya bermodalkan foto atau daftar sisa bahan makanan di kulkas.
3. **Gamification (Sistem XP & Leaderboard):** Pengguna mendapatkan poin (XP) setiap kali belajar modul atau memasak, yang akan menaikkan rank mereka di papan peringkat (*Leaderboard*) komunitas.
4. **Masterpiece UI/UX:** Menggunakan desain *Deep Ocean Glassmorphism* (efek kaca tembus pandang dengan latar belakang lautan dan animasi bioluminescent) yang memberikan kesan sangat premium, menenangkan, dan modern.
5. **CookShare & Catatan Ibu:** Jejaring sosial internal untuk membagikan hasil masakan, serta fitur untuk mencatat resep warisan keluarga.

---

# 💻 TEKNOLOGI YANG DIGUNAKAN (Tech Stack)

Aplikasi ini menggunakan arsitektur **Decoupled (Terpisah)**, di mana antarmuka pengguna (Frontend) dan logika server (Backend) dibangun menggunakan teknologi terbaik di kelasnya secara terpisah.

## Frontend (Sisi Klien / UI)
*   **React.js 19 & Vite:** Inti dari tampilan web yang sangat cepat dan reaktif.
*   **TypeScript:** Memastikan kode aman dari *bug* berkat sistem pengetikan (typing) yang ketat.
*   **TailwindCSS:** Sistem desain yang digunakan untuk membentuk efek *Glassmorphism*.
*   **Zustand:** Manajemen data lokal (seperti keranjang belanja dan status login) yang super ringan tanpa me-refresh halaman.
*   **Framer Motion:** Mesin pendorong semua animasi halus dan transisi sinematik di dalam aplikasi.

## Backend (Sisi Server & API)
*   **Laravel 11 (PHP):** *Framework* backend terkuat untuk menangani logika bisnis, autentikasi berbasis Token (Sanctum), dan manajemen API.
*   **PostgreSQL:** Database relasional (RDBMS) modern yang sangat tangguh untuk menyimpan data user, resep, dan progres belajar di server publik (Railway).
*   **Gemini AI API:** Model bahasa raksasa yang bertugas sebagai otak dari AI Assistant dan Fridge Scanner.

---

# 🚀 ARSITEKTUR DEVOPS & CLOUD INFRASTRUCTURE

Aplikasi CookEdu tidak di-hosting secara tradisional, melainkan menggunakan arsitektur modern berbasis Cloud yang memisahkan beban kerja agar lebih cepat dan tahan banting.

## 1. Konsep "Decoupled Deployment"
Frontend dan Backend ditaruh di server (penyedia) yang berbeda. Frontend ditaruh di **Cloudflare**, dan Backend ditaruh di **Railway**. 
*   **Keuntungannya:** Jika jutaan orang membuka web secara bersamaan, server Backend tidak akan kepanasan/down hanya karena harus melayani gambar atau tampilan web. Tugas berat UI murni ditangani oleh jaringan raksasa Cloudflare.

## 2. Frontend DevOps (Cloudflare Pages)
*   **Edge CDN (Content Delivery Network):** Cloudflare meng-copy file web React ke ribuan server mereka di seluruh benua. Jika ada pengguna di Jakarta yang membuka web Anda, mereka akan mengambil data dari server Cloudflare di Jakarta, bukan dari server asal. Ini membuat web terbuka dalam hitungan milidetik.
*   **CI/CD (Continuous Integration / Continuous Deployment):** Setiap kali ada pembaruan kode di GitHub, sistem Cloudflare otomatis mendeteksinya. Cloudflare akan mengambil kode, menjalankan proses `npm run build`, lalu menyebarkannya ke publik secara otomatis.
*   **Environment Injection:** Agar React tahu kemana dia harus meminta data (API), Cloudflare menyuntikkan variabel `VITE_API_URL` tepat di detik-detik sebelum aplikasi dibuild.

## 3. Backend & Database DevOps (Railway.app)
*   **PaaS (Platform as a Service) & Nixpacks:** Railway menggunakan sistem build canggih bernama Nixpacks. Saat Anda push kode Laravel Anda, Nixpacks otomatis membuat *virtual container*, meng-install PHP 8.2, mengunduh paket `composer`, dan menyalakan server Nginx/FrankenPHP secara mandiri.
*   **Database Provisioning:** Railway menyediakan *container* PostgreSQL terisolasi. Melalui menu *Variables*, Laravel milik Anda disambungkan ke database ini menggunakan kredensial rahasia (seperti `DB_HOST`, `DB_PASSWORD`).
*   **Automated Migrations:** Bagian dari CI/CD Laravel di Railway. Setiap kali ada pembaruan kode, Railway otomatis menjalankan perintah migrasi (`php artisan migrate --force`) untuk memastikan struktur tabel di database PostgreSQL selalu sama persis dengan kode terbaru.
*   **CORS (Cross-Origin Resource Sharing) Security:** Karena Backend (Railway) dan Frontend (Cloudflare) berbeda domain, secara *default* browser web akan memblokir komunikasi mereka demi keamanan. Namun, di konfigurasi Laravel, kita membuka gerbang (`CORS_ALLOWED_ORIGINS`) khusus untuk domain Cloudflare agar bisa membaca dan mengirim data.

Dengan setup level-produksi ini, **CookEdu** bukan hanya sekadar tugas sekolah, melainkan sebuah aplikasi berkelas *Enterprise* yang siap dipublikasikan ke publik.
