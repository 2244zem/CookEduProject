// Asset Imports

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Nutrition {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Recipe {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  prepTime: string;
  difficulty: string;
  rating: number;
  reviews: number;
  description: string;
  calories: string;
  nutrition?: Nutrition;
  ingredients: Ingredient[];
  instructions: string[];
  motherNote?: string;
  createdBy: string;
  isEditable: boolean;
  tempRange?: { min: number; max: number };
}

export const recipes: Recipe[] = [
  {
    "id": 1,
    "title": "Ayam Goreng Lengkuas Gurih",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80",
    "prepTime": "45 Min",
    "difficulty": "Medium",
    "rating": 5,
    "reviews": 280,
    "description": "Ayam Goreng Lengkuas Gurih adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "420 Kcal",
    "nutrition": {
      "calories": "420 Kcal",
      "protein": "35g",
      "carbs": "12g",
      "fat": "28g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "1 kg"
      },
      {
        "name": "Lengkuas Parut",
        "quantity": "200 g"
      },
      {
        "name": "Bawang Putih",
        "quantity": "5 siung"
      },
      {
        "name": "Sereh",
        "quantity": "2 batang"
      },
      {
        "name": "Kunyit",
        "quantity": "2 cm"
      },
      {
        "name": "Garam Dapur",
        "quantity": "1.5 sdt"
      }
    ],
    "instructions": [
      "Haluskan bawang putih, kunyit, and garam dapur, lalu lumuri ke daging ayam.",
      "Campurkan parutan lengkuas and sereh memar ke dalam ayam yang dimarinasi.",
      "Ungkep ayam bersama bumbu di atas api kecil hingga air menyusut and bumbu meresap.",
      "Panaskan minyak goreng, lalu goreng ayam and remahan lengkuas secara terpisah hingga kuning keemasan.",
      "Tiriskan and sajikan dengan taburan remahan lengkuas renyah di atasnya."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 2,
    "title": "Soto Ayam Kuah Bening",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=600&q=80",
    "prepTime": "40 Min",
    "difficulty": "Medium",
    "rating": 4.8,
    "reviews": 59,
    "description": "Soto Ayam Kuah Bening adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "310 Kcal",
    "nutrition": {
      "calories": "310 Kcal",
      "protein": "28g",
      "carbs": "15g",
      "fat": "14g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "500 g"
      },
      {
        "name": "Bawang Merah",
        "quantity": "12 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "8 siung"
      },
      {
        "name": "Daun Jeruk",
        "quantity": "4 lembar"
      },
      {
        "name": "Daun Salam",
        "quantity": "2 lembar"
      },
      {
        "name": "Sereh",
        "quantity": "2 batang"
      },
      {
        "name": "Merica / Lada",
        "quantity": "1 sdt"
      }
    ],
    "instructions": [
      "Rebus daging ayam dalam air mendidih untuk membuat kuah kaldu dasar.",
      "Haluskan bawang merah, bawang putih, kunyit, and merica, lalu tumis hingga harum.",
      "Masukkan tumisan bumbu, daun jeruk, daun salam, and sereh ke dalam rebusan kaldu ayam.",
      "Angkat ayam, suwir-suwir dagingnya, lalu masukkan kembali tulang ke dalam kuah.",
      "Sajikan kuah soto panas bersama suwiran ayam, soun, and irisan seledri."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 3,
    "title": "Rendang Sapi Minang",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80",
    "prepTime": "180 Min",
    "difficulty": "Hard",
    "rating": 5,
    "reviews": 275,
    "description": "Rendang Sapi Minang adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "465 Kcal",
    "nutrition": {
      "calories": "465 Kcal",
      "protein": "38g",
      "carbs": "10g",
      "fat": "32g"
    },
    "ingredients": [
      {
        "name": "Daging Sapi",
        "quantity": "1 kg"
      },
      {
        "name": "Santan Kelapa",
        "quantity": "1000 ml"
      },
      {
        "name": "Bawang Merah",
        "quantity": "15 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "10 siung"
      },
      {
        "name": "Cabai Merah Besar",
        "quantity": "200 g"
      },
      {
        "name": "Lengkuas",
        "quantity": "5 cm"
      },
      {
        "name": "Jahe",
        "quantity": "3 cm"
      }
    ],
    "instructions": [
      "Potong daging sapi searah serat setebal 1.5 cm agar tidak mudah hancur.",
      "Haluskan bawang merah, bawang putih, cabai, jahe, and lengkuas.",
      "Rebus santan bersama bumbu halus and daun-daun aromatik hingga mengeluarkan minyak.",
      "Masukkan potongan daging sapi, kecilkan api, lalu aduk perlahan secara berkala.",
      "Masak terus hingga kuah mengering and bumbu berubah menjadi cokelat gelap berkaramel."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 4,
    "title": "Nasi Goreng Kampung Spesial",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    "prepTime": "15 Min",
    "difficulty": "Easy",
    "rating": 4.9,
    "reviews": 142,
    "description": "Nasi Goreng Kampung Spesial adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "510 Kcal",
    "nutrition": {
      "calories": "510 Kcal",
      "protein": "14g",
      "carbs": "68g",
      "fat": "19g"
    },
    "ingredients": [
      {
        "name": "Beras Putih",
        "quantity": "2 piring"
      },
      {
        "name": "Telur Ayam",
        "quantity": "2 butir"
      },
      {
        "name": "Bawang Merah",
        "quantity": "5 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Cabai Rawit",
        "quantity": "5 buah"
      },
      {
        "name": "Terasi Bakar",
        "quantity": "1 sdt"
      },
      {
        "name": "Kecap Manis",
        "quantity": "2 sdm"
      }
    ],
    "instructions": [
      "Ulek kasar bawang merah, bawang putih, cabai rawit, and terasi bakar.",
      "Tumis bumbu ulek dalam minyak panas hingga beraroma matang.",
      "Sisihkan bumbu ke pinggir wajan, masukkan telur, lalu buat orak-arik hingga kaku.",
      "Masukkan nasi putih pera (dingin), aduk merata bersama bumbu and telur.",
      "Tambahkan kecap manis and garam, besarkan api wajan, aduk cepat hingga beras terasa berasap."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 5,
    "title": "Sate Ayam Madura",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80",
    "prepTime": "35 Min",
    "difficulty": "Medium",
    "rating": 4.8,
    "reviews": 517,
    "description": "Sate Ayam Madura adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "390 Kcal",
    "nutrition": {
      "calories": "390 Kcal",
      "protein": "32g",
      "carbs": "18g",
      "fat": "22g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "500 g"
      },
      {
        "name": "Kemiri",
        "quantity": "4 butir"
      },
      {
        "name": "Bawang Putih",
        "quantity": "5 siung"
      },
      {
        "name": "Kecap Manis",
        "quantity": "5 sdm"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "2 sdm"
      }
    ],
    "instructions": [
      "Potong dadu daging ayam, lalu tusuk menggunakan lidi sate.",
      "Haluskan bumbu kacang dasar, campur dengan sedikit air and kecap manis.",
      "Lumuri tusukan sate ayam dengan sebagian bumbu kacang and kecap manis.",
      "Bakar sate di atas bara api sambil dibolak-balik hingga matang merata.",
      "Sajikan sate ayam dengan siraman sisa bumbu kacang, irisan bawang merah, and cabai."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 6,
    "title": "Gado-Gado Siram Betawi",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "prepTime": "25 Min",
    "difficulty": "Easy",
    "rating": 4.7,
    "reviews": 296,
    "description": "Gado-Gado Siram Betawi adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "318 Kcal",
    "nutrition": {
      "calories": "318 Kcal",
      "protein": "12g",
      "carbs": "34g",
      "fat": "16g"
    },
    "ingredients": [
      {
        "name": "Kentang",
        "quantity": "2 buah"
      },
      {
        "name": "Tahu Putih/Kuning",
        "quantity": "2 kotak"
      },
      {
        "name": "Tempe",
        "quantity": "1 papan"
      },
      {
        "name": "Bayam",
        "quantity": "1 ikat"
      },
      {
        "name": "Wortel",
        "quantity": "1 buah"
      },
      {
        "name": "Gula Merah / Jawa",
        "quantity": "50 g"
      }
    ],
    "instructions": [
      "Rebus kentang, bayam, and wortel potong secara terpisah hingga empuk.",
      "Goreng tahu and tempe hingga matang, lalu potong-potong sesuai selera.",
      "Ulek cabai, gula merah, garam, and kacang tanah goreng, lalu larutkan dengan air asam.",
      "Tata sayuran rebus serta potongan tahu and tempe di atas piring saji.",
      "Siramkan bumbu kacang kental ke atas sayuran tepat sebelum disajikan."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 7,
    "title": "Bakso Sapi Kuah Sumsum",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80",
    "prepTime": "60 Min",
    "difficulty": "Hard",
    "rating": 4.9,
    "reviews": 474,
    "description": "Bakso Sapi Kuah Sumsum adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "350 Kcal",
    "nutrition": {
      "calories": "350 Kcal",
      "protein": "24g",
      "carbs": "20g",
      "fat": "18g"
    },
    "ingredients": [
      {
        "name": "Daging Cincang",
        "quantity": "500 g"
      },
      {
        "name": "Tepung Tapioka",
        "quantity": "100 g"
      },
      {
        "name": "Bawang Putih",
        "quantity": "6 siung"
      },
      {
        "name": "Merica / Lada",
        "quantity": "1 sdt"
      },
      {
        "name": "Garam Dapur",
        "quantity": "2 sdt"
      }
    ],
    "instructions": [
      "Haluskan daging cincang dingin bersama bawang putih, merica, and garam dapur.",
      "Campurkan tepung tapioka ke dalam adonan daging, uleni hingga kalis.",
      "Bentuk adonan menjadi bulatan menggunakan tangan, lalu masukkan ke air hangat.",
      "Rebus bulatan bakso hingga mengapung sebagai tanda sudah matang.",
      "Buat kuah terpisah dari rebusan tulang sumsum sapi and bumbu bawang putih goreng."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 8,
    "title": "Gulai Kambing Rempah",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "prepTime": "90 Min",
    "difficulty": "Hard",
    "rating": 4.6,
    "reviews": 352,
    "description": "Gulai Kambing Rempah adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "480 Kcal",
    "nutrition": {
      "calories": "480 Kcal",
      "protein": "36g",
      "carbs": "12g",
      "fat": "33g"
    },
    "ingredients": [
      {
        "name": "Daging Sapi",
        "quantity": "500 g"
      },
      {
        "name": "Santan Kelapa",
        "quantity": "600 ml"
      },
      {
        "name": "Bawang Merah",
        "quantity": "10 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "6 siung"
      },
      {
        "name": "Ketumbar",
        "quantity": "1 sdm"
      },
      {
        "name": "Kayu Manis",
        "quantity": "3 cm"
      }
    ],
    "instructions": [
      "Tumis bumbu halus gulai bersama kayu manis and ketumbar hingga wangi minyak.",
      "Masukkan potongan daging kambing/sapi, aduk hingga berubah warna.",
      "Tuangkan santan encer terlebih dahulu, masak hingga daging mulai melunak.",
      "Tambahkan santan kental, kecilkan api agar santan tidak pecah.",
      "Masak hingga bumbu meresap dalam kuah and tekstur daging empuk sempurna."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 9,
    "title": "Opor Ayam Kampung Lebaran",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=600&q=80",
    "prepTime": "50 Min",
    "difficulty": "Medium",
    "rating": 4.9,
    "reviews": 487,
    "description": "Opor Ayam Kampung Lebaran adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "410 Kcal",
    "nutrition": {
      "calories": "410 Kcal",
      "protein": "30g",
      "carbs": "11g",
      "fat": "28g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "1 kg"
      },
      {
        "name": "Santan Kelapa",
        "quantity": "750 ml"
      },
      {
        "name": "Bawang Putih",
        "quantity": "6 siung"
      },
      {
        "name": "Kemiri",
        "quantity": "5 butir"
      },
      {
        "name": "Ketumbar",
        "quantity": "1 sdt"
      },
      {
        "name": "Sereh",
        "quantity": "2 batang"
      }
    ],
    "instructions": [
      "Haluskan bawang putih, kemiri, and ketumbar, lalu tumis bersama sereh.",
      "Masukkan potongan ayam kampung, aduk bersama bumbu tumis hingga kaku.",
      "Tuangkan santan kelapa secara bertahap sambil terus diaduk rata.",
      "Bumbui dengan garam and sedikit gula pasir sesuai selera.",
      "Masak dengan api sedang hingga kuah opor sedikit mengental and ayam empuk."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 10,
    "title": "Sayur Asem Segar Jawa",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Easy",
    "rating": 4.7,
    "reviews": 354,
    "description": "Sayur Asem Segar Jawa adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "120 Kcal",
    "nutrition": {
      "calories": "120 Kcal",
      "protein": "3g",
      "carbs": "26g",
      "fat": "1g"
    },
    "ingredients": [
      {
        "name": "Jagung Manis",
        "quantity": "1 buah"
      },
      {
        "name": "Kentang",
        "quantity": "1 buah"
      },
      {
        "name": "Kangkung",
        "quantity": "1 ikat"
      },
      {
        "name": "Bawang Merah",
        "quantity": "5 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Cabai Merah Besar",
        "quantity": "2 buah"
      }
    ],
    "instructions": [
      "Didihkan air di dalam panci, masukkan potongan jagung manis terlebih dahulu.",
      "Iris tipis bawang merah, bawang putih, and cabai merah besar.",
      "Masukkan irisan bumbu bumbu dapur and buah asam jawa ke dalam panci.",
      "Tambahkan sisa sayuran pendukung lainnya, masak hingga layu.",
      "Angkat and sajikan kuah sayur asem dalam kondisi hangat segar."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 11,
    "title": "Ayam Bakar Taliwang",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80",
    "prepTime": "50 Min",
    "difficulty": "Medium",
    "rating": 4.8,
    "reviews": 128,
    "description": "Ayam Bakar Taliwang adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "385 Kcal",
    "nutrition": {
      "calories": "385 Kcal",
      "protein": "34g",
      "carbs": "8g",
      "fat": "24g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "1 kg"
      },
      {
        "name": "Cabai Rawit",
        "quantity": "15 buah"
      },
      {
        "name": "Bawang Merah",
        "quantity": "8 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "4 siung"
      },
      {
        "name": "Terasi Bakar",
        "quantity": "1.5 sdt"
      }
    ],
    "instructions": [
      "Haluskan cabai rawit, bawang merah, bawang putih, and terasi bakar.",
      "Tumis bumbu halus hingga matang, lalu gunakan untuk melumuri ayam.",
      "Panggang atau bakar ayam di atas bara api setengah matang.",
      "Olesi kembali ayam dengan sisa bumbu taliwang secara merata.",
      "Bakar kembali hingga kulit luar ayam sedikit berkaramel kering."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 12,
    "title": "Pepes Ikan Mas Daun Kemangi",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    "prepTime": "45 Min",
    "difficulty": "Medium",
    "rating": 4.6,
    "reviews": 549,
    "description": "Pepes Ikan Mas Daun Kemangi adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "260 Kcal",
    "nutrition": {
      "calories": "260 Kcal",
      "protein": "24g",
      "carbs": "6g",
      "fat": "16g"
    },
    "ingredients": [
      {
        "name": "Ikan Segar",
        "quantity": "2 ekor"
      },
      {
        "name": "Bawang Merah",
        "quantity": "6 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "4 siung"
      },
      {
        "name": "Kunyit",
        "quantity": "3 cm"
      },
      {
        "name": "Daun Jeruk",
        "quantity": "4 lembar"
      },
      {
        "name": "Daun Salam",
        "quantity": "2 lembar"
      }
    ],
    "instructions": [
      "Bersihkan ikan segar, lalu kerat bagian badannya agar bumbu masuk.",
      "Campurkan bumbu halus kunyit dengan daun kemangi segar.",
      "Balurkan bumbu ke seluruh tubuh ikan, bungkus rapi dengan daun pisang.",
      "Kukus bungkusan pepes ikan selama 30 menit hingga matang.",
      "Bakar sebentar bungkus pisang di atas teflon untuk aroma smokey."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 13,
    "title": "Capcay Goreng Seafood",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Easy",
    "rating": 4.8,
    "reviews": 501,
    "description": "Capcay Goreng Seafood adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "245 Kcal",
    "nutrition": {
      "calories": "245 Kcal",
      "protein": "18g",
      "carbs": "14g",
      "fat": "12g"
    },
    "ingredients": [
      {
        "name": "Udang",
        "quantity": "150 g"
      },
      {
        "name": "Cumi-cumi",
        "quantity": "100 g"
      },
      {
        "name": "Wortel",
        "quantity": "1 buah"
      },
      {
        "name": "Brokoli",
        "quantity": "100 g"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Saus Tiram",
        "quantity": "2 sdm"
      }
    ],
    "instructions": [
      "Tumis bawang putih cincang hingga kekuningan di dalam wajan.",
      "Masukkan udang and cumi-cumi segar, masak hingga berubah warna.",
      "Tambahkan potongan wortel and brokoli, beri sedikit air.",
      "Bubuhi saus tiram, garam, and merica lada bubuk.",
      "Masak cepat dengan api besar hingga sayuran matang renyah."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 14,
    "title": "Sambal Goreng Ati Ampela",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "prepTime": "30 Min",
    "difficulty": "Medium",
    "rating": 4.7,
    "reviews": 338,
    "description": "Sambal Goreng Ati Ampela adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "340 Kcal",
    "nutrition": {
      "calories": "340 Kcal",
      "protein": "22g",
      "carbs": "10g",
      "fat": "24g"
    },
    "ingredients": [
      {
        "name": "Kentang",
        "quantity": "300 g"
      },
      {
        "name": "Cabai Merah Besar",
        "quantity": "100 g"
      },
      {
        "name": "Bawang Merah",
        "quantity": "8 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "4 siung"
      },
      {
        "name": "Santan Kelapa",
        "quantity": "150 ml"
      }
    ],
    "instructions": [
      "Potong dadu kentang lalu goreng hingga berkulit kering basah.",
      "Rebus ati ampela, potong ukuran serupa, kemudian goreng sebentar.",
      "Tumis bumbu cabai merah halus bersama daun salam hingga matang tanak.",
      "Tuangkan santan, masukkan kentang and ati ampela goreng.",
      "Masak menggunakan api kecil hingga kuah menyusut kering meresap."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 15,
    "title": "Tahu Tempe Bacem Jogja",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    "prepTime": "40 Min",
    "difficulty": "Easy",
    "rating": 4.7,
    "reviews": 108,
    "description": "Tahu Tempe Bacem Jogja adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "210 Kcal",
    "nutrition": {
      "calories": "210 Kcal",
      "protein": "14g",
      "carbs": "28g",
      "fat": "6g"
    },
    "ingredients": [
      {
        "name": "Tahu Putih/Kuning",
        "quantity": "5 kotak"
      },
      {
        "name": "Tempe",
        "quantity": "1 papan"
      },
      {
        "name": "Gula Merah / Jawa",
        "quantity": "100 g"
      },
      {
        "name": "Bawang Merah",
        "quantity": "6 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Ketumbar",
        "quantity": "1 sdt"
      }
    ],
    "instructions": [
      "Haluskan bawang merah, bawang putih, and ketumbar bubuk.",
      "Tata tahu and tempe di dalam panci, tuangkan bumbu halus and air kelapa.",
      "Masukkan sisiran gula merah jawa and daun salam ke dalam rebusan.",
      "Rebus dengan api kecil hingga air habis bumbu meresap sempurna.",
      "Goreng tahu tempe sebentar saja dalam minyak panas sebelum dihidangkan."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 16,
    "title": "Perkedel Kentang Daging Sapi",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    "prepTime": "25 Min",
    "difficulty": "Easy",
    "rating": 4.8,
    "reviews": 378,
    "description": "Perkedel Kentang Daging Sapi adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "190 Kcal",
    "nutrition": {
      "calories": "190 Kcal",
      "protein": "8g",
      "carbs": "22g",
      "fat": "9g"
    },
    "ingredients": [
      {
        "name": "Kentang",
        "quantity": "500 g"
      },
      {
        "name": "Daging Cincang",
        "quantity": "50 g"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Telur Ayam",
        "quantity": "1 butir"
      },
      {
        "name": "Merica / Lada",
        "quantity": "0.5 sdt"
      }
    ],
    "instructions": [
      "Kupas kentang, potong tebal lalu goreng hingga matang empuk.",
      "Haluskan kentang selagi panas, campur dengan daging cincang matang.",
      "Tambahkan bawang putih goreng haluskan, merica lada, and garam.",
      "Bentuk adonan menjadi bulat pipih merata menggunakan tangan.",
      "Celupkan ke kocokan telur ayam, lalu goreng dalam minyak panas."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 17,
    "title": "Sayur Lodeh Rame-Rame",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    "prepTime": "30 Min",
    "difficulty": "Easy",
    "rating": 4.6,
    "reviews": 184,
    "description": "Sayur Lodeh Rame-Rame adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "230 Kcal",
    "nutrition": {
      "calories": "230 Kcal",
      "protein": "6g",
      "carbs": "19g",
      "fat": "16g"
    },
    "ingredients": [
      {
        "name": "Santan Kelapa",
        "quantity": "500 ml"
      },
      {
        "name": "Wortel",
        "quantity": "1 buah"
      },
      {
        "name": "Tahu Putih/Kuning",
        "quantity": "2 kotak"
      },
      {
        "name": "Bawang Merah",
        "quantity": "6 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Lengkuas",
        "quantity": "2 cm"
      }
    ],
    "instructions": [
      "Iris tipis duo bawang, tumis sebentar bersama lengkuas memar.",
      "Tuangkan santan ke panci, didihkan perlahan agar minyak tidak pecah.",
      "Masukkan sayuran wortel and potongan tahu putih ke kuah santan.",
      "Bumbui garam dapur serta sedikit gula merah jawa penyedap rasa.",
      "Masak hingga seluruh tekstur sayuran empuk terkuah rata."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 18,
    "title": "Ayam Rica-Rica Kemangi",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80",
    "prepTime": "35 Min",
    "difficulty": "Medium",
    "rating": 4.9,
    "reviews": 401,
    "description": "Ayam Rica-Rica Kemangi adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "395 Kcal",
    "nutrition": {
      "calories": "395 Kcal",
      "protein": "33g",
      "carbs": "7g",
      "fat": "26g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "1 kg"
      },
      {
        "name": "Cabai Rawit",
        "quantity": "20 buah"
      },
      {
        "name": "Bawang Merah",
        "quantity": "10 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "4 siung"
      },
      {
        "name": "Daun Jeruk",
        "quantity": "6 lembar"
      }
    ],
    "instructions": [
      "Potong ayam ukuran agak kecil, goreng setengah matang tiriskan.",
      "Tumbuk kasar cabai rawit, bawang merah, and bawang putih dapur.",
      "Tumis bumbu pedas kasar bersama daun jeruk disobek harum matang.",
      "Masukkan ayam, beri sedikit air hangat kuku biar meresap dalam.",
      "Sesaat sebelum diangkat, campurkan daun kemangi aduk cepat rata."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 19,
    "title": "Gulai Tambusu Minang",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    "prepTime": "75 Min",
    "difficulty": "Hard",
    "rating": 4.5,
    "reviews": 494,
    "description": "Gulai Tambusu Minang adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "490 Kcal",
    "nutrition": {
      "calories": "490 Kcal",
      "protein": "26g",
      "carbs": "12g",
      "fat": "38g"
    },
    "ingredients": [
      {
        "name": "Telur Ayam",
        "quantity": "6 butir"
      },
      {
        "name": "Santan Kelapa",
        "quantity": "500 ml"
      },
      {
        "name": "Bawang Merah",
        "quantity": "8 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "4 siung"
      },
      {
        "name": "Kemiri",
        "quantity": "4 butir"
      }
    ],
    "instructions": [
      "Kocok telur ayam dengan bumbu bawang putih halus, sisihkan.",
      "Isikan kocokan telur ke dalam usus sapi bersih, ikat kedua ujungnya.",
      "Rebus usus isi telur (tambusu) hingga mengembang padat keras.",
      "Buat kuah gulai kental with santan and bumbu halus minang.",
      "Masukkan potongan tambusu rebus ke dalam kuah gulai hingga berminyak."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 20,
    "title": "Soto Betawi Susu Asli",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80",
    "prepTime": "50 Min",
    "difficulty": "Medium",
    "rating": 4.9,
    "reviews": 237,
    "description": "Soto Betawi Susu Asli adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "430 Kcal",
    "nutrition": {
      "calories": "430 Kcal",
      "protein": "32g",
      "carbs": "14g",
      "fat": "27g"
    },
    "ingredients": [
      {
        "name": "Daging Sapi",
        "quantity": "500 g"
      },
      {
        "name": "Susu Cair UHT",
        "quantity": "500 ml"
      },
      {
        "name": "Bawang Merah",
        "quantity": "10 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "5 siung"
      },
      {
        "name": "Kayu Manis",
        "quantity": "2 cm"
      }
    ],
    "instructions": [
      "Rebus daging sapi hingga empuk, potong dadu, sisihkan kuah kaldunya.",
      "Tumis bumbu halus bersama kayu manis and cengkeh harum.",
      "Masukkan bumbu tumis ke dalam air rebusan kaldu daging sapi asli.",
      "Tuangkan susu cair UHT secara perlahan sembari diaduk rata konsisten.",
      "Sajikan semangkok soto with potongan tomat segar and emping melinjo."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 21,
    "title": "Nasi Uduk Betawi Wangi",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80",
    "prepTime": "30 Min",
    "difficulty": "Easy",
    "rating": 4.8,
    "reviews": 198,
    "description": "Nasi Uduk Betawi Wangi adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "380 Kcal",
    "nutrition": {
      "calories": "380 Kcal",
      "protein": "7g",
      "carbs": "65g",
      "fat": "11g"
    },
    "ingredients": [
      {
        "name": "Beras Putih",
        "quantity": "3 piring"
      },
      {
        "name": "Santan Kelapa",
        "quantity": "400 ml"
      },
      {
        "name": "Sereh",
        "quantity": "2 batang"
      },
      {
        "name": "Daun Salam",
        "quantity": "3 lembar"
      },
      {
        "name": "Garam Dapur",
        "quantity": "1 sdt"
      }
    ],
    "instructions": [
      "Cuci bersih beras putih, masukkan ke dalam panci penanak nasi.",
      "Rebus santan bersama sereh memar, daun salam, and garam hingga mendidih.",
      "Tuangkan rebusan santan harum ke dalam wadah beras putih.",
      "Aduk rata beras lalu masak menggunakan rice cooker hingga matang aron.",
      "Buka rice cooker, aduk memutar pelan agar nasi uduk pulen merata."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 22,
    "title": "Cumi Tumis Cabai Hijau",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Easy",
    "rating": 4.7,
    "reviews": 105,
    "description": "Cumi Tumis Cabai Hijau adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "290 Kcal",
    "nutrition": {
      "calories": "290 Kcal",
      "protein": "24g",
      "carbs": "8g",
      "fat": "18g"
    },
    "ingredients": [
      {
        "name": "Cumi-cumi",
        "quantity": "500 g"
      },
      {
        "name": "Bawang Merah",
        "quantity": "6 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Daun Jeruk",
        "quantity": "3 lembar"
      },
      {
        "name": "Tomat Segar",
        "quantity": "1 buah"
      }
    ],
    "instructions": [
      "Potong cumi-cumi bersih melingkar seperti cincin, lumuri jeruk nipis.",
      "Iris serong tipis cabai hijau besar and duo bawang dapur.",
      "Tumis irisan bumbu bersama daun jeruk disobek sampai wangi layu.",
      "Masukkan cumi potongan, masak cepat with api besar agar tidak alot.",
      "Tambahkan garam masakan serta potongan tomat segar tiriskan."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 23,
    "title": "Sambal Udang Balado Padang",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1559847844-5315b943ad75?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Easy",
    "rating": 4.9,
    "reviews": 348,
    "description": "Sambal Udang Balado Padang adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "310 Kcal",
    "nutrition": {
      "calories": "310 Kcal",
      "protein": "26g",
      "carbs": "9g",
      "fat": "19g"
    },
    "ingredients": [
      {
        "name": "Udang",
        "quantity": "400 g"
      },
      {
        "name": "Cabai Merah Besar",
        "quantity": "100 g"
      },
      {
        "name": "Bawang Merah",
        "quantity": "8 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Garam Dapur",
        "quantity": "1 sdt"
      }
    ],
    "instructions": [
      "Goreng udang kupas bersih dalam minyak panas sebentar, tiriskan.",
      "Ulek kasar cabai merah besar bersama bawang merah melimpah.",
      "Tumis sambal kasar dalam minyak sisa menggoreng udang.",
      "Bumbui garam dapur aduk sambal hingga minyak berwarna merah jernih.",
      "Campurkan udang goreng ke dalam balado matang kompor matikan."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 24,
    "title": "Gulai Daun Singkong Teri",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    "prepTime": "30 Min",
    "difficulty": "Easy",
    "rating": 4.6,
    "reviews": 292,
    "description": "Gulai Daun Singkong Teri adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "240 Kcal",
    "nutrition": {
      "calories": "240 Kcal",
      "protein": "9g",
      "carbs": "16g",
      "fat": "17g"
    },
    "ingredients": [
      {
        "name": "Santan Kelapa",
        "quantity": "400 ml"
      },
      {
        "name": "Bawang Merah",
        "quantity": "6 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Kunyit",
        "quantity": "2 cm"
      },
      {
        "name": "Lengkuas",
        "quantity": "2 cm"
      }
    ],
    "instructions": [
      "Rebus daun singkong hingga lunak, peras airnya, potong kasar.",
      "Haluskan bumbu gulai dasar lalu tumis bareng lengkuas geprek.",
      "Tuangkan santan encer ke panci disusul daun singkong rebus.",
      "Masukkan segenggam ikan teri medan asin gurih ke masakan.",
      "Tambahkan santan kental aduk rata hingga gulai matang mendidih."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 25,
    "title": "Ayam Kalasan Manis Gurih",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80",
    "prepTime": "45 Min",
    "difficulty": "Medium",
    "rating": 4.8,
    "reviews": 146,
    "description": "Ayam Kalasan Manis Gurih adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "390 Kcal",
    "nutrition": {
      "calories": "390 Kcal",
      "protein": "32g",
      "carbs": "15g",
      "fat": "22g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "1 kg"
      },
      {
        "name": "Gula Merah / Jawa",
        "quantity": "80 g"
      },
      {
        "name": "Bawang Putih",
        "quantity": "6 siung"
      },
      {
        "name": "Ketumbar",
        "quantity": "1 sdm"
      },
      {
        "name": "Daun Salam",
        "quantity": "3 lembar"
      }
    ],
    "instructions": [
      "Ungkep potongan ayam bersama bumbu halus putih and air kelapa asli.",
      "Masukkan sisiran gula merah jawa melimpah serta daun salam panci.",
      "Masak ayam menggunakan api kecil hingga kuah menyusut pekat kecokelatan.",
      "Goreng kilat ayam kalasan manis dalam minyak sangat panas sekejap.",
      "Tiriskan ayam jangan sampai gosong akibat kandungan gula merah tinggi."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 26,
    "title": "Sate Lilit Ayam Bali",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80",
    "prepTime": "35 Min",
    "difficulty": "Medium",
    "rating": 4.9,
    "reviews": 371,
    "description": "Sate Lilit Ayam Bali adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "280 Kcal",
    "nutrition": {
      "calories": "280 Kcal",
      "protein": "24g",
      "carbs": "9g",
      "fat": "16g"
    },
    "ingredients": [
      {
        "name": "Daging Cincang",
        "quantity": "400 g"
      },
      {
        "name": "Santan Kelapa",
        "quantity": "50 ml"
      },
      {
        "name": "Sereh",
        "quantity": "10 batang"
      },
      {
        "name": "Bawang Merah",
        "quantity": "6 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      }
    ],
    "instructions": [
      "Tumis bumbu base genep bali cincang halus hingga matang tanak.",
      "Campurkan bumbu bali matang, daging cincang ayam, and santan kental.",
      "Aduk adonan sate lilit sampai berserat lengket terikat satu.",
      "Ambil kepalan adonan, lilitkan memutar pada batang sereh bagian pangkal.",
      "Panggang sate lilit di atas wajan datar teflon hingga harum matang."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 27,
    "title": "Gulai Paku / Pakis Padang",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    "prepTime": "30 Min",
    "difficulty": "Easy",
    "rating": 4.7,
    "reviews": 405,
    "description": "Gulai Paku / Pakis Padang adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "210 Kcal",
    "nutrition": {
      "calories": "210 Kcal",
      "protein": "5g",
      "carbs": "14g",
      "fat": "16g"
    },
    "ingredients": [
      {
        "name": "Santan Kelapa",
        "quantity": "500 ml"
      },
      {
        "name": "Bawang Merah",
        "quantity": "6 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Kunyit",
        "quantity": "3 cm"
      },
      {
        "name": "Daun Jeruk",
        "quantity": "3 lembar"
      }
    ],
    "instructions": [
      "Haluskan bumbu kunyit kuning padang tumis kilat dalam panci gulai.",
      "Tuangkan santan segar kelapa, aduk perlahan agar kuah stabil rata.",
      "Masukkan potongan sayur pakis hijau segar pilihan terbaik.",
      "Bumbui garam dapur asam kandis penyeimbang rasa kuah gulai.",
      "Masak sebentar hingga daun pakis matang tanpa kehilangan tekstur renyah."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 28,
    "title": "Rawon Daging Sapi Blitar",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80",
    "prepTime": "90 Min",
    "difficulty": "Hard",
    "rating": 5,
    "reviews": 405,
    "description": "Rawon Daging Sapi Blitar adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "410 Kcal",
    "nutrition": {
      "calories": "410 Kcal",
      "protein": "34g",
      "carbs": "11g",
      "fat": "26g"
    },
    "ingredients": [
      {
        "name": "Daging Sapi",
        "quantity": "500 g"
      },
      {
        "name": "Bawang Merah",
        "quantity": "10 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "5 siung"
      },
      {
        "name": "Daun Jeruk",
        "quantity": "4 lembar"
      },
      {
        "name": "Sereh",
        "quantity": "2 batang"
      }
    ],
    "instructions": [
      "Rebus kluwek hitam tanpa cangkang air hangat ulek halus bumbu.",
      "Tumis bumbu rawon hitam bersama daun jeruk sereh wangi pekat.",
      "Masukkan potongan daging sapi rawon aduk bumbu kuah menyatu rasa.",
      "Tuangkan air kaldu rebusan daging masak api kecil empuk menyusut.",
      "Sajikan sup hitam rawon khas jawa timur taburan kecambah pendek."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 29,
    "title": "Ayam Tangtang Pedas Kemangi",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80",
    "prepTime": "35 Min",
    "difficulty": "Medium",
    "rating": 4.6,
    "reviews": 518,
    "description": "Ayam Tangtang Pedas Kemangi adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "370 Kcal",
    "nutrition": {
      "calories": "370 Kcal",
      "protein": "31g",
      "carbs": "6g",
      "fat": "24g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "1 kg"
      },
      {
        "name": "Cabai Rawit",
        "quantity": "15 buah"
      },
      {
        "name": "Bawang Merah",
        "quantity": "8 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "4 siung"
      },
      {
        "name": "Daun Jeruk",
        "quantity": "4 lembar"
      }
    ],
    "instructions": [
      "Suwir kasar ayam rebus matang empuk wadah terpisah kumpulkan.",
      "Ulek kasar bumbu cabai rawit pedas mampus bawang merah putih.",
      "Tumis bumbu kasar harum layu berminyak kental wajan masak.",
      "Masukkan suwiran daging ayam aduk tercampur bumbu meresap rata.",
      "Tambahkan daun kemangi segar wangi aduk layu angkat sajikan."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 30,
    "title": "Soto Kudus Kerbau Bening",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=600&q=80",
    "prepTime": "60 Min",
    "difficulty": "Medium",
    "rating": 4.8,
    "reviews": 484,
    "description": "Soto Kudus Kerbau Bening adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "330 Kcal",
    "nutrition": {
      "calories": "330 Kcal",
      "protein": "29g",
      "carbs": "12g",
      "fat": "16g"
    },
    "ingredients": [
      {
        "name": "Daging Sapi",
        "quantity": "500 g"
      },
      {
        "name": "Bawang Merah",
        "quantity": "10 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "6 siung"
      },
      {
        "name": "Ketumbar",
        "quantity": "1 sdt"
      },
      {
        "name": "Daun Salam",
        "quantity": "2 lembar"
      }
    ],
    "instructions": [
      "Rebus daging sapi/kerbau kuah kaldu jernih saring kotoran atas panci.",
      "Tumis bumbu halus putih ketumbar wangi matang tanak dapur.",
      "Masukkan bumbu ke kuah kaldu rebusan daging bumbui garam masakan.",
      "Suwir-suwir daging kerbau matang tipis wadah saji terpisah.",
      "Sajikan kuah soto bening mangkok kecil taburan bawang putih goreng."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 31,
    "title": "Nasi Goreng Kambing Kebon Sirih",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    "prepTime": "25 Min",
    "difficulty": "Medium",
    "rating": 4.9,
    "reviews": 250,
    "description": "Nasi Goreng Kambing Kebon Sirih adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "580 Kcal",
    "nutrition": {
      "calories": "580 Kcal",
      "protein": "22g",
      "carbs": "70g",
      "fat": "24g"
    },
    "ingredients": [
      {
        "name": "Beras Putih",
        "quantity": "2 piring"
      },
      {
        "name": "Daging Sapi",
        "quantity": "150 g"
      },
      {
        "name": "Bawang Merah",
        "quantity": "6 siung"
      },
      {
        "name": "Kecap Manis",
        "quantity": "3 sdm"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "2 sdm"
      }
    ],
    "instructions": [
      "Tumis bumbu kari rempah bubuk minyak goreng wangi harum melimpah.",
      "Masukkan potongan daging kambing/sapi tipis masak matang berubah warna.",
      "Masukkan nasi putih pera dingin aduk cepat bumbu tercampur rata.",
      "Kucurkan kecap manis garam dapur penyedap rasa aduk wajan panas.",
      "Angkat sajikan nasi goreng kambing harum minyak samin emping."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 32,
    "title": "Mie Goreng Jawa Tek-Tek",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
    "prepTime": "15 Min",
    "difficulty": "Easy",
    "rating": 4.7,
    "reviews": 426,
    "description": "Mie Goreng Jawa Tek-Tek adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "460 Kcal",
    "nutrition": {
      "calories": "460 Kcal",
      "protein": "12g",
      "carbs": "62g",
      "fat": "18g"
    },
    "ingredients": [
      {
        "name": "Pasta / Spaghetti",
        "quantity": "200 g"
      },
      {
        "name": "Telur Ayam",
        "quantity": "1 butir"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Kemiri",
        "quantity": "2 butir"
      },
      {
        "name": "Kecap Manis",
        "quantity": "3 sdm"
      }
    ],
    "instructions": [
      "Haluskan bawang putih kemiri lada bulat tumis wajan harum.",
      "Orak-arik telur ayam pinggir bumbu tumis matang kaku terpisah.",
      "Masukkan mie kuning rebus kol hijau sawi potong acak.",
      "Tambahkan kecap manis garam dapur kaldu bubuk aduk merata.",
      "Masak sebentar hingga kuah menyusut mie goreng jawa basah siap."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 33,
    "title": "Ayam Woku Belanga Manado",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80",
    "prepTime": "40 Min",
    "difficulty": "Medium",
    "rating": 4.8,
    "reviews": 319,
    "description": "Ayam Woku Belanga Manado adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "390 Kcal",
    "nutrition": {
      "calories": "390 Kcal",
      "protein": "33g",
      "carbs": "8g",
      "fat": "25g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "1 kg"
      },
      {
        "name": "Bawang Merah",
        "quantity": "10 siung"
      },
      {
        "name": "Cabai Rawit",
        "quantity": "15 buah"
      },
      {
        "name": "Daun Jeruk",
        "quantity": "6 lembar"
      },
      {
        "name": "Daun Bawang",
        "quantity": "2 batang"
      }
    ],
    "instructions": [
      "Haluskan bumbu kuning pedas woku tumis wajan aroma segar.",
      "Masukkan potongan ayam bersih aduk bumbu melumuri seluruh daging.",
      "Tuangkan sedikit air hangat masak api sedang bumbu woku meresap.",
      "Masukkan irisan daun bawang tomat hijau potong acak segar daun.",
      "Terakhir masukkan daun kemangi aduk layu kuah woku kental angkat."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 34,
    "title": "Gulai Kepala Ikan Kakap",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    "prepTime": "50 Min",
    "difficulty": "Hard",
    "rating": 4.9,
    "reviews": 315,
    "description": "Gulai Kepala Ikan Kakap adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "420 Kcal",
    "nutrition": {
      "calories": "420 Kcal",
      "protein": "28g",
      "carbs": "13g",
      "fat": "29g"
    },
    "ingredients": [
      {
        "name": "Ikan Segar",
        "quantity": "1 kg"
      },
      {
        "name": "Santan Kelapa",
        "quantity": "600 ml"
      },
      {
        "name": "Bawang Merah",
        "quantity": "10 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "5 siung"
      },
      {
        "name": "Lengkuas",
        "quantity": "3 cm"
      }
    ],
    "instructions": [
      "Cuci bersih kepala ikan kakap belah dua kucuri jeruk nipis.",
      "Tumis bumbu halus padang minyak kelapa lengkuas sereh memar harum.",
      "Tuangkan santan encer didihkan panci masukkan kepala kakap segar.",
      "Tambahkan daun ruku-ruku asam kandis garam dapur penyedap rasa padang.",
      "Tuang santan kental siram kuah kepala ikan kakap berminyak matang."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 35,
    "title": "Sambal Goreng Krecek Pedas",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    "prepTime": "35 Min",
    "difficulty": "Medium",
    "rating": 4.7,
    "reviews": 464,
    "description": "Sambal Goreng Krecek Pedas adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "310 Kcal",
    "nutrition": {
      "calories": "310 Kcal",
      "protein": "14g",
      "carbs": "18g",
      "fat": "22g"
    },
    "ingredients": [
      {
        "name": "Santan Kelapa",
        "quantity": "300 ml"
      },
      {
        "name": "Bawang Merah",
        "quantity": "6 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Cabai Rawit",
        "quantity": "10 buah"
      },
      {
        "name": "Gula Merah / Jawa",
        "quantity": "30 g"
      }
    ],
    "instructions": [
      "Tumis bumbu merah krecek halus ketumbar bubuk wajan harum matang.",
      "Tuangkan santan cair kelapa aduk bumbu merata panci mendidih.",
      "Masukkan krecek kulit sapi kering tahu pong potong kotak dadu.",
      "Tambahkan cabai rawit utuh bulat gula merah jawa penyeimbang rasa.",
      "Masak api kecil kuah santan krecek meresap berminyak kemerahan siap."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 36,
    "title": "Tongseng Sapi Solo Bumbu Iris",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "prepTime": "40 Min",
    "difficulty": "Medium",
    "rating": 4.8,
    "reviews": 344,
    "description": "Tongseng Sapi Solo Bumbu Iris adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "440 Kcal",
    "nutrition": {
      "calories": "440 Kcal",
      "protein": "30g",
      "carbs": "14g",
      "fat": "29g"
    },
    "ingredients": [
      {
        "name": "Daging Sapi",
        "quantity": "400 g"
      },
      {
        "name": "Kubis / Kol",
        "quantity": "100 g"
      },
      {
        "name": "Bawang Merah",
        "quantity": "8 siung"
      },
      {
        "name": "Kecap Manis",
        "quantity": "4 sdm"
      },
      {
        "name": "Tomat Segar",
        "quantity": "2 buah"
      }
    ],
    "instructions": [
      "Tumis irisan bawang merah putih bumbu gulai sisa kemarin harum.",
      "Masukkan potongan daging sapi tipis oseng matang kaku berubah warna.",
      "Tambahkan air kuah gulai encer kecap manis garam dapur secukupnya.",
      "Masukkan irisan kol putih tomat merah segar potong dadu kasar.",
      "Masak cepat kol layu kuah tongseng manis pedas gurih siap."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 37,
    "title": "Ayam Goreng Kalasan Kremes",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80",
    "prepTime": "45 Min",
    "difficulty": "Medium",
    "rating": 4.9,
    "reviews": 424,
    "description": "Ayam Goreng Kalasan Kremes adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "430 Kcal",
    "nutrition": {
      "calories": "430 Kcal",
      "protein": "33g",
      "carbs": "18g",
      "fat": "27g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "1 kg"
      },
      {
        "name": "Tepung Tapioka",
        "quantity": "50 g"
      },
      {
        "name": "Bawang Putih",
        "quantity": "5 siung"
      },
      {
        "name": "Santan Kelapa",
        "quantity": "200 ml"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "500 ml"
      }
    ],
    "instructions": [
      "Ungkep ayam bumbu putih kalasan air kaldu saring kumpulkan sisa.",
      "Buat adonan kremesan encer tepung tapioka sisa air ungkepan kaldu.",
      "Goreng ayam kalasan tiriskan minyak panci bersihkan remahan awal.",
      "Kucurkan adonan kremes memutar minyak panas tinggi bersarang indah.",
      "Balut ayam kalasan goreng renyahan kremes kriuk gurih piring."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 38,
    "title": "Gulai Kikil Sapi Padang",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
    "prepTime": "60 Min",
    "difficulty": "Hard",
    "rating": 4.8,
    "reviews": 126,
    "description": "Gulai Kikil Sapi Padang adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "390 Kcal",
    "nutrition": {
      "calories": "390 Kcal",
      "protein": "24g",
      "carbs": "10g",
      "fat": "28g"
    },
    "ingredients": [
      {
        "name": "Santan Kelapa",
        "quantity": "500 ml"
      },
      {
        "name": "Bawang Merah",
        "quantity": "8 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "4 siung"
      },
      {
        "name": "Kunyit",
        "quantity": "3 cm"
      },
      {
        "name": "Lengkuas",
        "quantity": "3 cm"
      }
    ],
    "instructions": [
      "Rebus kikil tunjang sapi air jahe empuk kenyal potong dadu.",
      "Tumis bumbu gulai minang kuning daun kunyit asam kandis harum.",
      "Tuangkan santan encer kental masukan potongan kikil kenyal padang.",
      "Bumbui garam dapur kaldu bubuk masak api kecil kuah berminyak.",
      "Angkat sajikan gulai kikil tunjang sapi padang nasi hangat masakan."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 39,
    "title": "Sambal Lalap Ayam Penyit",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Easy",
    "rating": 4.9,
    "reviews": 283,
    "description": "Sambal Lalap Ayam Penyit adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "395 Kcal",
    "nutrition": {
      "calories": "395 Kcal",
      "protein": "32g",
      "carbs": "5g",
      "fat": "27g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "500 g"
      },
      {
        "name": "Tomat Segar",
        "quantity": "2 buah"
      },
      {
        "name": "Cabai Rawit",
        "quantity": "15 buah"
      },
      {
        "name": "Terasi Bakar",
        "quantity": "1 sdt"
      },
      {
        "name": "Bawang Merah",
        "quantity": "5 siung"
      }
    ],
    "instructions": [
      "Goreng ayam ungkep kuning garing kriuk tiriskan minyak wadah.",
      "Goreng layu sebentar cabai rawit bawang merah tomat terasi cobek.",
      "Ulek halus sambal penyet beri garam dapur perasan jeruk limau.",
      "Letakkan ayam goreng garing atas sambal cobek penyet memar daging.",
      "Sajikan langsung ayam penyet lalapan timun kol mentah segar."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 40,
    "title": "Soto Banjar Kuah Susu Rempah",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80",
    "prepTime": "50 Min",
    "difficulty": "Medium",
    "rating": 4.7,
    "reviews": 210,
    "description": "Soto Banjar Kuah Susu Rempah adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "360 Kcal",
    "nutrition": {
      "calories": "360 Kcal",
      "protein": "29g",
      "carbs": "16g",
      "fat": "18g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "500 g"
      },
      {
        "name": "Bawang Putih",
        "quantity": "8 siung"
      },
      {
        "name": "Kayu Manis",
        "quantity": "4 cm"
      },
      {
        "name": "Susu Cair UHT",
        "quantity": "200 ml"
      },
      {
        "name": "Telur Ayam",
        "quantity": "3 butir"
      }
    ],
    "instructions": [
      "Rebus ayam kampung pala kapulaga kayu manis sup wangi jernih.",
      "Haluskan bawang putih kenari tumis matang masukkan kuah sup banjar.",
      "Tuangkan susu cair UHT kentalkan kuah sedikit bumbui garam merica.",
      "Suwir ayam rebus tata mangkok soun perkedel kentang potongan telur.",
      "Siram kuah soto banjar panas kucuri jeruk nipis peras harum."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 41,
    "title": "Nasi Liwet Sunda Gurih Peda",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80",
    "prepTime": "30 Min",
    "difficulty": "Easy",
    "rating": 4.8,
    "reviews": 187,
    "description": "Nasi Liwet Sunda Gurih Peda adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "410 Kcal",
    "nutrition": {
      "calories": "410 Kcal",
      "protein": "11g",
      "carbs": "67g",
      "fat": "12g"
    },
    "ingredients": [
      {
        "name": "Beras Putih",
        "quantity": "3 piring"
      },
      {
        "name": "Bawang Merah",
        "quantity": "8 siung"
      },
      {
        "name": "Sereh",
        "quantity": "3 batang"
      },
      {
        "name": "Daun Salam",
        "quantity": "4 lembar"
      },
      {
        "name": "Cabai Rawit",
        "quantity": "10 buah"
      }
    ],
    "instructions": [
      "Cuci beras masukkan katel castrol liwet kastrol aluminium air pas.",
      "Tumis irisan bawang merah putih sereh daun salam layu wangi.",
      "Masukkan tumisan bumbu minyaknya cabai rawit utuh wadah beras liwet.",
      "Tata ikan asin peda goreng atas permukaan beras bumbui sedikit garam.",
      "Masak api kecil tutup rapat nasi liwet sunda gurih berkerak matang."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 42,
    "title": "Cumi Asin Sambal Ijo Pete",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Easy",
    "rating": 4.9,
    "reviews": 149,
    "description": "Cumi Asin Sambal Ijo Pete adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "320 Kcal",
    "nutrition": {
      "calories": "320 Kcal",
      "protein": "22g",
      "carbs": "7g",
      "fat": "21g"
    },
    "ingredients": [
      {
        "name": "Cumi-cumi",
        "quantity": "300 g"
      },
      {
        "name": "Cabai Merah Besar",
        "quantity": "100 g"
      },
      {
        "name": "Bawang Merah",
        "quantity": "8 siung"
      },
      {
        "name": "Tomat Segar",
        "quantity": "2 buah"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "4 sdm"
      }
    ],
    "instructions": [
      "Seduh cumi asin air panas kurangi asin berlebih potong ring tiriskan.",
      "Ulek kasar cabai hijau bawang merah tomat hijau rebus sebentar.",
      "Tumis sambal hijau minyak melimpah masukkan daun jeruk harum layu.",
      "Masukkan cumi asin potongan pete kupas segar belah dua wajan.",
      "Masak api sedang garam dapur sedikit gula penyeimbang rasa siap."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 43,
    "title": "Udang Saus Padang Pedas",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1559847844-5315b943ad75?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Easy",
    "rating": 4.8,
    "reviews": 417,
    "description": "Udang Saus Padang Pedas adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "295 Kcal",
    "nutrition": {
      "calories": "295 Kcal",
      "protein": "25g",
      "carbs": "14g",
      "fat": "13g"
    },
    "ingredients": [
      {
        "name": "Udang",
        "quantity": "500 g"
      },
      {
        "name": "Bawang Bombay",
        "quantity": "1 buah"
      },
      {
        "name": "Saus Tomat",
        "quantity": "3 sdm"
      },
      {
        "name": "Saus Sambal",
        "quantity": "3 sdm"
      },
      {
        "name": "Saus Tiram",
        "quantity": "1 sdm"
      }
    ],
    "instructions": [
      "Tumis bawang bombay cincang bawang putih halus jahe memar harum.",
      "Masukkan udang bersih masak kulit luar berubah warna oranye cerah.",
      "Tambahkan saus tomat saus sambal pedas saus tiram aduk rata wajan.",
      "Tuangkan sedikit air kocokan telur ayam serabut kuah saus kental.",
      "Masak cepat irisan daun bawang layu saus padang meresap angkat."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 44,
    "title": "Gulai Kacang Panjang Tetelan",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    "prepTime": "35 Min",
    "difficulty": "Medium",
    "rating": 4.6,
    "reviews": 460,
    "description": "Gulai Kacang Panjang Tetelan adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "340 Kcal",
    "nutrition": {
      "calories": "340 Kcal",
      "protein": "18g",
      "carbs": "12g",
      "fat": "26g"
    },
    "ingredients": [
      {
        "name": "Daging Cincang",
        "quantity": "200 g"
      },
      {
        "name": "Santan Kelapa",
        "quantity": "400 ml"
      },
      {
        "name": "Bawang Merah",
        "quantity": "6 siung"
      },
      {
        "name": "Kunyit",
        "quantity": "2 cm"
      },
      {
        "name": "Lengkuas",
        "quantity": "2 cm"
      }
    ],
    "instructions": [
      "Rebus tetelan daging sapi air kaldu gurih berlemak panci tampung.",
      "Tumis bumbu gulai padang halus lengkuas daun mangkok harum matang.",
      "Tuangkan santan rebus bersama tetelan sapi aduk mendidih stabil.",
      "Masukkan potongan kacang panjang ukuran jempol jari masak melunak.",
      "Bumbui garam dapur kaldu bubuk secukupnya gulai padang kental siap."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 45,
    "title": "Ayam Bakar Madu Legit",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80",
    "prepTime": "45 Min",
    "difficulty": "Medium",
    "rating": 4.9,
    "reviews": 70,
    "description": "Ayam Bakar Madu Legit adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "410 Kcal",
    "nutrition": {
      "calories": "410 Kcal",
      "protein": "33g",
      "carbs": "19g",
      "fat": "21g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "1 kg"
      },
      {
        "name": "Madu Murni",
        "quantity": "5 sdm"
      },
      {
        "name": "Kecap Manis",
        "quantity": "2 sdm"
      },
      {
        "name": "Bawang Putih",
        "quantity": "5 siung"
      },
      {
        "name": "Ketumbar",
        "quantity": "1 sdt"
      }
    ],
    "instructions": [
      "Ungkep bumbu bawang putih ayam halus ketumbar air sedikit meresap.",
      "Buat bumbu olesan wadah terpisah madu murni kecap manis mentega cair.",
      "Balurkan bumbu madu legit rata seluruh permukaan ayam ungkep.",
      "Panggang atas teflon bara api bolak balik olesi madu berulang.",
      "Bakar warna permukaan cokelat karamel manis legit wangi angkat."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 46,
    "title": "Sate Padang Kuah Kuning Rempah",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80",
    "prepTime": "60 Min",
    "difficulty": "Hard",
    "rating": 4.9,
    "reviews": 464,
    "description": "Sate Padang Kuah Kuning Rempah adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "360 Kcal",
    "nutrition": {
      "calories": "360 Kcal",
      "protein": "28g",
      "carbs": "22g",
      "fat": "16g"
    },
    "ingredients": [
      {
        "name": "Daging Sapi",
        "quantity": "500 g"
      },
      {
        "name": "Tepung Tapioka",
        "quantity": "50 g"
      },
      {
        "name": "Bawang Merah",
        "quantity": "10 siung"
      },
      {
        "name": "Kunyit",
        "quantity": "4 cm"
      },
      {
        "name": "Sereh",
        "quantity": "2 batang"
      }
    ],
    "instructions": [
      "Rebus lidah daging sapi bumbu kunyit rempah padang kapulaga empuk.",
      "Potong tipis kotak daging tusuk lidi sate bakar teflon sekejap.",
      "Saring air kaldu sisa rebusan daging panaskan kembali panci masak.",
      "Larutkan tepung beras tapioka air masukkan perlahan kaldu kental.",
      "Siram kuah kental kuning panas sate padang taburan bawang goreng."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 47,
    "title": "Sayur Bobor Bayam Santan",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Easy",
    "rating": 4.5,
    "reviews": 461,
    "description": "Sayur Bobor Bayam Santan adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "180 Kcal",
    "nutrition": {
      "calories": "180 Kcal",
      "protein": "4g",
      "carbs": "12g",
      "fat": "14g"
    },
    "ingredients": [
      {
        "name": "Bayam",
        "quantity": "2 ikat"
      },
      {
        "name": "Santan Kelapa",
        "quantity": "300 ml"
      },
      {
        "name": "Bawang Merah",
        "quantity": "5 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "2 siung"
      },
      {
        "name": "Ketumbar",
        "quantity": "0.5 sdt"
      }
    ],
    "instructions": [
      "Haluskan bawang merah bawang putih ketumbar kencur dapur wadah ulek.",
      "Didihkan santan encer bumbu halus daun salam lengkuas memar panci.",
      "Masukkan potongan labu siam kentang terlebih dahulu empuk matang.",
      "Masukkan daun bayam hijau segar bumbui garam dapur gula pasir halus.",
      "Masak sebentar bayam matang layu kuah gurih bobor jawa saji."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 48,
    "title": "Rawon Kikil Surabaya Medokan",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80",
    "prepTime": "75 Min",
    "difficulty": "Hard",
    "rating": 4.8,
    "reviews": 382,
    "description": "Rawon Kikil Surabaya Medokan adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "420 Kcal",
    "nutrition": {
      "calories": "420 Kcal",
      "protein": "26g",
      "carbs": "9g",
      "fat": "29g"
    },
    "ingredients": [
      {
        "name": "Bawang Merah",
        "quantity": "10 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "5 siung"
      },
      {
        "name": "Daun Jeruk",
        "quantity": "5 lembar"
      },
      {
        "name": "Sereh",
        "quantity": "2 batang"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "3 sdm"
      }
    ],
    "instructions": [
      "Rebus kikil sapi air garam jahe empuk kenyal potong kotak dadu.",
      "Tumis bumbu kluwek hitam pekat rawon daun jeruk purut sereh wangi.",
      "Masukkan potongan kikil kenyal aduk rata bumbu kuah meresap hitam.",
      "Tuangkan air kaldu rebusan kikil encer masak api kecil tanak pekat.",
      "Sajikan rawon kikil surabaya sambal terasi perasan jeruk nipis toko."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 49,
    "title": "Ayam Goreng Pemuda Surabaya",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80",
    "prepTime": "40 Min",
    "difficulty": "Medium",
    "rating": 4.9,
    "reviews": 205,
    "description": "Ayam Goreng Pemuda Surabaya adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "440 Kcal",
    "nutrition": {
      "calories": "440 Kcal",
      "protein": "34g",
      "carbs": "6g",
      "fat": "29g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "1 kg"
      },
      {
        "name": "Bawang Putih",
        "quantity": "8 siung"
      },
      {
        "name": "Ketumbar",
        "quantity": "1 sdm"
      },
      {
        "name": "Kunyit",
        "quantity": "3 cm"
      },
      {
        "name": "Garam Dapur",
        "quantity": "2 sdt"
      }
    ],
    "instructions": [
      "Haluskan bumbu ketumbar kunyit bawang putih melimpah marinasi ayam.",
      "Ungkep ayam bersama bumbu air sedikit bumbu meresap kulit tulang.",
      "Panaskan minyak goreng jumlah banyak goreng ayam terendam garing.",
      "Masak bumbu remahan sisa ungkepan minyak panas terpisah garing emas.",
      "Tiriskan ayam goreng kampung pemuda surabaya taburan bumbu asin."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 50,
    "title": "Soto Lamongan Koya Melimpah",
    "category": "MASAKAN INDONESIA",
    "imageUrl": "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=600&q=80",
    "prepTime": "45 Min",
    "difficulty": "Medium",
    "rating": 5,
    "reviews": 307,
    "description": "Soto Lamongan Koya Melimpah adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.",
    "calories": "365 Kcal",
    "nutrition": {
      "calories": "365 Kcal",
      "protein": "30g",
      "carbs": "14g",
      "fat": "17g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "1 kg"
      },
      {
        "name": "Bawang Merah",
        "quantity": "10 siung"
      },
      {
        "name": "Bawang Putih",
        "quantity": "6 siung"
      },
      {
        "name": "Kemiri",
        "quantity": "4 butir"
      },
      {
        "name": "Merica / Lada",
        "quantity": "1 sdt"
      }
    ],
    "instructions": [
      "Rebus ayam bumbu kuah soto kuning kunyit sereh kaldu gurih panci.",
      "Tumbuk halus kerupuk udang bawang putih goreng jadikan bubuk koya.",
      "Angkat ayam rebus goreng tiriskan suwir tipis serat memanjang piring.",
      "Tata mangkok soun kol suwiran ayam siram kuah kuning soto panas.",
      "Taburkan bubuk koya kental melimpah soto lamongan asli siap santap."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 60,
      "max": 90
    }
  },
  {
    "id": 51,
    "title": "Classic French Crêpes Stack",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1598214309191-23d24e93bb27?auto=format&fit=crop&w=600&q=80",
    "prepTime": "15 Min",
    "difficulty": "Easy",
    "rating": 4.9,
    "reviews": 338,
    "description": "Classic French Crêpes Stack adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "240 Kcal",
    "nutrition": {
      "calories": "240 Kcal",
      "protein": "7g",
      "carbs": "32g",
      "fat": "9g"
    },
    "ingredients": [
      {
        "name": "Suku Cair UHT",
        "quantity": "0.4 glass"
      },
      {
        "name": "Telur Ayam",
        "quantity": "3 butir"
      },
      {
        "name": "Tepung Terigu",
        "quantity": "0.2 glass"
      },
      {
        "name": "Gula Pasir",
        "quantity": "1 C à S"
      },
      {
        "name": "Vanilla",
        "quantity": "1 C à C"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "1 C à S"
      },
      {
        "name": "Garam Dapur",
        "quantity": "1 pinch"
      }
    ],
    "instructions": [
      "Campurkan tepung terigu ayak bersama telur ayam gula pasir garam wadah.",
      "Tuangkan susu cair UHT secara perlahan bertahap aduk balon whisk rata.",
      "Masukkan vanila minyak goreng cair aduk adonan crepes mulus rata.",
      "Istirahatkan adonan crepes sejenak lemari es sebelum proses masak panci.",
      "Panaskan pan datar oles mentega dadar adonan tipis balik matang 1-2 menit."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 52,
    "title": "Creamy Tomato Spaghetti Fettuccine",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "prepTime": "25 Min",
    "difficulty": "Easy",
    "rating": 4.7,
    "reviews": 461,
    "description": "Creamy Tomato Spaghetti Fettuccine adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "380 Kcal",
    "nutrition": {
      "calories": "380 Kcal",
      "protein": "12g",
      "carbs": "54g",
      "fat": "14g"
    },
    "ingredients": [
      {
        "name": "Pasta / Spaghetti",
        "quantity": "250 g"
      },
      {
        "name": "Cooking Cream",
        "quantity": "100 ml"
      },
      {
        "name": "Saus Tomat",
        "quantity": "4 sdm"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Keju Parmesan",
        "quantity": "20 g"
      }
    ],
    "instructions": [
      "Rebus pasta spaghetti air garam mendidih sampai al dente tiriskan.",
      "Tumis bawang putih cincang halus mentega butter wajan harum matang.",
      "Tuangkan saus tomat pasta cooking cream kental aduk saus rata krim.",
      "Masukkan spaghetti rebus ke dalam saus creamy tomato aduk memutar.",
      "Sajikan piring mewah taburan keju parmesan parut lada hitam bubuk."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 53,
    "title": "Premium Beef Striploin Steak",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Medium",
    "rating": 5,
    "reviews": 59,
    "description": "Premium Beef Striploin Steak adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "540 Kcal",
    "nutrition": {
      "calories": "540 Kcal",
      "protein": "42g",
      "carbs": "0g",
      "fat": "38g"
    },
    "ingredients": [
      {
        "name": "Daging Sapi",
        "quantity": "300 g"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "30 g"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Garam Dapur",
        "quantity": "1 sdt"
      },
      {
        "name": "Merica / Lada",
        "quantity": "1 sdt"
      }
    ],
    "instructions": [
      "Keringkan permukaan daging sapi steak tissue bumbui garam lada hitam kasar.",
      "Panaskan pan cast iron minyak sedikit hingga berasap steak letakkan.",
      "Sear daging sapi menit per sisi bentuk crust cokelat luar garing.",
      "Masukkan mentega butter bawang putih geprek rosemary basting kontinyu sendok.",
      "Angkat steak diamkan papan talenan resting 5 menit potong juicy saji."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 54,
    "title": "Classic Caesar Salad Crispy",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "prepTime": "10 Min",
    "difficulty": "Easy",
    "rating": 4.6,
    "reviews": 491,
    "description": "Classic Caesar Salad Crispy adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "210 Kcal",
    "nutrition": {
      "calories": "210 Kcal",
      "protein": "6g",
      "carbs": "8g",
      "fat": "18g"
    },
    "ingredients": [
      {
        "name": "Selada / Lettuce",
        "quantity": "200 g"
      },
      {
        "name": "Keju Parmesan",
        "quantity": "15 g"
      },
      {
        "name": "Roti Tawar",
        "quantity": "1 lembar"
      },
      {
        "name": "Bawang Putih",
        "quantity": "1 siung"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "2 sdm"
      }
    ],
    "instructions": [
      "Cuci bersih selada romaine lettuce air es potong sobek kasar keringkan.",
      "Potong dadu roti tawar sangrai teflon mentega crouton garing renyah.",
      "Campurkan saus caesar mayo dressing kuning telur bawang putih lumat.",
      "Wadah besar mangkok aduk selada dressing caesar merata seluruh daun.",
      "Sajikan piring taburan crouton garing parutan keju parmesan tipis."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 55,
    "title": "Creamy Mushroom Soup Velvet",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Easy",
    "rating": 4.8,
    "reviews": 72,
    "description": "Creamy Mushroom Soup Velvet adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "260 Kcal",
    "nutrition": {
      "calories": "260 Kcal",
      "protein": "5g",
      "carbs": "18g",
      "fat": "19g"
    },
    "ingredients": [
      {
        "name": "Jamur Champignon",
        "quantity": "250 g"
      },
      {
        "name": "Cooking Cream",
        "quantity": "150 ml"
      },
      {
        "name": "Bawang Bombay",
        "quantity": "0.5 buah"
      },
      {
        "name": "Tepung Terigu",
        "quantity": "1 sdm"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "2 sdm"
      }
    ],
    "instructions": [
      "Tumis irisan bawang bombay jamur champignon mentega butter wajan layu.",
      "Tambahkan tepung terigu aduk cepat roux dasar pengental sup krim.",
      "Tuangkan air kaldu ayam aduk rata blender halus sup jamur wadah.",
      "Kembalikan panci tuang cooking cream kental bumbui garam lada bubuk.",
      "Masak sup mendidih halus beludru sajikan roti panggang kering cocol."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 56,
    "title": "Fettuccine Carbonara Authentic",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "prepTime": "15 Min",
    "difficulty": "Medium",
    "rating": 4.9,
    "reviews": 151,
    "description": "Fettuccine Carbonara Authentic adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "490 Kcal",
    "nutrition": {
      "calories": "490 Kcal",
      "protein": "18g",
      "carbs": "48g",
      "fat": "22g"
    },
    "ingredients": [
      {
        "name": "Pasta / Spaghetti",
        "quantity": "200 g"
      },
      {
        "name": "Telur Ayam",
        "quantity": "2 butir"
      },
      {
        "name": "Smoked Beef / Daging Asap",
        "quantity": "3 lembar"
      },
      {
        "name": "Keju Parmesan",
        "quantity": "30 g"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "1 sdm"
      }
    ],
    "instructions": [
      "Rebus fettuccine air garam al dente wadah mangkok campur kuning telur keju.",
      "Tumis potongan smoked beef beef bacon pan kering garing garing renyah.",
      "Masukkan pasta fettuccine panas ke wajan matikan api kompor utama.",
      "Tuangkan adonan telur keju parmesan aduk cepat sisa panas pasta kental.",
      "Pastikan saus carbonara mengental creamy alami tanpa cream tambahan saji."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 57,
    "title": "Crispy Fish and Chips London",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    "prepTime": "25 Min",
    "difficulty": "Easy",
    "rating": 4.7,
    "reviews": 380,
    "description": "Crispy Fish and Chips London adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "430 Kcal",
    "nutrition": {
      "calories": "430 Kcal",
      "protein": "22g",
      "carbs": "38g",
      "fat": "20g"
    },
    "ingredients": [
      {
        "name": "Ikan Segar",
        "quantity": "300 g"
      },
      {
        "name": "Kentang",
        "quantity": "2 buah"
      },
      {
        "name": "Tepung Terigu",
        "quantity": "100 g"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "400 ml"
      },
      {
        "name": "Susu Cair UHT",
        "quantity": "50 ml"
      }
    ],
    "instructions": [
      "Potong kentang memanjang wedges rendam air asin goreng kering chips sisihkan.",
      "Buat adonan tepung basah terigu sedikit soda air dingin susu uht kental.",
      "Balut filet ikan dori kakap tepung kering lalu celup adonan basah.",
      "Goreng ikan minyak banyak deep fry kuning keemasan garing renyah luar.",
      "Sajikan fish chips saus tartar jeruk lemon peras pinggir piring."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 58,
    "title": "Classic Beef Burger Diner",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Easy",
    "rating": 4.8,
    "reviews": 310,
    "description": "Classic Beef Burger Diner adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "520 Kcal",
    "nutrition": {
      "calories": "520 Kcal",
      "protein": "28g",
      "carbs": "36g",
      "fat": "26g"
    },
    "ingredients": [
      {
        "name": "Daging Cincang",
        "quantity": "150 g"
      },
      {
        "name": "Roti Tawar",
        "quantity": "1 bun"
      },
      {
        "name": "Keju Cheddar",
        "quantity": "1 slice"
      },
      {
        "name": "Bawang Bombay",
        "quantity": "0.2 buah"
      },
      {
        "name": "Tomat Segar",
        "quantity": "2 irisan"
      }
    ],
    "instructions": [
      "Bentuk daging cincang sapi bulat pipih patty bumbui garam lada hitam.",
      "Panggang patty burger atas teflon panas balik letakkan keju cheddar slice melted.",
      "Panggang belahan bun roti burger mentega sedikit bagian dalam garing masakan.",
      "Tata bun bagian bawah saus mayo selada hijau patty keju tomat bombay.",
      "Tutup bun atas tusuk lidi saji burger diner amerika klasik kentang."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 59,
    "title": "Mac and Cheese Creamy Bake",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?auto=format&fit=crop&w=600&q=80",
    "prepTime": "30 Min",
    "difficulty": "Medium",
    "rating": 4.7,
    "reviews": 310,
    "description": "Mac and Cheese Creamy Bake adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "460 Kcal",
    "nutrition": {
      "calories": "460 Kcal",
      "protein": "16g",
      "carbs": "44g",
      "fat": "24g"
    },
    "ingredients": [
      {
        "name": "Makaroni",
        "quantity": "200 g"
      },
      {
        "name": "Keju Cheddar",
        "quantity": "100 g"
      },
      {
        "name": "Susu Cair UHT",
        "quantity": "250 ml"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "2 sdm"
      },
      {
        "name": "Tepung Terigu",
        "quantity": "1 sdm"
      }
    ],
    "instructions": [
      "Rebus makaroni pipa pasta air mendidih al dente tiriskan wadah tampung.",
      "Lelehkan mentega tumis tepung terigu tuang susu cair saus bechamel putih.",
      "Masukkan parutan keju cheddar melimpah saus keju meleleh mulus krim.",
      "Campurkan makaroni rebus saus keju aduk rata masukkan loyang panggang.",
      "Tabur keju atas panggang oven sebentar warna cokelat keemasan premium."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 60,
    "title": "BBQ Chicken Wings Glazed",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80",
    "prepTime": "35 Min",
    "difficulty": "Easy",
    "rating": 4.8,
    "reviews": 242,
    "description": "BBQ Chicken Wings Glazed adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "380 Kcal",
    "nutrition": {
      "calories": "380 Kcal",
      "protein": "26g",
      "carbs": "14g",
      "fat": "22g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "500 g"
      },
      {
        "name": "Saus Tomat",
        "quantity": "4 sdm"
      },
      {
        "name": "Madu Murni",
        "quantity": "2 sdm"
      },
      {
        "name": "Bawang Putih",
        "quantity": "2 siung"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "2 sdm"
      }
    ],
    "instructions": [
      "Potong sayap ayam jadi dua bagian marinasi bawang putih bubuk garam garam.",
      "Goreng panggang sayap ayam oven hingga kulit luar cokelat garing matang.",
      "Campur saus tomat madu murni saus tiram sedikit kecap manis teflon kental.",
      "Masukkan sayap ayam matang ke dalam adonan saus bbq madu glazed wajan.",
      "Aduk cepat saus membalut merata mengkilap lengket manis gurih saji piring."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 61,
    "title": "Lasagna Beef Bolognese Layer",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=600&q=80",
    "prepTime": "50 Min",
    "difficulty": "Hard",
    "rating": 4.9,
    "reviews": 217,
    "description": "Lasagna Beef Bolognese Layer adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "510 Kcal",
    "nutrition": {
      "calories": "510 Kcal",
      "protein": "28g",
      "carbs": "38g",
      "fat": "26g"
    },
    "ingredients": [
      {
        "name": "Pasta / Spaghetti",
        "quantity": "6 sheet"
      },
      {
        "name": "Daging Cincang",
        "quantity": "200 g"
      },
      {
        "name": "Saus Tomat",
        "quantity": "200 g"
      },
      {
        "name": "Susu Cair UHT",
        "quantity": "300 ml"
      },
      {
        "name": "Keju Mozzarella",
        "quantity": "80 g"
      }
    ],
    "instructions": [
      "Buat saus daging bolognese tumis daging cincang saus tomat bombay matang.",
      "Buat saus putih bechamel terigu mentega leleh tuang susu uht keju.",
      "Tata loyang selang seling lembaran pasta lasagna saus daging saus putih.",
      "Ulangi lapisan hingga loyang penuh lapis teratas saus bechamel putih polos.",
      "Tabur keju mozzarella melimpah panggang oven meleleh cokelat berkaramel lasagna."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 62,
    "title": "Minestrone Italian Vegetable Soup",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    "prepTime": "30 Min",
    "difficulty": "Easy",
    "rating": 4.5,
    "reviews": 399,
    "description": "Minestrone Italian Vegetable Soup adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "160 Kcal",
    "nutrition": {
      "calories": "160 Kcal",
      "protein": "6g",
      "carbs": "28g",
      "fat": "2g"
    },
    "ingredients": [
      {
        "name": "Tomat Segar",
        "quantity": "2 buah"
      },
      {
        "name": "Wortel",
        "quantity": "1 buah"
      },
      {
        "name": "Kentang",
        "quantity": "1 buah"
      },
      {
        "name": "Makaroni",
        "quantity": "50 g"
      },
      {
        "name": "Bawang Putih",
        "quantity": "2 siung"
      }
    ],
    "instructions": [
      "Tumis bawang putih bombay minyak zaitun kuali sup wangi harum layu.",
      "Masukkan pasta saus tomat alami potongan wortel kentang kotak kecil dadu.",
      "Tuang air kaldu sayuran didihkan masukkan makaroni rebus terpisah kumpul panci.",
      "Bumbui oregano kering garam dapur merica bubuk aduk rata masakan sayur.",
      "Masak sup sayur minestrone matang kental sajikan hangat mangkok sup masakan."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 63,
    "title": "Grilled Chicken Alfredo Pasta",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "prepTime": "25 Min",
    "difficulty": "Medium",
    "rating": 4.8,
    "reviews": 488,
    "description": "Grilled Chicken Alfredo Pasta adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "490 Kcal",
    "nutrition": {
      "calories": "490 Kcal",
      "protein": "34g",
      "carbs": "42g",
      "fat": "21g"
    },
    "ingredients": [
      {
        "name": "Pasta / Spaghetti",
        "quantity": "200 g"
      },
      {
        "name": "Daging Ayam",
        "quantity": "150 g"
      },
      {
        "name": "Cooking Cream",
        "quantity": "150 ml"
      },
      {
        "name": "Keju Parmesan",
        "quantity": "20 g"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "1 sdm"
      }
    ],
    "instructions": [
      "Panggang fillet dada ayam bumbu lada garam pan tiriskan potong serong.",
      "Rebus pasta fettuccine tiriskan buat saus alfredo mentega leleh cream kental.",
      "Masukkan parutan keju parmesan saus alfredo krim mendidih kecil panci wajan.",
      "Campurkan pasta rebus saus alfredo aduk rata lapisi seluruh pasta krim.",
      "Tata piring saji letakkan potongan ayam panggang alfredo atas pasta harum."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 64,
    "title": "Premium Beef Bolognese Pasta",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Easy",
    "rating": 4.8,
    "reviews": 471,
    "description": "Premium Beef Bolognese Pasta adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "420 Kcal",
    "nutrition": {
      "calories": "420 Kcal",
      "protein": "22g",
      "carbs": "52g",
      "fat": "14g"
    },
    "ingredients": [
      {
        "name": "Pasta / Spaghetti",
        "quantity": "200 g"
      },
      {
        "name": "Daging Cincang",
        "quantity": "150 g"
      },
      {
        "name": "Saus Tomat",
        "quantity": "150 g"
      },
      {
        "name": "Bawang Bombay",
        "quantity": "0.5 buah"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "1 sdm"
      }
    ],
    "instructions": [
      "Rebus spaghetti pasta air asin mendidih al dente tiriskan minyak zaitun.",
      "Tumis bawang bombay cincang halus daging sapi cincang garing matang wajan.",
      "Tuangkan saus tomat pasta alami bumbui oregano garam dapur gula penyeimbang.",
      "Masak saus bolognese daging api kecil mengental merah pekat harum tanak.",
      "Siram saus bolognese daging sapi atas spaghetti piring saji saji siap."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 65,
    "title": "Crispy Calamari Rings Tartar",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    "prepTime": "15 Min",
    "difficulty": "Easy",
    "rating": 4.7,
    "reviews": 203,
    "description": "Crispy Calamari Rings Tartar adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "310 Kcal",
    "nutrition": {
      "calories": "310 Kcal",
      "protein": "18g",
      "carbs": "24g",
      "fat": "16g"
    },
    "ingredients": [
      {
        "name": "Cumi-cumi",
        "quantity": "400 g"
      },
      {
        "name": "Tepung Terigu",
        "quantity": "100 g"
      },
      {
        "name": "Tepung Tapioka",
        "quantity": "30 g"
      },
      {
        "name": "Telur Ayam",
        "quantity": "1 butir"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "300 ml"
      }
    ],
    "instructions": [
      "Potong melingkar cumi bersih bentuk cincin marinasi lada bawang putih halus.",
      "Campur tepung terigu tapioka bumbu bubuk wadah kering pelapis adonan garing.",
      "Celup cumi kocokan telur ayam lalu gulingkan adonan tepung kering rata.",
      "Goreng kilat cumi minyak panas deep fry garing keemasan sedetik angkat.",
      "Sajikan calamari rings renyah cocolan saus tartar mayo asam lemon segar."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 66,
    "title": "Classic Potato Wedges Baked",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1518013041235-4434b97c0c41?auto=format&fit=crop&w=600&q=80",
    "prepTime": "25 Min",
    "difficulty": "Easy",
    "rating": 4.6,
    "reviews": 209,
    "description": "Classic Potato Wedges Baked adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "190 Kcal",
    "nutrition": {
      "calories": "190 Kcal",
      "protein": "4g",
      "carbs": "36g",
      "fat": "4g"
    },
    "ingredients": [
      {
        "name": "Kentang",
        "quantity": "500 g"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "2 sdm"
      },
      {
        "name": "Garam Dapur",
        "quantity": "1 sdt"
      },
      {
        "name": "Merica / Lada",
        "quantity": "0.5 sdt"
      }
    ],
    "instructions": [
      "Cuci bersih kentang kulit jangan dikupas potong memanjang bentuk baji wedges.",
      "Rebus kentang potong setengah matang air garam tiriskan keringkan permukaan.",
      "Lumuri wedges kentang minyak zaitun bubuk bawang putih paprika powder garam.",
      "Tata loyang panggang oven suhu tinggi garing cokelat permukaan luar kentang.",
      "Angkat sajikan potato wedges hangat taburan parsley cincang halus saus."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 67,
    "title": "Seafood Paella Rice Valencia",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    "prepTime": "45 Min",
    "difficulty": "Hard",
    "rating": 4.8,
    "reviews": 542,
    "description": "Seafood Paella Rice Valencia adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "440 Kcal",
    "nutrition": {
      "calories": "440 Kcal",
      "protein": "26g",
      "carbs": "56g",
      "fat": "12g"
    },
    "ingredients": [
      {
        "name": "Beras Putih",
        "quantity": "200 g"
      },
      {
        "name": "Udang",
        "quantity": "100 g"
      },
      {
        "name": "Cumi-cumi",
        "quantity": "100 g"
      },
      {
        "name": "Tomat Segar",
        "quantity": "1 buah"
      },
      {
        "name": "Kunyit",
        "quantity": "1 sdt"
      }
    ],
    "instructions": [
      "Tumis bombay bawang putih minyak zaitun paella pan wajan datar harum.",
      "Masukkan potongan cumi udang masak setengah matang angkat seafood sisihkan.",
      "Masukkan beras paella kunyit warna kuning air kaldu seafood didihkan panci.",
      "Tata kembali udang cumi atas beras masak api kecil panci tutup rapat.",
      "Biarkan nasi paella matang menyerap kaldu kerak tipis bawah pan valencia."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 68,
    "title": "Creamy Chicken Carbonara Skillet",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=600&q=80",
    "prepTime": "25 Min",
    "difficulty": "Medium",
    "rating": 4.7,
    "reviews": 321,
    "description": "Creamy Chicken Carbonara Skillet adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "410 Kcal",
    "nutrition": {
      "calories": "410 Kcal",
      "protein": "32g",
      "carbs": "10g",
      "fat": "26g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "400 g"
      },
      {
        "name": "Cooking Cream",
        "quantity": "100 ml"
      },
      {
        "name": "Keju Cheddar",
        "quantity": "50 g"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "1 sdm"
      }
    ],
    "instructions": [
      "Tumis potongan dada ayam bumbu mentega wajan hingga kecokelatan matang.",
      "Tambahkan bawang putih cincang halus tumis bareng ayam wangi dapur.",
      "Tuangkan cooking cream kental parutan keju cheddar diaduk meleleh saus.",
      "Bumbui garam dapur merica lada bubuk hitam api kecil mendidih kental.",
      "Sajikan alfredo creamy chicken skillet taburan daun peterseli segar piring."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 69,
    "title": "Tomato Bruschetta Toast",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=600&q=80",
    "prepTime": "10 Min",
    "difficulty": "Easy",
    "rating": 4.6,
    "reviews": 258,
    "description": "Tomato Bruschetta Toast adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "140 Kcal",
    "nutrition": {
      "calories": "140 Kcal",
      "protein": "4g",
      "carbs": "22g",
      "fat": "4g"
    },
    "ingredients": [
      {
        "name": "Roti Tawar",
        "quantity": "4 slice"
      },
      {
        "name": "Tomat Segar",
        "quantity": "2 buah"
      },
      {
        "name": "Bawang Putih",
        "quantity": "2 siung"
      },
      {
        "name": "Garam Dapur",
        "quantity": "0.5 sdt"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "1 sdm"
      }
    ],
    "instructions": [
      "Panggang irisan roti tawar baguette teflon kering garing kriuk kecokelatan.",
      "Potong dadu kecil tomat merah buang biji dalam wadah mangkok campur.",
      "Campur potongan tomat bawang putih cincang minyak zaitun daun basil garam.",
      "Gosokkan belahan bawang putih mentah ke permukaan roti panggang hangat.",
      "Tata topping salad tomat segar atas roti bruschetta italia saji kilat."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 70,
    "title": "Classic Beef Shepherd's Pie",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "prepTime": "45 Min",
    "difficulty": "Hard",
    "rating": 4.8,
    "reviews": 138,
    "description": "Classic Beef Shepherd's Pie adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "430 Kcal",
    "nutrition": {
      "calories": "430 Kcal",
      "protein": "26g",
      "carbs": "32g",
      "fat": "22g"
    },
    "ingredients": [
      {
        "name": "Kentang",
        "quantity": "500 g"
      },
      {
        "name": "Daging Cincang",
        "quantity": "250 g"
      },
      {
        "name": "Susu Cair UHT",
        "quantity": "50 ml"
      },
      {
        "name": "Bawang Bombay",
        "quantity": "0.5 buah"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "2 sdm"
      }
    ],
    "instructions": [
      "Rebus kentang lumatkan halus campur mentega butter susu uht mashed potato.",
      "Tumis daging sapi cincang wortel dadu saus tomat bombay matang kental.",
      "Tata wadah tahan panas dasar tumisan daging sapi bolognese tebal rata.",
      "Lapisi atas adonan mashed potato kentang lumat tutup rapat rapi garpu.",
      "Panggang oven suhu sedang permukaan kentang cokelat kering emas pie."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 71,
    "title": "Crispy Onion Rings Tower",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1639024471283-267a3fc7752f?auto=format&fit=crop&w=600&q=80",
    "prepTime": "15 Min",
    "difficulty": "Easy",
    "rating": 4.6,
    "reviews": 523,
    "description": "Crispy Onion Rings Tower adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "230 Kcal",
    "nutrition": {
      "calories": "230 Kcal",
      "protein": "4g",
      "carbs": "31g",
      "fat": "10g"
    },
    "ingredients": [
      {
        "name": "Bawang Bombay",
        "quantity": "2 buah"
      },
      {
        "name": "Tepung Terigu",
        "quantity": "100 g"
      },
      {
        "name": "Tepung Maizena",
        "quantity": "20 g"
      },
      {
        "name": "Susu Cair UHT",
        "quantity": "50 ml"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "300 ml"
      }
    ],
    "instructions": [
      "Potong melingkar tebal bawang bombay lepas ring satu per satu pisahkan.",
      "Buat adonan basah tepung terigu maizena susu cair uht garam lada.",
      "Celup bombay ring adonan basah gulingkan tepung panir kering wadah sekat.",
      "Goreng minyak panas terendam onion rings garing kuning keemasan angkat.",
      "Tiriskan minyak tata menara piring saji cocolan saus sambal tomat."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 72,
    "title": "Creamy Tuscan Salmon Skillet",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    "prepTime": "25 Min",
    "difficulty": "Medium",
    "rating": 4.9,
    "reviews": 297,
    "description": "Creamy Tuscan Salmon Skillet adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "460 Kcal",
    "nutrition": {
      "calories": "460 Kcal",
      "protein": "36g",
      "carbs": "8g",
      "fat": "32g"
    },
    "ingredients": [
      {
        "name": "Ikan Segar",
        "quantity": "300 g"
      },
      {
        "name": "Cooking Cream",
        "quantity": "150 ml"
      },
      {
        "name": "Bayam",
        "quantity": "1 ikat"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Tomat Segar",
        "quantity": "1 buah"
      }
    ],
    "instructions": [
      "Pan-sear filet ikan salmon bumbu garam lada pan matang kedua sisi.",
      "Angkat salmon tumis bawang putih tomat segar potong layu pan sisa.",
      "Tuangkan cooking cream kental masukkan daun bayam hijau layu lembut saus.",
      "Kembalikan salmon ke saus cream creamy tuscan diaduk perlahan meresap kental.",
      "Sajikan masakan mewah restoran eropa tuscan cream salmon piring saji."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 73,
    "title": "Classic Margherita Pizza Thin",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Medium",
    "rating": 4.7,
    "reviews": 54,
    "description": "Classic Margherita Pizza Thin adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "390 Kcal",
    "nutrition": {
      "calories": "390 Kcal",
      "protein": "14g",
      "carbs": "52g",
      "fat": "14g"
    },
    "ingredients": [
      {
        "name": "Tepung Terigu",
        "quantity": "150 g"
      },
      {
        "name": "Saus Tomat",
        "quantity": "4 sdm"
      },
      {
        "name": "Keju Mozzarella",
        "quantity": "80 g"
      },
      {
        "name": "Tomat Segar",
        "quantity": "1 buah"
      },
      {
        "name": "Garam Dapur",
        "quantity": "0.5 sdt"
      }
    ],
    "instructions": [
      "Gilas tipis adonan dough pizza terigu ragi bulat tata loyang datar.",
      "Olesi permukaan dough saus tomat bolognese alami pekat merata kuas.",
      "Tata potongan keju mozzarella slice atau parut permukaan saus tomat.",
      "Tambahkan irisan tomat merah segar daun basil atas topping margherita.",
      "Panggang oven suhu sangat tinggi pizza tipis garing pinggir mozzarella melt."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 74,
    "title": "Premium Beef Stroganoff Egg Noodles",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "prepTime": "30 Min",
    "difficulty": "Medium",
    "rating": 4.8,
    "reviews": 540,
    "description": "Premium Beef Stroganoff Egg Noodles adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "490 Kcal",
    "nutrition": {
      "calories": "490 Kcal",
      "protein": "32g",
      "carbs": "41g",
      "fat": "23g"
    },
    "ingredients": [
      {
        "name": "Daging Sapi",
        "quantity": "300 g"
      },
      {
        "name": "Jamur Champignon",
        "quantity": "100 g"
      },
      {
        "name": "Cooking Cream",
        "quantity": "100 ml"
      },
      {
        "name": "Bawang Bombay",
        "quantity": "0.5 buah"
      },
      {
        "name": "Pasta / Spaghetti",
        "quantity": "150 g"
      }
    ],
    "instructions": [
      "Tumis potongan daging sapi strip memanjang mentega suhu tinggi tiriskan.",
      "Tumis bawang bombay irisan jamur champignon pan sisa daging wangi layu.",
      "Tuangkan air kaldu sedikit cooking cream kental aduk saus mengental gurih.",
      "Masukkan kembali daging sapi tumis ke saus krim stroganoff aduk pelan.",
      "Sajikan sup stroganoff kental daging atas mi telur pasta rebus hangat."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 75,
    "title": "Crispy Popcorn Chicken Bites",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Easy",
    "rating": 4.8,
    "reviews": 525,
    "description": "Crispy Popcorn Chicken Bites adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "340 Kcal",
    "nutrition": {
      "calories": "340 Kcal",
      "protein": "24g",
      "carbs": "22g",
      "fat": "16g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "400 g"
      },
      {
        "name": "Tepung Terigu",
        "quantity": "120 g"
      },
      {
        "name": "Tepung Maizena",
        "quantity": "30 g"
      },
      {
        "name": "Telur Ayam",
        "quantity": "1 butir"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "300 ml"
      }
    ],
    "instructions": [
      "Potong dadu kecil ukuran sekali suap dada ayam bumbu lada bawang.",
      "Gulingkan ayam tepung kering campuran terigu maizena wadah mangkok.",
      "Celup kocokan telur ayam balik gulingkan tepung kering cubit-cubit.",
      "Goreng popcorn chicken minyak panas tinggi garing kriuk warna emas tiris.",
      "Sajikan mangkok kecil popcorn chicken cemilan renyah saus mayo pedas."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 76,
    "title": "Creamy Garlic Parmesan Broccoli",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "prepTime": "15 Min",
    "difficulty": "Easy",
    "rating": 4.5,
    "reviews": 154,
    "description": "Creamy Garlic Parmesan Broccoli adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "220 Kcal",
    "nutrition": {
      "calories": "220 Kcal",
      "protein": "8g",
      "carbs": "12g",
      "fat": "16g"
    },
    "ingredients": [
      {
        "name": "Brokoli",
        "quantity": "300 g"
      },
      {
        "name": "Keju Parmesan",
        "quantity": "30 g"
      },
      {
        "name": "Cooking Cream",
        "quantity": "100 ml"
      },
      {
        "name": "Bawang Putih",
        "quantity": "4 siung"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "1 sdm"
      }
    ],
    "instructions": [
      "Potong kuntum brokoli hijau rebus setengah matang air garam es tiris.",
      "Tumis bawang putih cincang melimpah mentega butter pan wajan wangi.",
      "Tuang cooking cream kental parutan keju parmesan aduk rata mendidih pelan.",
      "Masukkan brokoli rebus saus krim keju parmesan aduk memutar pelan.",
      "Sajikan piring pendamping steak sayur creamy garlic parmesan broccoli siap."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 77,
    "title": "Classic French Onion Soup Crouton",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    "prepTime": "40 Min",
    "difficulty": "Medium",
    "rating": 4.6,
    "reviews": 217,
    "description": "Classic French Onion Soup Crouton adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "240 Kcal",
    "nutrition": {
      "calories": "240 Kcal",
      "protein": "8g",
      "carbs": "26g",
      "fat": "12g"
    },
    "ingredients": [
      {
        "name": "Bawang Bombay",
        "quantity": "3 buah"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "2 sdm"
      },
      {
        "name": "Keju Mozzarella",
        "quantity": "50 g"
      },
      {
        "name": "Roti Tawar",
        "quantity": "1 slice"
      },
      {
        "name": "Garam Dapur",
        "quantity": "1 sdt"
      }
    ],
    "instructions": [
      "Iris tipis bombay tumis mentega api kecil konstan lama berkaramel cokelat.",
      "Tuang air kaldu sapi gurih pekat didihkan bersama bombay manis karamel.",
      "Tuang sup bawang mangkok tahan panas letakkan roti panggang atas sup.",
      "Tabur keju mozzarella slice parut melimpah atas roti menutupi sup.",
      "Panggang oven sekejap keju mozzarella melting kecokelatan french onion soup."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 78,
    "title": "Premium Beef Tenderloin Stew",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "prepTime": "60 Min",
    "difficulty": "Hard",
    "rating": 4.9,
    "reviews": 135,
    "description": "Premium Beef Tenderloin Stew adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "410 Kcal",
    "nutrition": {
      "calories": "410 Kcal",
      "protein": "34g",
      "carbs": "22g",
      "fat": "18g"
    },
    "ingredients": [
      {
        "name": "Daging Sapi",
        "quantity": "400 g"
      },
      {
        "name": "Wortel",
        "quantity": "2 buah"
      },
      {
        "name": "Kentang",
        "quantity": "2 buah"
      },
      {
        "name": "Saus Tomat",
        "quantity": "3 sdm"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      }
    ],
    "instructions": [
      "Tumis potongan daging sapi kotak besar pan garing luar tiriskan panci.",
      "Tumis bombay bawang putih wortel kentang potongan tebal saus tomat.",
      "Tuangkan air kaldu sapi pekat masukkan kembali daging oseng awal kuali.",
      "Masak rebus api kecil berjam stew daging sayur mengental empuk bumbu.",
      "Sajikan stew beef kuah kental cokelat gurih musim dingin eropa saji."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 79,
    "title": "Crispy Chicken Parmigiana Melt",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=600&q=80",
    "prepTime": "30 Min",
    "difficulty": "Medium",
    "rating": 4.8,
    "reviews": 535,
    "description": "Crispy Chicken Parmigiana Melt adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "460 Kcal",
    "nutrition": {
      "calories": "460 Kcal",
      "protein": "35g",
      "carbs": "24g",
      "fat": "22g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "300 g"
      },
      {
        "name": "Saus Tomat",
        "quantity": "4 sdm"
      },
      {
        "name": "Keju Mozzarella",
        "quantity": "60 g"
      },
      {
        "name": "Tepung Terigu",
        "quantity": "50 g"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "200 ml"
      }
    ],
    "instructions": [
      "Buat ayam katsu filet dada balut terigu telur panir goreng crispy.",
      "Tata ayam goreng crispy loyang olesi permukaan saus tomat bolognese pekat.",
      "Letakkan lembaran keju mozzarella parut parmigiano atas saus ayam.",
      "Panggang oven kilat keju mozzarella meleleh bergelembung cokelat panas.",
      "Angkat sajikan chicken parmigiana premium bersama pasta salad pendamping."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 80,
    "title": "Creamy Spinach Dip Skillet",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "prepTime": "15 Min",
    "difficulty": "Easy",
    "rating": 4.5,
    "reviews": 188,
    "description": "Creamy Spinach Dip Skillet adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "280 Kcal",
    "nutrition": {
      "calories": "280 Kcal",
      "protein": "9g",
      "carbs": "12g",
      "fat": "24g"
    },
    "ingredients": [
      {
        "name": "Bayam",
        "quantity": "2 ikat"
      },
      {
        "name": "Cooking Cream",
        "quantity": "100 ml"
      },
      {
        "name": "Keju Cheddar",
        "quantity": "50 g"
      },
      {
        "name": "Bawang Putih",
        "quantity": "2 siung"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "1 sdm"
      }
    ],
    "instructions": [
      "Rebus bayam hijau peras air sekering mungkin cincang halus talenan.",
      "Tumis bawang putih mentega butter masukkan cream kental parutan keju cheddar.",
      "Masukkan cincangan bayam rebus saus keju meleleh gurih skillet teflon.",
      "Aduk rata saus krim bayam kental meletup api kecil kompor siap.",
      "Sajikan hangat skillet saus cocolan cream spinach dip keripik tortilla."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 81,
    "title": "Classic Spaghetti Aglio Olio",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "prepTime": "15 Min",
    "difficulty": "Easy",
    "rating": 4.7,
    "reviews": 490,
    "description": "Classic Spaghetti Aglio Olio adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "340 Kcal",
    "nutrition": {
      "calories": "340 Kcal",
      "protein": "10g",
      "carbs": "52g",
      "fat": "11g"
    },
    "ingredients": [
      {
        "name": "Pasta / Spaghetti",
        "quantity": "200 g"
      },
      {
        "name": "Bawang Putih",
        "quantity": "5 siung"
      },
      {
        "name": "Cabai Rawit",
        "quantity": "3 buah"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "3 sdm"
      },
      {
        "name": "Garam Dapur",
        "quantity": "0.5 sdt"
      }
    ],
    "instructions": [
      "Rebus pasta spaghetti wadah air asin mendidih simpan segelas air rebusan.",
      "Iris tipis melintang bawang putih cincang cabai rawit merah dapur wajan.",
      "Tumis bawang putih minyak zaitun melimpah api kecil warna kuning emas.",
      "Masukkan spaghetti rebus sesendok air pasta aduk cepat emulsi minyak.",
      "Bumbui garam daun parsley cincang aduk rata spaghetti aglio olio saji."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 82,
    "title": "Premium Beef Ribs BBQ Glazed",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "prepTime": "120 Min",
    "difficulty": "Hard",
    "rating": 5,
    "reviews": 97,
    "description": "Premium Beef Ribs BBQ Glazed adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "590 Kcal",
    "nutrition": {
      "calories": "590 Kcal",
      "protein": "38g",
      "carbs": "16g",
      "fat": "42g"
    },
    "ingredients": [
      {
        "name": "Daging Sapi",
        "quantity": "1 kg"
      },
      {
        "name": "Saus Tomat",
        "quantity": "100 g"
      },
      {
        "name": "Madu Murni",
        "quantity": "3 sdm"
      },
      {
        "name": "Bawang Putih",
        "quantity": "4 siung"
      },
      {
        "name": "Kecap Manis",
        "quantity": "2 sdm"
      }
    ],
    "instructions": [
      "Presto rebus iga sapi bumbu bawang putih jahe garam empuk lepas tulang.",
      "Buat saus bbq olesan saus tomat madu murni kecap asin lada hitam.",
      "Balut total permukaan iga sapi rebus bumbu bbq glazed wadah rata.",
      "Panggang oven atau bara api bakar iga olesi saus berulang karamel.",
      "Sajikan iga bakar bbq premium glazed mengkilap lumer piring saji."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 83,
    "title": "Crispy Chicken Caesar Wrap",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "prepTime": "15 Min",
    "difficulty": "Easy",
    "rating": 4.6,
    "reviews": 222,
    "description": "Crispy Chicken Caesar Wrap adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "360 Kcal",
    "nutrition": {
      "calories": "360 Kcal",
      "protein": "24g",
      "carbs": "28g",
      "fat": "16g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "150 g"
      },
      {
        "name": "Selada / Lettuce",
        "quantity": "100 g"
      },
      {
        "name": "Roti Tawar",
        "quantity": "1 sheet"
      },
      {
        "name": "Keju Parmesan",
        "quantity": "10 g"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "100 ml"
      }
    ],
    "instructions": [
      "Goreng ayam katsu crispy filet iris memanjang tipis kumpulkan piring.",
      "Aduk mangkok potongan selada romaine caesar dressing mayo parmesan cheese.",
      "Panaskan kulit tortilla lembaran roti tawar tipis gilas atas teflon kilat.",
      "Tata tengah kulit wrap salad caesar ayam goreng crispy parutan keju.",
      "Lipat gulung rapat potong dua diagonal caesar chicken wrap siap bekal."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 84,
    "title": "Creamy Garlic Butter Shrimp",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1559847844-5315b943ad75?auto=format&fit=crop&w=600&q=80",
    "prepTime": "15 Min",
    "difficulty": "Easy",
    "rating": 4.8,
    "reviews": 117,
    "description": "Creamy Garlic Butter Shrimp adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "320 Kcal",
    "nutrition": {
      "calories": "320 Kcal",
      "protein": "24g",
      "carbs": "6g",
      "fat": "22g"
    },
    "ingredients": [
      {
        "name": "Udang",
        "quantity": "400 g"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "3 sdm"
      },
      {
        "name": "Bawang Putih",
        "quantity": "5 siung"
      },
      {
        "name": "Cooking Cream",
        "quantity": "50 ml"
      },
      {
        "name": "Garam Dapur",
        "quantity": "0.5 sdt"
      }
    ],
    "instructions": [
      "Tumis udang kupas mentega butter panas sampai berubah warna merah angkat.",
      "Pan sisa tumis bawang putih cincang halus melimpah harum wangi tanak.",
      "Tuang dikit cooking cream jus lemon bumbui garam lada hitam bubuk.",
      "Masukkan kembali udang mentega aduk cepat saus krim butter mengental.",
      "Sajikan piring siraman garlic butter cream shrimp wangi parsley daun."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 85,
    "title": "Classic Macaroni Salad Creamy",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?auto=format&fit=crop&w=600&q=80",
    "prepTime": "15 Min",
    "difficulty": "Easy",
    "rating": 4.5,
    "reviews": 146,
    "description": "Classic Macaroni Salad Creamy adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "290 Kcal",
    "nutrition": {
      "calories": "290 Kcal",
      "protein": "6g",
      "carbs": "34g",
      "fat": "14g"
    },
    "ingredients": [
      {
        "name": "Makaroni",
        "quantity": "200 g"
      },
      {
        "name": "Wortel",
        "quantity": "0.5 buah"
      },
      {
        "name": "Susu Cair UHT",
        "quantity": "2 sdm"
      },
      {
        "name": "Gula Pasir",
        "quantity": "1 sdt"
      },
      {
        "name": "Garam Dapur",
        "quantity": "0.5 sdt"
      }
    ],
    "instructions": [
      "Rebus makaroni pipa pasta matang empuk bilas air es tiriskan wadah.",
      "Potong dadu super kecil wortel rebus kilat layu kumpulkan mangkok.",
      "Aduk dressing mayo susu cair uht dikit cuka gula pasir garam lumat.",
      "Campurkan makaroni wortel aduk dressing creamy salad merata total.",
      "Simpan kulkas pendingin makaroni salad creamy dingin nikmat saji es."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 86,
    "title": "Premium Beef Salisbury Steak",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "prepTime": "30 Min",
    "difficulty": "Medium",
    "rating": 4.7,
    "reviews": 505,
    "description": "Premium Beef Salisbury Steak adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "460 Kcal",
    "nutrition": {
      "calories": "460 Kcal",
      "protein": "28g",
      "carbs": "18g",
      "fat": "29g"
    },
    "ingredients": [
      {
        "name": "Daging Cincang",
        "quantity": "300 g"
      },
      {
        "name": "Bawang Bombay",
        "quantity": "1 buah"
      },
      {
        "name": "Tepung Terigu",
        "quantity": "1 sdm"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "2 sdm"
      },
      {
        "name": "Saus Tomat",
        "quantity": "2 sdm"
      }
    ],
    "instructions": [
      "Campur daging cincang tepung panir telur bentuk patty steak oval tebal.",
      "Goreng patty mentega butter cokelat matang kedua sisi pan tiriskan.",
      "Pan sisa tumis bombay irisan kecokelatan tepung terigu aduk roux cokelat.",
      "Tuang air kaldu saus tomat tiram aduk gravy bombay kental meletup.",
      "Masukkan patty steak gravy brown sauce salisbury steak kental saji."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 87,
    "title": "Crispy Chicken Schnitzel German",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Easy",
    "rating": 4.7,
    "reviews": 282,
    "description": "Crispy Chicken Schnitzel German adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "390 Kcal",
    "nutrition": {
      "calories": "390 Kcal",
      "protein": "32g",
      "carbs": "24g",
      "fat": "18g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "300 g"
      },
      {
        "name": "Tepung Terigu",
        "quantity": "50 g"
      },
      {
        "name": "Telur Ayam",
        "quantity": "1 butir"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "200 ml"
      },
      {
        "name": "Garam Dapur",
        "quantity": "0.5 sdt"
      }
    ],
    "instructions": [
      "Belah dada ayam filet pukul alat pemukul daging tipis melebar rata.",
      "Bumbui garam lada balut tepung terigu kering kocokan telur panir halus.",
      "Goreng minyak medium hot chicken schnitzel garing warna kuning datar.",
      "Pastikan kulit luar crispy daging dalam matang merata tiriskan papan.",
      "Sajikan schnitzel jerman perasan lemon kentang goreng wedges piring."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 88,
    "title": "Creamy Tomato Basil Soup Roast",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    "prepTime": "25 Min",
    "difficulty": "Easy",
    "rating": 4.6,
    "reviews": 267,
    "description": "Creamy Tomato Basil Soup Roast adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "180 Kcal",
    "nutrition": {
      "calories": "180 Kcal",
      "protein": "4g",
      "carbs": "21g",
      "fat": "9g"
    },
    "ingredients": [
      {
        "name": "Tomat Segar",
        "quantity": "500 g"
      },
      {
        "name": "Cooking Cream",
        "quantity": "80 ml"
      },
      {
        "name": "Bawang Bombay",
        "quantity": "0.5 buah"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "1 sdm"
      }
    ],
    "instructions": [
      "Panggang oven tomat belah dua bawang putih bombay kulit layu gosok.",
      "Blender halus seluruh tomat bawang panggang air kaldu kuali wadah.",
      "Rebus jus tomat panci saring biji kulit kental halus mulus sup.",
      "Tuangkan cooking cream kental daun basil bumbui garam gula pasir halus.",
      "Masak sup mendidih creamy tomato basil soup saji hangat roti kering."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 89,
    "title": "Classic Fettuccine Primavera Garden",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Easy",
    "rating": 4.5,
    "reviews": 198,
    "description": "Classic Fettuccine Primavera Garden adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "320 Kcal",
    "nutrition": {
      "calories": "320 Kcal",
      "protein": "9g",
      "carbs": "54g",
      "fat": "8g"
    },
    "ingredients": [
      {
        "name": "Pasta / Spaghetti",
        "quantity": "200 g"
      },
      {
        "name": "Wortel",
        "quantity": "0.5 buah"
      },
      {
        "name": "Brokoli",
        "quantity": "50 g"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "2 sdm"
      }
    ],
    "instructions": [
      "Rebus pasta fettuccine al dente potong tipis korek wortel brokoli kuntum.",
      "Tumis bawang putih cincang minyak zaitun wajan masukkan wortel brokoli.",
      "Oseng cepat sayuran segar beri sesendok air rebusan pasta biar empuk.",
      "Masukkan fettuccine bumbui garam lada hitam bubuk aduk rata menyatu.",
      "Sajikan pasta primavera vegetarian sehat warna warni keju parutan saji."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 90,
    "title": "Premium Beef Ribeye Steak Butter",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Medium",
    "rating": 5,
    "reviews": 302,
    "description": "Premium Beef Ribeye Steak Butter adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "580 Kcal",
    "nutrition": {
      "calories": "580 Kcal",
      "protein": "40g",
      "carbs": "0g",
      "fat": "44g"
    },
    "ingredients": [
      {
        "name": "Daging Sapi",
        "quantity": "300 g"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "40 g"
      },
      {
        "name": "Bawang Putih",
        "quantity": "4 siung"
      },
      {
        "name": "Garam Dapur",
        "quantity": "1 sdt"
      },
      {
        "name": "Merica / Lada",
        "quantity": "1 sdt"
      }
    ],
    "instructions": [
      "Marinasi ribeye steak marbling tinggi garam lada hitam kasar diamkan.",
      "Sear pan cast iron membara minyak dikit keluar crust premium garing.",
      "Balik steak masukkan mentega bawang putih geprek siram kuah minyak.",
      "Basting ribeye kontinyu aroma butter wangi lumat meresap serat serat.",
      "Resting steak papan potong jus daging terkunci sempurna iris saji premium."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 91,
    "title": "Crispy Fish Tacos Baja Style",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
    "prepTime": "25 Min",
    "difficulty": "Medium",
    "rating": 4.8,
    "reviews": 311,
    "description": "Crispy Fish Tacos Baja Style adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "380 Kcal",
    "nutrition": {
      "calories": "380 Kcal",
      "protein": "20g",
      "carbs": "36g",
      "fat": "16g"
    },
    "ingredients": [
      {
        "name": "Ikan Segar",
        "quantity": "200 g"
      },
      {
        "name": "Roti Tawar",
        "quantity": "4 sheet"
      },
      {
        "name": "Kubis / Kol",
        "quantity": "50 g"
      },
      {
        "name": "Tepung Terigu",
        "quantity": "80 g"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "150 ml"
      }
    ],
    "instructions": [
      "Goreng fillet ikan dori tepung kriuk crispy memanjang tiriskan wadah.",
      "Iris halus kol kubis putih merah rendam air es garing salad kol.",
      "Panaskan kulit taco tortilla teflon melengkung bentuk wadah tacos.",
      "Tata dalam taco shell kol iris ikan crispy siraman mayo dressing lemon.",
      "Sajikan fish tacos baja california segar asam pedas gurih piring."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 92,
    "title": "Classic French Omelette Soft",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
    "prepTime": "10 Min",
    "difficulty": "Medium",
    "rating": 4.7,
    "reviews": 302,
    "description": "Classic French Omelette Soft adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "210 Kcal",
    "nutrition": {
      "calories": "210 Kcal",
      "protein": "13g",
      "carbs": "1g",
      "fat": "16g"
    },
    "ingredients": [
      {
        "name": "Telur Ayam",
        "quantity": "3 butir"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "1.5 sdm"
      },
      {
        "name": "Garam Dapur",
        "quantity": "0.25 sdt"
      },
      {
        "name": "Merica / Lada",
        "quantity": "1 pinch"
      }
    ],
    "instructions": [
      "Kocok telur ayam saring wadah mangkok mulus busa hilang bumbui garam.",
      "Lelehkan mentega api sedang cenderung kecil pan anti lengket mulus.",
      "Tuang telur aduk cepat balon whisk konstan melingkar scrambled custard.",
      "Hentikan adukan ketuk pan lipat gulung adonan bentuk silinder mulus luar.",
      "Gulingkan piring omelette prancis tekstur luar kuning polos dalam lumer."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 93,
    "title": "Creamy Garlic Butter Mushroom Pasta",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Easy",
    "rating": 4.7,
    "reviews": 199,
    "description": "Creamy Garlic Butter Mushroom Pasta adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "410 Kcal",
    "nutrition": {
      "calories": "410 Kcal",
      "protein": "11g",
      "carbs": "48g",
      "fat": "18g"
    },
    "ingredients": [
      {
        "name": "Pasta / Spaghetti",
        "quantity": "200 g"
      },
      {
        "name": "Jamur Champignon",
        "quantity": "100 g"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "2 sdm"
      },
      {
        "name": "Cooking Cream",
        "quantity": "80 ml"
      },
      {
        "name": "Bawang Putih",
        "quantity": "3 siung"
      }
    ],
    "instructions": [
      "Rebus spaghetti al dente tumis irisan jamur champignon mentega butter cokelat.",
      "Masukkan bawang putih cincang pan sisa jamur aduk wangi harum matang.",
      "Tuang cooking cream kental sedikit air rebusan pasta aduk saus mendidih.",
      "Campurkan spaghetti rebus saus jamur krim mentega bawang putih kental.",
      "Sajikan piring mewah tabur lada hitam daun peterseli cincang halus."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 94,
    "title": "Premium Beef Sliders Party Platter",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    "prepTime": "25 Min",
    "difficulty": "Easy",
    "rating": 4.8,
    "reviews": 461,
    "description": "Premium Beef Sliders Party Platter adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "480 Kcal",
    "nutrition": {
      "calories": "480 Kcal",
      "protein": "24g",
      "carbs": "34g",
      "fat": "22g"
    },
    "ingredients": [
      {
        "name": "Daging Cincang",
        "quantity": "200 g"
      },
      {
        "name": "Roti Tawar",
        "quantity": "4 mini bun"
      },
      {
        "name": "Keju Cheddar",
        "quantity": "2 slice"
      },
      {
        "name": "Saus Tomat",
        "quantity": "2 sdm"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "1 sdm"
      }
    ],
    "instructions": [
      "Bentuk daging cincang sapi bulat mini patty ukuran sliders bumbui lada.",
      "Panggang patty teflon melted keju cheddar slice atas daging mini bun.",
      "Panggang belahan roti bun kecil mentega teflon garing warna cokelat.",
      "Susun slider mini bun bawah mayo selada patty keju saus tomat bun.",
      "Tata nampan papan sliders party platter porsi mini menarik saji siap."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 95,
    "title": "Crispy Potato Croquettes Cheese",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
    "prepTime": "25 Min",
    "difficulty": "Easy",
    "rating": 4.7,
    "reviews": 452,
    "description": "Crispy Potato Croquettes Cheese adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "240 Kcal",
    "nutrition": {
      "calories": "240 Kcal",
      "protein": "6g",
      "carbs": "28g",
      "fat": "11g"
    },
    "ingredients": [
      {
        "name": "Kentang",
        "quantity": "400 g"
      },
      {
        "name": "Keju Mozzarella",
        "quantity": "50 g"
      },
      {
        "name": "Telur Ayam",
        "quantity": "1 butir"
      },
      {
        "name": "Tepung Terigu",
        "quantity": "40 g"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "200 ml"
      }
    ],
    "instructions": [
      "Kupas kentang goreng empuk lumatkan halus bumbui lada garam pala bubuk.",
      "Ambil adonan kentang pipihkan isi potongan keju mozzarella serong bulat lonjong.",
      "Balut kroket terigu kocokan telur ayam tepung panir breadcrumbs kering.",
      "Goreng minyak panas terendam kroket kentang garing keemasan melted keju.",
      "Angkat tiriskan kroket lumer keju mozzarella renggang ditarik hangat piring."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 96,
    "title": "Creamy Garlic Parmesan Chicken",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=600&q=80",
    "prepTime": "25 Min",
    "difficulty": "Medium",
    "rating": 4.8,
    "reviews": 274,
    "description": "Creamy Garlic Parmesan Chicken adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "440 Kcal",
    "nutrition": {
      "calories": "440 Kcal",
      "protein": "34g",
      "carbs": "7g",
      "fat": "29g"
    },
    "ingredients": [
      {
        "name": "Daging Ayam",
        "quantity": "400 g"
      },
      {
        "name": "Cooking Cream",
        "quantity": "150 ml"
      },
      {
        "name": "Keju Parmesan",
        "quantity": "30 g"
      },
      {
        "name": "Bawang Putih",
        "quantity": "5 siung"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "1 sdm"
      }
    ],
    "instructions": [
      "Tumis dada ayam filet bumbu lada garam mentega pan matang tiriskan pan.",
      "Pan sisa tumis bawang putih cincang halus melimpah harum wangi tanak.",
      "Tuang cooking cream kental parutan keju parmesan aduk rata mendidih pelan.",
      "Masukkan dada ayam goreng ke saus cream parmesan kental matang menyerap.",
      "Sajikan piring mewah siram kuah putih kental parmesan chicken peterseli."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 97,
    "title": "Classic Cobb Salad Avocado",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    "prepTime": "15 Min",
    "difficulty": "Easy",
    "rating": 4.6,
    "reviews": 543,
    "description": "Classic Cobb Salad Avocado adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "340 Kcal",
    "nutrition": {
      "calories": "340 Kcal",
      "protein": "21g",
      "carbs": "10g",
      "fat": "24g"
    },
    "ingredients": [
      {
        "name": "Selada / Lettuce",
        "quantity": "150 g"
      },
      {
        "name": "Daging Ayam",
        "quantity": "100 g"
      },
      {
        "name": "Telur Ayam",
        "quantity": "1 butir"
      },
      {
        "name": "Tomat Segar",
        "quantity": "1 buah"
      },
      {
        "name": "Smoked Beef / Daging Asap",
        "quantity": "1 lembar"
      }
    ],
    "instructions": [
      "Tata dasar piring selada romaine hijau potong sobek kotak bersih kering.",
      "Rebus telur ayam filet dada rebus smoked beef garing potong dadu baris.",
      "Potong alpukat segar tomat merah dadu susun berbaris indah atas selada.",
      "Pastikan susunan topping salad berwarna warni kontras rapi ala cobb salad.",
      "Siram dressing mayo vinaigrette asam manis minyak zaitun sebelum santap saji."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 98,
    "title": "Premium Beef Ribeye Mushroom Gravy",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    "prepTime": "25 Min",
    "difficulty": "Medium",
    "rating": 5,
    "reviews": 170,
    "description": "Premium Beef Ribeye Mushroom Gravy adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "590 Kcal",
    "nutrition": {
      "calories": "590 Kcal",
      "protein": "38g",
      "carbs": "8g",
      "fat": "46g"
    },
    "ingredients": [
      {
        "name": "Daging Sapi",
        "quantity": "300 g"
      },
      {
        "name": "Jamur Champignon",
        "quantity": "80 g"
      },
      {
        "name": "Mentega / Butter",
        "quantity": "30 g"
      },
      {
        "name": "Tepung Terigu",
        "quantity": "1 tsp"
      },
      {
        "name": "Merica / Lada",
        "quantity": "1 sdt"
      }
    ],
    "instructions": [
      "Sear ribeye steak pan cast iron bumbui garam lada crust juicy tiris.",
      "Pan sisa tumis jamur champignon bawang putih mentega butter kecokelatan.",
      "Tabur tepung terigu dikit tuang air kaldu sapi pekat brown sauce gravy.",
      "Masak saus mushroom gravy mengental hitam gurih wangi sisa sari steak.",
      "Siram saus mushroom kental panas atas potongan steak ribeye juicy piring."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 99,
    "title": "Crispy Fish Burger Tartar",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    "prepTime": "20 Min",
    "difficulty": "Easy",
    "rating": 4.7,
    "reviews": 296,
    "description": "Crispy Fish Burger Tartar adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "410 Kcal",
    "nutrition": {
      "calories": "410 Kcal",
      "protein": "19g",
      "carbs": "42g",
      "fat": "18g"
    },
    "ingredients": [
      {
        "name": "Ikan Segar",
        "quantity": "150 g"
      },
      {
        "name": "Roti Tawar",
        "quantity": "1 bun"
      },
      {
        "name": "Keju Cheddar",
        "quantity": "1 slice"
      },
      {
        "name": "Tepung Terigu",
        "quantity": "50 g"
      },
      {
        "name": "Minyak Goreng",
        "quantity": "150 ml"
      }
    ],
    "instructions": [
      "Buat fillet dori crispy balut adonan tepung bumbu garing deep fry emas.",
      "Panggang bun burger mentega wajan belahan dalam garing kecokelatan.",
      "Tata bun bawah saus tartar mayo asam gurih selada fillet ikan crispy.",
      "Letakkan keju cheddar slice atas ikan panas agar sedikit meleleh melt.",
      "Tutup bun burger atas tusuk lidi saji fish burger tartar kentang."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  },
  {
    "id": 100,
    "title": "Classic French Toast Vanilla Honey",
    "category": "MASAKAN WESTERN",
    "imageUrl": "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80",
    "prepTime": "10 Min",
    "difficulty": "Easy",
    "rating": 4.8,
    "reviews": 237,
    "description": "Classic French Toast Vanilla Honey adalah hidangan lezat kategori MASAKAN WESTERN yang populer.",
    "calories": "290 Kcal",
    "nutrition": {
      "calories": "290 Kcal",
      "protein": "9g",
      "carbs": "41g",
      "fat": "11g"
    },
    "ingredients": [
      {
        "name": "Roti Tawar",
        "quantity": "2 lembar"
      },
      {
        "name": "Susu Cair UHT",
        "quantity": "50 ml"
      },
      {
        "name": "Telur Ayam",
        "quantity": "1 butir"
      },
      {
        "name": "Madu Murni",
        "quantity": "2 sdm"
      },
      {
        "name": "Vanilla",
        "quantity": "0.5 sdt"
      }
    ],
    "instructions": [
      "Kocok mangkok telur ayam susu cair uht ekstrak vanila bubuk kayu manis.",
      "Rendam roti tawar tebal adonan susu telur hingga menyerap pori roti.",
      "Panggang roti rendam mentega butter teflon api sedang kecokelatan balik.",
      "Pastikan kedua permukaan french toast matang lembut wajan harum angkat.",
      "Sajikan piring siraman madu murni legit buah beri pelengkap sarapan."
    ],
    "createdBy": "system",
    "isEditable": false,
    "tempRange": {
      "min": 40,
      "max": 75
    }
  }
];
