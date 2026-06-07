import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Bot, Camera, ChefHat, Coins, Image, Loader2, Save, ShoppingBag, Sparkles, Upload, Wand2, X } from '@icons/CookEduIcons'
import { useNavigate } from 'react-router-dom'
import { chefAiApi, coinApi, type ChefAiDetectedIngredient } from '../../lib/api'
import { emptyAiMemory, formatAiMemory, loadAiMemory, saveAiMemory, type CookEduAiMemory } from '../../lib/aiMemory'
import { useAuthStore } from '../../store'
import { getPreferredIdentityName } from '../../lib/supabaseClient'
import { useToastStore } from '../../store/toastStore'
import { stapleIngredientsData } from '../../data/stapleIngredients'
import { useShoppingStore } from '../../store/shoppingStore'
import { getAiUsageSummary, trackAiUsage } from '../../lib/aiUsage'

const AI_BOOST_COST = 15

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('File gambar gagal dibaca.'))
    reader.readAsDataURL(file)
  })
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF\s]/gi, ' ').replace(/\s+/g, ' ').trim()
}

function inferShoppingItems(text: string, detected: ChefAiDetectedIngredient[]) {
  const normalized = normalizeText(text)
  const fromText = stapleIngredientsData
    .filter((item) => normalized.includes(normalizeText(item.name)))
    .slice(0, 14)
    .map((item) => ({ item: item.name, amount: 1, unit: '' }))

  const fromDetected = detected.map((item) => ({ item: item.name, amount: 1, unit: '' }))
  const combined = [...fromText, ...fromDetected]
  const seen = new Set<string>()
  const unique = combined.filter((item) => {
    const key = normalizeText(item.item)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })

  return unique.length ? unique : [
    { item: 'Telur', amount: 4, unit: 'butir' },
    { item: 'Bawang Putih', amount: 3, unit: 'siung' },
    { item: 'Tomat', amount: 2, unit: 'buah' },
    { item: 'Sayur Hijau', amount: 1, unit: 'ikat' },
  ]
}

export default function AiKitchenLab() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const pushToast = useToastStore((state) => state.pushToast)
  const scanInputRef = useRef<HTMLInputElement | null>(null)
  const doctorInputRef = useRef<HTMLInputElement | null>(null)
  const displayName = getPreferredIdentityName({ username: user?.username, name: user?.name, email: user?.email })
  const [memory, setMemory] = useState<CookEduAiMemory>(() => user?.id ? loadAiMemory(user.id) : emptyAiMemory)
  const [scanImage, setScanImage] = useState('')
  const [doctorImage, setDoctorImage] = useState('')
  const [detectedIngredients, setDetectedIngredients] = useState<ChefAiDetectedIngredient[]>([])
  const [doctorPrompt, setDoctorPrompt] = useState('')
  const [mealPrompt, setMealPrompt] = useState('')
  const [doctorReply, setDoctorReply] = useState('')
  const [mealReply, setMealReply] = useState('')
  const [scanNote, setScanNote] = useState('')
  const [loadingAction, setLoadingAction] = useState('')
  const [usageSummary, setUsageSummary] = useState(() => getAiUsageSummary(user?.id))
  const addShoppingGroup = useShoppingStore((state) => state.addGroup)
  const addPantryItems = useShoppingStore((state) => state.addPantryItems)
  const pantryItems = useShoppingStore((state) => state.pantryItems)
  const memoryText = useMemo(() => formatAiMemory(memory), [memory])

  const recordUsage = (action: Parameters<typeof trackAiUsage>[0]) => {
    trackAiUsage(action, user?.id)
    setUsageSummary(getAiUsageSummary(user?.id))
  }

  const updateMemory = (key: keyof CookEduAiMemory, value: string) => {
    setMemory((current) => ({ ...current, [key]: value }))
  }

  const persistMemory = () => {
    saveAiMemory(user?.id, memory)
    pushToast({
      tone: 'success',
      title: 'Memory AI tersimpan',
      message: 'CookEdu Brain akan memakai preferensi ini untuk jawaban berikutnya.',
    })
  }

  const chargePremium = async (action: string) => {
    const response = await coinApi.spendCoins({
      spend_type: 'ai_boost',
      reference_id: `${action}-${Date.now()}`,
    })
    pushToast({
      tone: 'success',
      title: `${AI_BOOST_COST} koin dipakai`,
      message: response.data.message || 'AI Boost aktif untuk fitur premium ini.',
    })
  }

  const handleScanFile = async (file?: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      pushToast({ tone: 'warning', title: 'File belum cocok', message: 'Pilih foto bahan makanan.' })
      return
    }

    setLoadingAction('scan')
    try {
      const imageDataUrl = await readFileAsDataUrl(file)
      setScanImage(imageDataUrl)
      await chargePremium('scan-fridge')
      const response = await chefAiApi.scanFridge({
        image_data_url: imageDataUrl,
        known_ingredients: stapleIngredientsData.map((item) => item.name),
        user_name: displayName,
        preferences: memoryText,
      })
      const ingredients = response.data.ingredients || []
      setDetectedIngredients(ingredients)
      setScanNote(response.data.note || 'Scan selesai.')
      recordUsage('scan-fridge')
      pushToast({
        tone: ingredients.length ? 'success' : 'warning',
        title: ingredients.length ? 'Bahan terdeteksi' : 'Belum ada bahan jelas',
        message: ingredients.length ? `${ingredients.length} bahan terbaca oleh CookEdu Vision.` : 'Coba foto ulang dengan cahaya lebih terang.',
      })
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'Scan AI gagal',
        message: error instanceof Error ? error.message : 'Coba lagi beberapa saat.',
      })
    } finally {
      setLoadingAction('')
    }
  }

  const runRecipeDoctor = async () => {
    if (!doctorPrompt.trim() && !doctorImage) {
      pushToast({ tone: 'warning', title: 'Ceritakan dulu masalahnya', message: 'Tulis masalah masakan atau unggah foto.' })
      return
    }

    setLoadingAction('doctor')
    try {
      await chargePremium('recipe-doctor')
      const response = await chefAiApi.recipeDoctor({
        prompt: doctorPrompt,
        image_data_url: doctorImage || undefined,
        user_name: displayName,
        preferences: memoryText,
      })
      setDoctorReply(response.data.reply || '')
      recordUsage('recipe-doctor')
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'Recipe Doctor gagal',
        message: error instanceof Error ? error.message : 'Coba lagi beberapa saat.',
      })
    } finally {
      setLoadingAction('')
    }
  }

  const runMealPlan = async () => {
    if (!mealPrompt.trim() && !memoryText) {
      pushToast({ tone: 'warning', title: 'Isi target menu', message: 'Contoh: menu 7 hari hemat, tinggi protein, 30 menit.' })
      return
    }

    setLoadingAction('meal')
    try {
      await chargePremium('meal-plan')
      const response = await chefAiApi.mealPlan({
        prompt: mealPrompt,
        user_name: displayName,
        preferences: memoryText,
      })
      setMealReply(response.data.reply || '')
      recordUsage('meal-plan')
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'Meal plan gagal',
        message: error instanceof Error ? error.message : 'Coba lagi beberapa saat.',
      })
    } finally {
      setLoadingAction('')
    }
  }

  const addDetectedToPantry = () => {
    const names = detectedIngredients.map((item) => item.name)
    if (!names.length) return
    addPantryItems(names)
    updateMemory('pantry', Array.from(new Set([...pantryItems, ...names.map((name) => name.toLowerCase())])).join(', '))
    pushToast({
      tone: 'success',
      title: 'Bahan masuk pantry',
      message: 'Bahan hasil scan disimpan sebagai isi dapur untuk rekomendasi berikutnya.',
    })
  }

  const addMealPlanToShopping = () => {
    const items = inferShoppingItems(mealReply || mealPrompt, detectedIngredients)
    addShoppingGroup('AI Meal Plan CookEdu', items)
    pushToast({
      tone: 'success',
      title: 'Daftar belanja dibuat',
      message: `${items.length} bahan dari AI Meal Plan masuk ke daftar belanja.`,
    })
  }

  const saveDoctorNote = () => {
    if (!doctorReply) return
    const key = `cookedu_ai_notes_${user?.id || 'guest'}`
    const saved = JSON.parse(localStorage.getItem(key) || '[]')
    const next = [{ id: crypto.randomUUID(), text: doctorReply, createdAt: new Date().toISOString() }, ...saved].slice(0, 40)
    localStorage.setItem(key, JSON.stringify(next))
    pushToast({
      tone: 'success',
      title: 'Catatan tersimpan',
      message: 'Diagnosis Recipe Doctor disimpan di perangkat ini.',
    })
  }

  return (
    <div className="min-h-screen bg-[#F6F7F8] px-4 pb-32 pt-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-[32px] bg-[#2A4D88] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#D9D9D8]">CookEdu AI Engine</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">AI Kitchen Lab</h1>
              <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-white/75">
                Scan bahan, bedah masakan gagal, susun menu mingguan, dan simpan memory rasa. Fitur premium memakai {AI_BOOST_COST} koin per aksi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/fridge')}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-xs font-black uppercase tracking-widest text-[#2A4D88]"
            >
              Kulkas Pintar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-[#B1BBC8]/40 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Save className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#7C94B8]">Memory Preference</p>
                <h2 className="font-black text-slate-950">Selera {displayName}</h2>
              </div>
            </div>

            {[
              ['taste', 'Rasa favorit', 'Pedas manis, gurih ringan, suka bawang...'],
              ['allergies', 'Pantangan', 'Alergi seafood, tanpa santan, tidak pedas...'],
              ['budget', 'Budget', 'Hemat 50 ribu per hari...'],
              ['cookingTime', 'Waktu masak', 'Maksimal 30 menit...'],
              ['goals', 'Target', 'Meal prep, protein tinggi, bekal sekolah...'],
              ['pantry', 'Pantry', 'Telur, bawang putih, nasi, tahu...'],
            ].map(([key, label, placeholder]) => (
              <label key={key} className="mb-3 block">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                <input
                  value={memory[key as keyof CookEduAiMemory]}
                  onChange={(event) => updateMemory(key as keyof CookEduAiMemory, event.target.value)}
                  placeholder={placeholder}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-[#7C94B8]"
                />
              </label>
            ))}

            <button
              type="button"
              onClick={persistMemory}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-widest text-white"
            >
              <Save className="h-4 w-4" />
              Simpan Memory
            </button>

            <div className="mt-5 rounded-[24px] bg-[#EDF1F6] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#2A4D88]">AI Usage</p>
              <p className="mt-1 text-3xl font-black text-slate-950">{usageSummary.total}</p>
              <p className="text-xs font-semibold text-slate-500">aksi AI tercatat di perangkat ini</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  ['Scan', usageSummary.counts['scan-fridge']],
                  ['Doctor', usageSummary.counts['recipe-doctor']],
                  ['Meal', usageSummary.counts['meal-plan']],
                  ['Chat', usageSummary.counts.chat],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-2xl bg-white px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="text-lg font-black text-[#2A4D88]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-[28px] border border-[#B1BBC8]/40 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#7C94B8]">Gemini Vision</p>
                  <h2 className="text-xl font-black">Smart Fridge Scan</h2>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-[10px] font-black text-yellow-800">
                  <Coins className="h-3.5 w-3.5" /> {AI_BOOST_COST}
                </span>
              </div>
              <input
                ref={scanInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => handleScanFile(event.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => scanInputRef.current?.click()}
                disabled={loadingAction === 'scan'}
                className="flex aspect-[16/9] w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-[#7C94B8] bg-[#EDF1F6] text-[#2A4D88]"
              >
                {scanImage ? <img src={scanImage} alt="Foto bahan" className="h-full w-full rounded-[24px] object-cover" /> : loadingAction === 'scan' ? <Loader2 className="h-8 w-8 animate-spin" /> : <><Camera className="mb-3 h-8 w-8" /><span className="text-xs font-black uppercase tracking-widest">Scan Kamera</span></>}
              </button>
              {detectedIngredients.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {detectedIngredients.map((item) => (
                    <span key={item.name} className="rounded-2xl bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                      {item.name} {Math.round(item.confidence * 100)}%
                    </span>
                  ))}
                </div>
              )}
              {scanNote && <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{scanNote}</p>}
              {detectedIngredients.length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button type="button" onClick={addDetectedToPantry} className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-widest text-white">
                    <Save className="h-4 w-4" /> Pantry
                  </button>
                  <button type="button" onClick={() => navigate('/fridge')} className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#B1BBC8] text-xs font-black uppercase tracking-widest text-[#2A4D88]">
                    <ChefHat className="h-4 w-4" /> Resep Cocok
                  </button>
                </div>
              )}
            </article>

            <article className="rounded-[28px] border border-[#B1BBC8]/40 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#7C94B8]">AI Diagnosis</p>
                  <h2 className="text-xl font-black">Recipe Doctor</h2>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-[10px] font-black text-yellow-800">
                  <Coins className="h-3.5 w-3.5" /> {AI_BOOST_COST}
                </span>
              </div>
              <textarea
                value={doctorPrompt}
                onChange={(event) => setDoctorPrompt(event.target.value)}
                placeholder="Contoh: ayamku gosong di luar tapi dalamnya masih mentah..."
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none focus:border-[#7C94B8]"
              />
              <input ref={doctorInputRef} type="file" accept="image/*" className="hidden" onChange={async (event) => {
                const file = event.target.files?.[0]
                if (file) setDoctorImage(await readFileAsDataUrl(file))
              }} />
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => doctorInputRef.current?.click()} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500">
                  <Upload className="h-4 w-4" /> Foto
                </button>
                <button type="button" onClick={runRecipeDoctor} disabled={loadingAction === 'doctor'} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#2A4D88] text-xs font-black uppercase tracking-widest text-white">
                  {loadingAction === 'doctor' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                  Bedah
                </button>
              </div>
              {doctorImage && (
                <button type="button" onClick={() => setDoctorImage('')} className="mt-3 flex items-center gap-2 text-xs font-bold text-rose-600">
                  <X className="h-4 w-4" /> Hapus foto lampiran
                </button>
              )}
              {doctorReply && (
                <div className="mt-4 rounded-2xl bg-[#EDF1F6] p-4">
                  <p className="whitespace-pre-line text-sm font-semibold leading-6 text-slate-700">{doctorReply}</p>
                  <button type="button" onClick={saveDoctorNote} className="mt-4 flex h-10 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-xs font-black uppercase tracking-widest text-[#2A4D88]">
                    <Save className="h-4 w-4" /> Simpan Catatan
                  </button>
                </div>
              )}
            </article>

            <article className="rounded-[28px] border border-[#B1BBC8]/40 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#7C94B8]">Planner</p>
                  <h2 className="text-xl font-black">Menu Mingguan Otomatis</h2>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-[10px] font-black text-yellow-800">
                  <Coins className="h-3.5 w-3.5" /> {AI_BOOST_COST}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  value={mealPrompt}
                  onChange={(event) => setMealPrompt(event.target.value)}
                  placeholder="Contoh: menu 7 hari hemat, tidak pedas, bekal kantor, 30 menit"
                  className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-[#7C94B8]"
                />
                <button type="button" onClick={runMealPlan} disabled={loadingAction === 'meal'} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-xs font-black uppercase tracking-widest text-white">
                  {loadingAction === 'meal' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  Buat Plan
                </button>
              </div>
              {mealReply && (
                <div className="mt-4 rounded-2xl bg-[#EDF1F6] p-5">
                  <p className="whitespace-pre-line text-sm font-semibold leading-7 text-slate-700">{mealReply}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={addMealPlanToShopping} className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-xs font-black uppercase tracking-widest text-white">
                      <ShoppingBag className="h-4 w-4" /> Masuk Belanja
                    </button>
                    <button type="button" onClick={() => navigate('/daftar-belanja')} className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-xs font-black uppercase tracking-widest text-[#2A4D88]">
                      Buka Daftar
                    </button>
                  </div>
                </div>
              )}
            </article>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ['Lebih personal', 'AI membaca memory rasa dan batasan user.', Sparkles],
            ['Lebih visual', 'Foto bahan bisa dikirim ke Gemini Vision lewat Supabase.', Image],
            ['Lebih premium', 'Fitur berat memakai koin agar wallet punya fungsi nyata.', ChefHat],
          ].map(([title, text, Icon]) => (
            <div key={String(title)} className="rounded-[24px] border border-[#B1BBC8]/30 bg-white p-5">
              <Icon className="mb-4 h-7 w-7 text-[#2A4D88]" />
              <h3 className="font-black text-slate-950">{title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
