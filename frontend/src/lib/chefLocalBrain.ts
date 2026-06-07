function cleanChefText(value: string) {
  return value
    .replace(/[*#]/g, '')
    .replace(/(^|\n)\s*[-•]\s+/g, '$1')
    .replace(/-/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()
}

export function buildLocalChefReply(prompt: string, displayName = 'Koki CookEdu') {
  const query = normalize(prompt)
  const name = displayName || 'Koki CookEdu'

  if (query.includes('substitusi') || query.includes('ganti') || query.includes('pengganti')) {
    return cleanChefText(`Aku pakai mode lokal dulu, ${name}. Untuk pengganti bahan, cari fungsi bahan aslinya. Kalau bahannya memberi lemak, pakai susu plus sedikit butter. Kalau memberi rasa asin, pakai garam sedikit demi sedikit. Kalau memberi aroma, pakai bawang, jahe, daun jeruk, atau lada sesuai arah masakannya. Kirim bahan yang hilang dan resepnya, nanti aku pilihkan pengganti yang paling dekat.`)
  }

  if (query.includes('plating') || query.includes('cantik') || query.includes('hias')) {
    return cleanChefText(`Aku pakai mode lokal dulu, ${name}. Untuk plating yang enak dilihat, pilih satu titik fokus, sisakan ruang kosong, lalu pakai warna kecil yang kontras. Saus cukup tipis agar makanan tidak tenggelam. Tekstur renyah masuk paling akhir supaya tetap hidup saat disajikan.`)
  }

  if (query.includes('kulkas') || query.includes('bahan') || query.includes('telur') || query.includes('nasi') || query.includes('ayam')) {
    return cleanChefText(`Aku pakai mode lokal dulu, ${name}. Dari bahan yang kamu punya, mulai dengan bahan utama, bumbu dasar, dan tekstur akhir. Kalau ada telur atau nasi, jalur paling aman adalah tumis cepat dengan bawang, garam sedikit, lada, lalu koreksi rasa di akhir. Kalau ada ayam, potong kecil agar matang merata dan jangan terlalu sering dibolak balik.`)
  }

  if (query.includes('gagal') || query.includes('gosong') || query.includes('lembek') || query.includes('keras') || query.includes('kenapa')) {
    return cleanChefText(`Aku pakai mode lokal dulu, ${name}. Biasanya masalah masakan datang dari panas terlalu tinggi, potongan bahan tidak rata, atau cairan masuk terlalu cepat. Kalau gosong di luar tapi belum matang, turunkan api dan beri waktu. Kalau lembek, kurangi cairan dan masukkan bahan cepat matang lebih akhir.`)
  }

  return cleanChefText(`Aku pakai mode lokal dulu, ${name}. Jawaban cepatku, mulai dari bahan yang ada, pilih teknik paling aman, lalu koreksi rasa di akhir. Siapkan bahan dulu, panaskan alat, masak bahan yang butuh waktu paling lama, baru masukkan bahan yang cepat matang. Kalau kamu kirim bahan atau target resepnya, aku bisa bantu lebih spesifik.`)
}

