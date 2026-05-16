import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { recipeApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { 
  ArrowLeft, Clock, ShoppingBag, Check, Plus, 
  Minus, ListChecks, Share2, Download, Play, 
  Loader2, Timer, Sparkles, MessageSquare, Star, 
  TrendingUp, Award, Camera, PlayCircle, Info
} from 'lucide-react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'

// Culinary Glossary Data
const CULINARY_GLOSSARY: Record<string, string> = {
  'Sauté': 'Menumis cepat dengan sedikit minyak pada api besar agar tekstur tetap terjaga.',
  'Shocking': 'Proses merendam bahan makanan yang baru direbus ke air es untuk menghentikan proses pematangan.',
  'Julienne': 'Teknik memotong sayuran menjadi irisan panjang dan tipis seperti korek api.',
  'Mirepoix': 'Campuran sayuran (wortel, seledri, bombay) yang dipotong dadu sebagai dasar rasa kaldu.',
  'Blanching': 'Teknik merebus sebentar dalam air mendidih lalu segera didinginkan.',
  'Simmering': 'Teknik memasak dengan api kecil hingga air hanya mengeluarkan gelembung kecil sesekali.',
  'Deglaze': 'Menambahkan cairan ke wajan panas bekas menumis untuk melarutkan sisa bumbu.',
  'Basting': 'Menyiramkan minyak/mentega panas ke atas bahan selama memasak agar lembap.',
  'Al Dente': 'Tingkat kematangan pasta/sayuran yang masih memiliki tekstur gigit.',
  'Plating': 'Seni menata makanan di atas piring agar menarik secara visual.'
}

const COMMUNITY_PHOTOS = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&q=80&w=200'
]

function AnimatedCounter({ value, unit }: { value: number, unit: string }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 })
  const displayValue = useTransform(spring, (current) => Math.round(current))
  useEffect(() => { spring.set(value) }, [value, spring])
  return (
    <div className="flex items-baseline gap-1">
      <motion.span className="text-2xl font-black tracking-tight">{displayValue}</motion.span>
      <span className="text-[10px] font-bold opacity-40 uppercase">{unit}</span>
    </div>
  )
}

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([])
  const [servings, setServings] = useState(1)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [rating, setRating] = useState({ flavor: 5, difficulty: 3, time: 4 })
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => { audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3') }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => recipeApi.show(Number(id)),
  })

  const recipe = data?.data?.data

  const toggleIngredient = (index: number) => {
    if ('vibrate' in navigator) navigator.vibrate(10)
    if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}) }
    setCheckedIngredients(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index])
  }

  const scaleAmount = (amount: any) => {
    if (!recipe) return amount
    const factor = servings / (recipe.servings || 1)
    const num = parseFloat(amount)
    return isNaN(num) ? amount : (num * factor).toFixed(1).replace(/\.0$/, '')
  }

  const exportShoppingList = (type: 'whatsapp' | 'copy') => {
    if (!recipe) return
    const unchecked = recipe.ingredients.filter((_: any, i: number) => !checkedIngredients.includes(i))
    if (unchecked.length === 0) return alert('Semua bahan sudah diceklis!')
    const text = `🛒 *DAFTAR BELANJA COOKEDU*\nMenu: ${recipe.title}\n\n${unchecked.map((ing: any) => `- ${ing.item} (${scaleAmount(ing.amount)} ${ing.unit})`).join('\n')}\n\nSent from CookEdu App`
    if (type === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    else { navigator.clipboard.writeText(text); alert('Disalin ke clipboard!') }
    setShowExportModal(false)
  }

  const renderInstruction = (text: string, recipeId: string, stepIndex: number) => {
    const timeRegex = /(\d+)\s*(menit|detik|jam)/gi
    const glossaryTerms = Object.keys(CULINARY_GLOSSARY).join('|')
    const glossaryRegex = new RegExp(`\\b(${glossaryTerms})\\b`, 'gi')
    
    type Part = { type: 'text'; content: string } | { type: 'timer'; val: string; unit: string } | { type: 'glossary'; term: string }
    let parts: Part[] = [{ type: 'text', content: text }]

    parts = parts.flatMap(p => {
      if (p.type !== 'text') return p
      const segs = p.content.split(timeRegex)
      const res: Part[] = []
      for (let i = 0; i < segs.length; i++) {
        if (i % 3 === 0) { if (segs[i]) res.push({ type: 'text', content: segs[i] }) }
        else if (i % 3 === 1) res.push({ type: 'timer', val: segs[i], unit: segs[i+1] })
      }
      return res
    })

    parts = parts.flatMap(p => {
      if (p.type !== 'text') return p
      const res: Part[] = []
      let lastIdx = 0; let match
      glossaryRegex.lastIndex = 0
      while ((match = glossaryRegex.exec(p.content)) !== null) {
        if (match.index > lastIdx) res.push({ type: 'text', content: p.content.substring(lastIdx, match.index) })
        res.push({ type: 'glossary', term: match[1] })
        lastIdx = match.index + match[0].length
      }
      if (lastIdx < p.content.length) res.push({ type: 'text', content: p.content.substring(lastIdx) })
      return res
    })

    return parts.map((p, i) => {
      if (p.type === 'timer') return <Link key={i} to={`/cook/${recipeId}?step=${stepIndex}&timer=${p.val}&unit=${p.unit}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-md font-black hover:bg-primary hover:text-white transition-all border border-primary/20"><Timer className="w-3 h-3" /> {p.val} {p.unit}</Link>
      if (p.type === 'glossary') return (
        <span key={i} onClick={(e) => { e.stopPropagation(); setActiveTooltip(p.term) }} className="relative inline-block cursor-help group">
          <span className="border-b-2 border-dotted border-secondary text-secondary font-black hover:text-primary transition-colors">{p.term}</span>
          <AnimatePresence>
            {activeTooltip === p.term && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-4 bg-black text-white rounded-2xl text-[10px] font-bold leading-relaxed shadow-2xl z-50 border border-white/10"><p className="text-secondary uppercase tracking-widest mb-1">{p.term}</p>{CULINARY_GLOSSARY[p.term]}<div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black" /></motion.div>
            )}
          </AnimatePresence>
        </span>
      )
      return p.content
    })
  }

  if (isLoading || !recipe) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>

  const factor = servings / (recipe.servings || 1)
  const isReadyToCook = recipe && recipe.ingredients && checkedIngredients.length === recipe.ingredients.length

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto pb-40 relative px-4 select-none" onClick={() => setActiveTooltip(null)}>
      <div className="absolute top-40 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 pt-10">
        <div className="relative group mb-12">
          <div className="absolute top-8 left-8 z-20 flex gap-3">
             <button onClick={() => navigate(-1)} className="w-12 h-12 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-black/40 transition-all"><ArrowLeft className="w-6 h-6" /></button>
          </div>
          <div className="absolute top-8 right-8 z-20 flex gap-3">
             <button onClick={() => setShowShareModal(true)} className="w-12 h-12 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-black/40 transition-all"><Share2 className="w-6 h-6" /></button>
          </div>

          <div className="h-[450px] md:h-[600px] w-full overflow-hidden rounded-[50px] relative shadow-2xl">
            <motion.img initial={{ scale: 1.1 }} animate={{ scale: 1 }} src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
            <div className="absolute bottom-12 left-10 right-10 text-white">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-5 py-2 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest">{recipe.category?.name}</span>
                <span className="px-5 py-2 bg-white/20 backdrop-blur-xl border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">{recipe.difficulty}</span>
                <span className="px-5 py-2 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Star className="w-3 h-3 fill-current text-yellow-400" /> 4.9</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight leading-tight">{recipe.title}</h1>
              <p className="text-white/80 text-lg max-w-2xl font-medium leading-relaxed">{recipe.description}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Kalori', value: Math.round((recipe.nutritional_info?.calories || 0) * factor), unit: 'kkal' },
            { label: 'Protein', value: Math.round((recipe.nutritional_info?.protein || 0) * factor), unit: 'g' },
            { label: 'Karbo', value: Math.round((recipe.nutritional_info?.carbs || 0) * factor), unit: 'g' },
            { label: 'Lemak', value: Math.round((recipe.nutritional_info?.fat || 0) * factor), unit: 'g' },
          ].map((nut, i) => (
            <div key={i} className="bg-white dark:bg-surface-card p-6 rounded-[35px] shadow-premium flex flex-col items-center text-center">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">{nut.label}</span>
              <AnimatedCounter value={nut.value} unit={nut.unit} />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white dark:bg-surface-card rounded-[45px] p-10 shadow-premium">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><ShoppingBag className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-bold tracking-tight">Daftar Bahan</h2>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-white/10 p-1.5 rounded-2xl">
                  <button onClick={() => setServings(Math.max(1, servings - 1))} className="w-8 h-8 rounded-xl bg-white dark:bg-black flex items-center justify-center shadow-sm"><Minus className="w-4 h-4" /></button>
                  <span className="text-lg font-black w-6 text-center">{servings}</span>
                  <button onClick={() => setServings(servings + 1)} className="w-8 h-8 rounded-xl bg-white dark:bg-black flex items-center justify-center shadow-sm"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {recipe.ingredients?.map((ing: any, i: number) => (
                  <motion.div key={i} onClick={() => toggleIngredient(i)} className={`flex items-center gap-4 p-5 rounded-[25px] cursor-pointer transition-all ${checkedIngredients.includes(i) ? 'bg-primary/5 opacity-60' : 'bg-gray-50 dark:bg-white/5 hover:bg-primary/5'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${checkedIngredients.includes(i) ? 'bg-primary text-white' : 'bg-white dark:bg-black text-gray-200'}`}>{checkedIngredients.includes(i) ? <Check className="w-5 h-5" /> : <Plus className="w-4 h-4" />}</div>
                    <div className="flex-1">
                      <p className={`font-black text-sm ${checkedIngredients.includes(i) ? 'line-through' : ''}`}>{ing.item}</p>
                      <p className="text-[10px] text-primary font-black uppercase">{scaleAmount(ing.amount)} {ing.unit}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <button onClick={() => setShowExportModal(true)} className="w-full py-5 bg-gray-50 dark:bg-white/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all border border-transparent hover:border-primary/20">Ekspor Daftar Belanja</button>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between px-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary"><ListChecks className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-bold tracking-tight">Langkah Memasak</h2>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-[10px] font-black text-secondary uppercase tracking-widest animate-pulse"><TrendingUp className="w-3 h-3" /> Step-by-Step Sync</div>
              </div>
              {recipe.steps?.map((step: any, i: number) => (
                <div key={i} className="flex flex-col gap-6 p-8 rounded-[40px] bg-white dark:bg-surface-card shadow-premium relative group border border-transparent hover:border-primary/20 transition-all">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-black rounded-2xl flex items-center justify-center text-xl font-black text-primary shrink-0">{i + 1}</div>
                    <div className="flex-1 pt-1">
                       <div className="text-text-primary font-bold leading-relaxed text-lg mb-6">{renderInstruction(step.instruction, recipe.id, i)}</div>
                       <div className="flex items-center gap-3">
                         <div className="flex items-center gap-2 text-[8px] font-black text-gray-400 bg-gray-50 dark:bg-black px-4 py-2 rounded-full uppercase tracking-widest"><Clock className="w-3 h-3" /> {step.duration}m</div>
                         <Link to={`/cook/${recipe.id}?step=${i}`} className="flex items-center gap-2 text-[8px] font-black text-white bg-primary px-4 py-2 rounded-full uppercase tracking-widest shadow-glow"><Play className="w-3 h-3 fill-current" /> Play Loop</Link>
                       </div>
                    </div>
                  </div>
                  {/* Technique Loop Simulation (GIF style) */}
                  {i % 2 === 0 && (
                    <div className="mt-4 h-48 rounded-[30px] overflow-hidden relative group/loop">
                       <img src={`https://images.unsplash.com/photo-1594385208974-2e75f9d3a513?auto=format&fit=crop&q=80&w=600`} className="w-full h-full object-cover opacity-60 grayscale group-hover/loop:grayscale-0 group-hover/loop:opacity-100 transition-all" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"><PlayCircle className="w-6 h-6" /></div>
                       </div>
                       <div className="absolute bottom-4 left-6 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase tracking-widest">Technique Loop</div>
                    </div>
                  )}
                </div>
              ))}
            </section>

            {/* User Gallery Section */}
            <section className="bg-white dark:bg-surface-card rounded-[45px] p-10 shadow-premium">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Camera className="w-6 h-6" /></div>
                     <h2 className="text-2xl font-bold tracking-tight">Galeri Komunitas</h2>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">124 Masakan</span>
               </div>
               <div className="grid grid-cols-4 gap-4">
                  {COMMUNITY_PHOTOS.map((src, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.05 }} className="h-28 rounded-2xl overflow-hidden relative group cursor-pointer">
                       <img src={src} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><MessageSquare className="w-5 h-5 text-white" /></div>
                    </motion.div>
                  ))}
                  <button className="h-28 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                     <Plus className="w-6 h-6 text-gray-300" />
                     <span className="text-[8px] font-black text-gray-400 uppercase">Upload Hasil</span>
                  </button>
               </div>
            </section>
          </div>

          <div className="space-y-8">
             {/* Professional Rating */}
             <section className="bg-white dark:bg-surface-card rounded-[45px] p-10 shadow-premium">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3"><Star className="w-5 h-5 text-yellow-500 fill-current" /> Penilaian Ahli</h3>
                <div className="space-y-6">
                   {[
                     { label: 'Ketepatan Rasa', val: 95 },
                     { label: 'Kesulitan Teknik', val: 65 },
                     { label: 'Kesesuaian Waktu', val: 88 }
                   ].map(r => (
                     <div key={r.label}>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2"><span>{r.label}</span><span className="text-primary">{r.val}%</span></div>
                        <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${r.val}%` }} className="h-full bg-primary shadow-glow" />
                        </div>
                     </div>
                   ))}
                </div>
             </section>

             <section className="bg-black text-white rounded-[45px] p-10 shadow-2xl relative overflow-hidden">
                <Sparkles className="w-10 h-10 mb-6 text-primary animate-pulse" />
                <h3 className="text-2xl font-black mb-4">Tips Pro Chef</h3>
                <p className="text-gray-400 font-bold leading-relaxed mb-8">Rahasia restoran bintang 5: Selalu gunakan teknik **Mirepoix** untuk membangun fondasi rasa yang dalam pada setiap kuah atau kaldu Anda.</p>
                <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest border border-white/10 transition-all flex items-center justify-center gap-3"><Info className="w-4 h-4" /> Pelajari Teknik</button>
             </section>

             <Link to={isReadyToCook ? `/cook/${recipe.id}` : '#'} className={`flex flex-col items-center justify-center p-12 rounded-[50px] text-white shadow-glow text-center transition-all group ${isReadyToCook ? 'bg-primary scale-105' : 'bg-gray-200 dark:bg-white/10 grayscale cursor-not-allowed'}`}>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Play className="w-8 h-8 fill-current" /></div>
                <h3 className="text-2xl font-black mb-1">{isReadyToCook ? 'Mulai Masak' : 'Siapkan Bahan'}</h3>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Interactive Smart Assistant</p>
             </Link>
          </div>
        </div>
      </div>

      {/* Share Poster Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowShareModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative z-10 w-full max-w-sm">
               <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl">
                  <div className="h-[400px] relative">
                    <img src={recipe.image_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8 text-white">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">CookEdu Signature</p>
                       <h2 className="text-3xl font-black leading-tight mb-4">{recipe.title}</h2>
                       <div className="flex gap-4">
                          <div className="text-center"><p className="text-[8px] opacity-60 uppercase font-black">Calories</p><p className="text-lg font-black">{recipe.nutritional_info?.calories}</p></div>
                          <div className="text-center"><p className="text-[8px] opacity-60 uppercase font-black">Protein</p><p className="text-lg font-black">{recipe.nutritional_info?.protein}g</p></div>
                          <div className="text-center"><p className="text-[8px] opacity-60 uppercase font-black">Difficulty</p><p className="text-lg font-black capitalize">{recipe.difficulty}</p></div>
                       </div>
                    </div>
                  </div>
                  <div className="p-8 text-center bg-gray-50">
                     <p className="text-gray-500 font-bold mb-8 italic">"Kuasai seni kuliner dengan panduan koki profesional hanya di CookEdu."</p>
                     <div className="flex gap-4">
                        <button className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"><Share2 className="w-4 h-4" /> Share Recipe</button>
                        <button className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center"><Download className="w-5 h-5" /></button>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExportModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white dark:bg-surface-card w-full max-w-sm rounded-[45px] p-10 relative z-10 shadow-2xl">
              <h2 className="text-2xl font-black tracking-tight mb-8">Ekspor Bahan</h2>
              <div className="space-y-4">
                <button onClick={() => exportShoppingList('whatsapp')} className="w-full py-5 rounded-2xl bg-[#25D366] text-white font-black uppercase text-xs tracking-widest shadow-lg flex items-center justify-center gap-3">WhatsApp</button>
                <button onClick={() => exportShoppingList('copy')} className="w-full py-5 rounded-2xl bg-gray-900 text-white font-black uppercase text-xs tracking-widest shadow-lg flex items-center justify-center gap-3">Salin Teks</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
