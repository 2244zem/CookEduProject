function cleanChefText(value: string) {
  return value
    .replace(/[*#]/g, '')
    .replace(/(^|\n)\s*-\s+/g, '$1')
    .replace(/-/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()
}

const knownIngredients = [
  'telur',
  'nasi',
  'ayam',
  'sapi',
  'ikan',
  'udang',
  'tahu',
  'tempe',
  'jamur',
  'bayam',
  'kangkung',
  'wortel',
  'kentang',
  'tomat',
  'cabai',
  'bawang putih',
  'bawang merah',
  'santan',
  'susu',
  'keju',
  'tepung',
  'mie',
  'pasta',
  'roti',
]

function detectIngredients(query: string) {
  return knownIngredients.filter((ingredient) => query.includes(ingredient)).slice(0, 5)
}

function ingredientSentence(items: string[]) {
  if (!items.length) return 'Aku belum menangkap bahan spesifik dari pesanmu.'
  return `Aku menangkap bahan utamanya: ${items.join(', ')}.`
}

export function buildLocalChefReply(prompt: string, displayName = 'Koki CookEdu') {
  const query = normalize(prompt)
  const name = displayName || 'Koki CookEdu'
  const ingredients = detectIngredients(query)
  const caught = ingredientSentence(ingredients)

  if (query.includes('substitusi') || query.includes('ganti') || query.includes('pengganti')) {
    return cleanChefText(`Aku jalankan CookEdu Brain, ${name}. ${caught} Untuk pengganti bahan, cari fungsi bahan aslinya dulu. Kalau bahan itu memberi lemak, pakai susu plus sedikit butter. Kalau memberi asin, pakai garam sedikit demi sedikit. Kalau memberi aroma, pakai bawang, jahe, daun jeruk, atau lada sesuai arah masakannya. Kirim bahan yang hilang dan resepnya, nanti aku pilihkan pengganti yang paling dekat.`)
  }

  if (query.includes('plating') || query.includes('cantik') || query.includes('hias')) {
    return cleanChefText(`Aku jalankan CookEdu Brain, ${name}. Untuk plating yang terasa lebih niat, pilih satu titik fokus, sisakan ruang kosong, lalu pakai warna kecil yang kontras. Saus cukup tipis agar makanan tidak tenggelam. Tekstur renyah masuk paling akhir supaya tetap hidup saat disajikan.`)
  }

  if (query.includes('kulkas') || query.includes('bahan') || ingredients.length > 0) {
    const route = ingredients.includes('telur') || ingredients.includes('nasi')
      ? 'Jalur paling aman adalah tumis cepat. Panaskan sedikit minyak, masukkan bawang, lalu bahan utama. Bumbui ringan dulu, baru koreksi rasa di akhir.'
      : 'Mulai dari bahan yang paling lama matang, lalu masukkan bahan lembut belakangan agar teksturnya tidak hilang.'

    return cleanChefText(`Aku jalankan CookEdu Brain, ${name}. ${caught} ${route} Kalau ingin terasa lebih matang rasanya, tambahkan satu elemen aroma, satu elemen gurih, dan satu tekstur akhir. Kirim semua isi kulkasmu, aku bisa ubah jadi menu yang lebih tepat.`)
  }

  if (query.includes('gagal') || query.includes('gosong') || query.includes('lembek') || query.includes('keras') || query.includes('kenapa')) {
    return cleanChefText(`Aku jalankan CookEdu Brain, ${name}. Biasanya masalah masakan datang dari panas terlalu tinggi, potongan bahan tidak rata, atau cairan masuk terlalu cepat. Kalau gosong di luar tapi belum matang, turunkan api dan beri waktu. Kalau lembek, kurangi cairan dan masukkan bahan cepat matang lebih akhir. Ceritakan tahap gagalnya, aku bantu bedah dari titik paling mungkin.`)
  }

  return cleanChefText(`Aku jalankan CookEdu Brain, ${name}. ${caught} Jawaban cepatku, mulai dari bahan yang ada, pilih teknik paling aman, lalu koreksi rasa di akhir. Siapkan bahan dulu, panaskan alat, masak bahan yang butuh waktu paling lama, baru masukkan bahan yang cepat matang. Kalau kamu kirim target resepnya, aku bisa bantu jadi langkah yang lebih presisi.`)
}

