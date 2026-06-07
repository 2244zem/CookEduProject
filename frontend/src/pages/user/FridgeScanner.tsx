import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  Flame,
  Image as ImageIcon,
  Loader2,
  Plus,
  Refrigerator,
  Search,
  Sparkles,
  Upload,
  X,
} from '@icons/CookEduIcons'
import { useNavigate } from 'react-router-dom'
import { recipes as staticRecipes } from '../../data/recipes'
import { stapleIngredientsData } from '../../data/stapleIngredients'
import { analyzeFridgePhoto, recommendRecipesFromIngredients, type DetectedIngredient } from '../../lib/fridgeVision'
import { listSupabaseRecipes } from '../../lib/supabaseData'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import { useToastStore } from '../../store/toastStore'

import bgPattern from '../../assets/food_drawing.jpg'

type ScanSource = 'vision-ai' | 'local-scan' | 'manual'

function normalizeIngredient(value: string) {
  return value.trim().toLowerCase()
}

function mergeIngredients(current: string[], incoming: string[]) {
  const seen = new Set(current.map(normalizeIngredient))
  const next = [...current]

  incoming.forEach((item) => {
    const clean = item.trim()
    const key = normalizeIngredient(clean)
    if (!clean || seen.has(key)) return
    seen.add(key)
    next.push(clean)
  })

  return next
}

function getImageUrl(recipe: any) {
  return recipe.image_url || recipe.imageUrl || '/assets/images/default-food-placeholder.webp'
}

export default function FridgeScanner() {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [hasScanned, setHasScanned] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState('')
  const [capturedImage, setCapturedImage] = useState('')
  const [detectedIngredients, setDetectedIngredients] = useState<DetectedIngredient[]>([])
  const [scanSource, setScanSource] = useState<ScanSource>('manual')
  const [scanNote, setScanNote] = useState('')
  const [recommendationOpen, setRecommendationOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const navigate = useNavigate()
  const pushToast = useToastStore((state) => state.pushToast)

  const categories = useMemo(() => Array.from(new Set(stapleIngredientsData.map((item) => item.category))), [])
  const topRecipes = recipes.slice(0, 4)

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraStream])

  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((track) => track.stop())
    }
  }, [cameraStream])

  const addIngredient = (ingredient: string) => {
    const trimmed = ingredient.trim()
    if (!trimmed) return

    setIngredients((current) => mergeIngredients(current, [trimmed]))
    setInputValue('')
  }

  const removeIngredient = (ingredient: string) => {
    setIngredients((current) => current.filter((item) => normalizeIngredient(item) !== normalizeIngredient(ingredient)))
  }

  const loadRecipes = async () => {
    if (!isSupabaseConfigured) return staticRecipes

    try {
      return await listSupabaseRecipes()
    } catch (error) {
      console.warn('CookEdu fridge recipe lookup fallback:', error)
      return staticRecipes
    }
  }

  const findRecipes = async (sourceIngredients = ingredients, openPopup = false) => {
    if (sourceIngredients.length === 0) return

    setIsScanning(true)
    setLoading(true)

    try {
      const allRecipes = await loadRecipes()
      const matched = recommendRecipesFromIngredients(allRecipes, sourceIngredients)
      setRecipes(matched)
      setHasScanned(true)

      if (openPopup && matched.length > 0) {
        setRecommendationOpen(true)
      }

      if (!matched.length) {
        pushToast({
          tone: 'warning',
          title: 'Belum ada resep yang cocok',
          message: 'Coba tambah bahan dasar seperti telur, ayam, tahu, tempe, tomat, atau bawang.',
        })
      }
    } catch (error) {
      console.error(error)
      pushToast({
        tone: 'error',
        title: 'Rekomendasi gagal dimuat',
        message: error instanceof Error ? error.message : 'Coba ulangi scan beberapa saat lagi.',
      })
    } finally {
      setLoading(false)
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop())
    setCameraStream(null)
  }

  const startCamera = async () => {
    setCameraError('')

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Browser belum mendukung akses kamera.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      setCameraStream(stream)
      setCapturedImage('')
    } catch (error) {
      console.error(error)
      setCameraError('Kamera tidak bisa dibuka. Izinkan akses kamera lalu coba lagi.')
    }
  }

  const analyzePhoto = async (imageDataUrl: string) => {
    setLoading(true)
    setIsScanning(true)

    try {
      const result = await analyzeFridgePhoto(imageDataUrl)
      const names = result.ingredients.map((item) => item.name)
      const nextIngredients = mergeIngredients(ingredients, names)

      setDetectedIngredients(result.ingredients)
      setScanSource(result.source)
      setScanNote(result.note)
      setIngredients(nextIngredients)

      pushToast({
        tone: result.source === 'vision-ai' ? 'success' : 'info',
        title: result.source === 'vision-ai' ? 'AI berhasil membaca kulkas' : 'Scan lokal aktif',
        message: `${names.length} bahan masuk ke daftar pencarian resep.`,
      })

      await findRecipes(nextIngredients, true)
    } catch (error) {
      console.error(error)
      pushToast({
        tone: 'error',
        title: 'Foto belum bisa dipindai',
        message: error instanceof Error ? error.message : 'Coba foto ulang dengan pencahayaan lebih terang.',
      })
    } finally {
      setLoading(false)
      setIsScanning(false)
    }
  }

  const capturePhoto = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const width = video.videoWidth || 1280
    const height = video.videoHeight || 720
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d')?.drawImage(video, 0, 0, width, height)

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.86)
    setCapturedImage(imageDataUrl)
    stopCamera()
    await analyzePhoto(imageDataUrl)
  }

  const handlePhotoUpload = (file?: File | null) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      pushToast({
        tone: 'warning',
        title: 'File belum cocok',
        message: 'Unggah foto bahan makanan dengan format gambar.',
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const imageDataUrl = String(reader.result || '')
      setCapturedImage(imageDataUrl)
      void analyzePhoto(imageDataUrl)
    }
    reader.onerror = () => {
      pushToast({
        tone: 'error',
        title: 'Foto gagal dibaca',
        message: 'Pilih foto lain atau gunakan kamera langsung.',
      })
    }
    reader.readAsDataURL(file)
  }

  const sourceLabel = scanSource === 'vision-ai' ? 'Vision AI' : scanSource === 'local-scan' ? 'Local Scan' : 'Manual'

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent pb-40 font-sans text-slate-800">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40 lg:hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-sky-200/30 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: 'cover' }} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-lg lg:max-w-7xl">
        <header className="px-5 pt-10 lg:px-0 lg:pt-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate('/')}
            className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/50 bg-white/70 text-sky-700 shadow-premium backdrop-blur-xl"
            aria-label="Kembali"
          >
            <ArrowLeft className="h-6 w-6" />
          </motion.button>

          <div className="mb-9 flex items-center gap-5">
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-[26px] bg-[#2A4D88] shadow-lg">
              <Refrigerator className="relative z-10 h-8 w-8 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div className="min-w-0">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#7C94B8]">Smart Fridge Scan</p>
              <h1 className="text-[28px] font-black leading-none tracking-tight text-slate-950 sm:text-3xl">
                Isi <span className="text-[#2A4D88]">Kulkasmu?</span>
              </h1>
              <p className="mt-2 text-xs font-bold text-slate-500">Scan bahan, lalu CookEdu cari resep yang cocok dari database.</p>
            </div>
          </div>
        </header>

        <main className="grid gap-6 px-5 lg:grid-cols-[440px_minmax(0,1fr)] lg:items-start lg:px-0">
          <section className="space-y-5">
            <div className="overflow-hidden rounded-[34px] border border-white/80 bg-white/80 p-5 shadow-premium backdrop-blur-2xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#7C94B8]">Camera AI</p>
                  <h2 className="mt-1 text-lg font-black text-slate-950">Scan bahan langsung</h2>
                </div>
                <span className="rounded-full bg-[#D9D9D8] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#2A4D88]">
                  {sourceLabel}
                </span>
              </div>

              <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-slate-100">
                {cameraStream ? (
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                ) : capturedImage ? (
                  <img src={capturedImage} alt="Hasil scan kulkas" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#B1BBC8] text-white">
                      <Camera className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-black text-slate-800">Arahkan kamera ke bahan makanan</p>
                    <p className="mt-2 max-w-xs text-xs font-semibold leading-5 text-slate-500">
                      Foto lebih terang membuat deteksi bahan lebih akurat.
                    </p>
                  </div>
                )}

                {isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2A4D88]/80 text-white backdrop-blur-sm">
                    <motion.div
                      animate={{ y: [-80, 80] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 top-1/2 h-1 w-full bg-[#D9D9D8] shadow-glow-sm"
                    />
                    <Sparkles className="relative z-10 mb-3 h-10 w-10 animate-pulse" />
                    <p className="relative z-10 text-sm font-black uppercase tracking-[0.22em]">Menganalisis foto</p>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handlePhotoUpload(event.target.files?.[0])}
              />

              {cameraError && (
                <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {cameraError}
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                {cameraStream ? (
                  <>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      disabled={loading}
                      className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Ambil Foto
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-rose-600 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-rose-600/20"
                    >
                      <X className="h-4 w-4" />
                      Tutup
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={loading}
                      className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#2A4D88] text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#2A4D88]/20 disabled:opacity-50"
                    >
                      <Camera className="h-4 w-4" />
                      Kamera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#B1BBC8] bg-white text-xs font-black uppercase tracking-widest text-[#2A4D88] disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </button>
                  </>
                )}
              </div>

              {detectedIngredients.length > 0 && (
                <div className="mt-5 rounded-[24px] bg-[#F6F7F8] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#2A4D88]">Terdeteksi</p>
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detectedIngredients.map((item) => (
                      <span
                        key={`${item.name}-${item.confidence}`}
                        className="rounded-2xl border border-[#B1BBC8] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700"
                      >
                        {item.name} {Math.round(item.confidence * 100)}%
                      </span>
                    ))}
                  </div>
                  {scanNote && <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">{scanNote}</p>}
                </div>
              )}
            </div>

            <div className="rounded-[34px] border border-white/80 bg-white/80 p-6 shadow-premium backdrop-blur-2xl">
              <div className="relative mb-6">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && addIngredient(inputValue)}
                  placeholder="Tambah bahan manual..."
                  className="h-14 w-full rounded-3xl border-2 border-transparent bg-slate-50 px-5 pr-14 text-sm font-bold outline-none transition-all placeholder:text-slate-300 focus:border-[#7C94B8]/40"
                />
                <button
                  type="button"
                  onClick={() => addIngredient(inputValue)}
                  className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2A4D88] text-white shadow-lg"
                  aria-label="Tambah bahan"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-7 flex flex-wrap gap-2">
                <AnimatePresence>
                  {ingredients.map((ingredient) => (
                    <motion.span
                      key={ingredient}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center gap-2 rounded-2xl border border-[#B1BBC8]/60 bg-[#EDF1F6] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#2A4D88]"
                    >
                      {ingredient}
                      <button type="button" onClick={() => removeIngredient(ingredient)} aria-label={`Hapus ${ingredient}`}>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>

              <div className="space-y-5">
                {categories.map((category) => (
                  <div key={category} className="space-y-3">
                    <p className="ml-1 text-[9px] font-black uppercase tracking-widest text-slate-400">{category}</p>
                    <div className="flex flex-wrap gap-2">
                      {stapleIngredientsData.filter((item) => item.category === category).slice(0, 6).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => addIngredient(item.name)}
                          className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2 text-[10px] font-bold text-slate-500 shadow-sm transition-all hover:bg-[#EDF1F6] hover:text-[#2A4D88]"
                        >
                          <span className="text-xs">{item.icon}</span>
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => findRecipes()}
                disabled={ingredients.length === 0 || loading}
                className="mt-9 flex h-15 w-full items-center justify-center gap-3 rounded-[26px] bg-slate-950 text-[10px] font-black uppercase tracking-widest text-white shadow-xl disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sedang Mencari...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Cari Inspirasi Resep
                  </>
                )}
              </motion.button>
            </div>
          </section>

          <section className="min-w-0">
            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative flex h-64 flex-col items-center justify-center overflow-hidden rounded-[34px] border border-[#B1BBC8]/30 bg-[#EDF1F6] p-10 text-center"
                >
                  <motion.div
                    animate={{ y: [-100, 300] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 top-0 z-20 h-1 w-full bg-[#7C94B8]"
                  />
                  <Search className="mb-4 h-12 w-12 animate-pulse text-[#2A4D88]" />
                  <h3 className="text-xl font-black text-[#2A4D88]">Sedang Memindai...</h3>
                </motion.div>
              ) : hasScanned && recipes.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-[34px] border border-slate-100 bg-white/80 p-10 text-center"
                >
                  <Refrigerator className="mx-auto mb-4 h-12 w-12 text-slate-200" />
                  <h3 className="text-lg font-black text-slate-900">Tidak Ada Resep Cocok</h3>
                  <p className="mt-2 text-sm text-slate-400">Coba tambahkan bahan dasar lain atau scan ulang dari sudut berbeda.</p>
                </motion.div>
              ) : recipes.length > 0 ? (
                <div className="grid gap-5 lg:grid-cols-2">
                  {recipes.map((recipe, index) => (
                    <motion.article
                      key={recipe.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/recipes/${recipe.id}`)}
                      className="group cursor-pointer overflow-hidden rounded-[30px] border border-white bg-white/80 shadow-premium backdrop-blur-2xl transition-all hover:shadow-glow"
                    >
                      <div className="p-5">
                        <div className="mb-4 aspect-[16/10] overflow-hidden rounded-[24px] bg-slate-100">
                          <img
                            src={getImageUrl(recipe)}
                            alt={recipe.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(event) => {
                              event.currentTarget.src = '/assets/images/default-food-placeholder.webp'
                            }}
                          />
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <span className="rounded-full bg-[#EDF1F6] px-3 py-1 text-[8px] font-black uppercase tracking-widest text-[#2A4D88]">
                              Cocok {recipe.matchScore || Math.min(98, 45 + recipe.matchCount * 18)}%
                            </span>
                            <h4 className="mt-3 line-clamp-2 text-lg font-black leading-tight text-slate-950 group-hover:text-[#2A4D88]">
                              {recipe.title}
                            </h4>
                          </div>
                          <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#2A4D88]" />
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {recipe.cooking_time || 25}m
                          </span>
                          <span className="flex items-center gap-1 text-rose-500">
                            <Flame className="h-3.5 w-3.5" />
                            {recipe.nutritional_info?.calories || 0} Cal
                          </span>
                          {recipe.matchedIngredients?.slice(0, 2).map((item: string) => (
                            <span key={item} className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[34px] border border-[#B1BBC8]/30 bg-white/70 p-8 text-center shadow-premium">
                  <ImageIcon className="mx-auto mb-4 h-12 w-12 text-[#B1BBC8]" />
                  <h3 className="text-lg font-black text-slate-900">Scan atau pilih bahan dulu</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                    Setelah bahan terdeteksi, CookEdu akan membuka popup saran resep dari database.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </section>
        </main>
      </div>

      <AnimatePresence>
        {recommendationOpen && topRecipes.length > 0 && (
          <motion.div
            className="fixed inset-0 z-[1800] flex items-end bg-slate-950/45 p-3 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[32px] bg-white p-5 shadow-2xl sm:p-6"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#7C94B8]">Recipe Popup</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">Saran resep dari isi kulkas</h2>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Dipilih dari database berdasarkan bahan yang baru terdeteksi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRecommendationOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"
                  aria-label="Tutup popup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {topRecipes.map((recipe) => (
                  <button
                    key={recipe.id}
                    type="button"
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                    className="overflow-hidden rounded-[24px] border border-slate-100 bg-[#F6F7F8] text-left transition hover:border-[#7C94B8]"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                      <img
                        src={getImageUrl(recipe)}
                        alt={recipe.title}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = '/assets/images/default-food-placeholder.webp'
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <span className="rounded-full bg-white px-3 py-1 text-[8px] font-black uppercase tracking-widest text-[#2A4D88]">
                        Cocok {recipe.matchScore || 80}%
                      </span>
                      <h3 className="mt-3 line-clamp-2 text-base font-black leading-tight text-slate-950">{recipe.title}</h3>
                      <p className="mt-2 text-xs font-semibold text-slate-500 line-clamp-2">
                        {recipe.description || 'Resep CookEdu yang cocok dengan bahan hasil scan.'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
