import { useState, useEffect, useRef } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { recipeApi, authApi } from '../../lib/api'
import { 
  ArrowLeft, ArrowRight, X, Play, Pause, RotateCcw, 
  Loader2, Award, Home, User, Volume2, Timer as TimerIcon, Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

// Asset Imports
import bgPattern from '../../assets/food_drawing.jpg'

export default function CookingMode() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const queryParams = new URLSearchParams(location.search)
  const initialStep = parseInt(queryParams.get('step') || '0')
  const urlTimer = queryParams.get('timer')
  const urlUnit = queryParams.get('unit')

  const [currentStep, setCurrentStep] = useState(initialStep)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [loadingXp, setLoadingXp] = useState(false)
  const intervalRef = useRef<any>(null)

  const { data } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => recipeApi.show(Number(id)),
  })

  const recipe = data?.data?.data
  const steps = recipe?.steps || []
  const step = steps[currentStep]

  const speakInstruction = () => {
    if (!step?.instruction) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(step.instruction)
    utterance.lang = 'id-ID'
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    if (step) {
      speakInstruction()
    }
  }, [currentStep, step])

  useEffect(() => {
    let wakeLock: any = null
    const requestWakeLock = async () => {
      try { if ('wakeLock' in navigator) wakeLock = await (navigator as any).wakeLock.request('screen') } catch {}
    }
    requestWakeLock()
    return () => { if (wakeLock) wakeLock.release() }
  }, [])

  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false)
            try { new Audio('https://assets.mixkit.co/active_storage/sfx/1070/1070-preview.mp3').play() } catch {}
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [timerRunning, timerSeconds])

  useEffect(() => {
    setTimerRunning(false)
    if (urlTimer && parseInt(urlTimer) > 0) {
      let seconds = parseInt(urlTimer)
      if (urlUnit?.toLowerCase().includes('menit')) seconds *= 60
      if (urlUnit?.toLowerCase().includes('jam')) seconds *= 3600
      setTimerSeconds(seconds)
      setTimerRunning(true)
      navigate(`/cook/${id}?step=${currentStep}`, { replace: true })
    } else if (step?.duration) {
      setTimerSeconds(step.duration * 60)
    } else {
      setTimerSeconds(0)
    }
  }, [currentStep, step?.duration, urlTimer, urlUnit, id, navigate])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60); const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const [showSuccess, setShowSuccess] = useState(false)

  const handleFinish = async () => {
    setLoadingXp(true)
    try {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#0891B2', '#22D3EE', '#CFFAFE'] })
      await authApi.addXp(100)
      setShowSuccess(true)
    } catch (err) {
      setShowSuccess(true)
    } finally {
      setLoadingXp(false)
    }
  }

  const markStepComplete = (index: number) => {
    if (!completedSteps.includes(index)) setCompletedSteps([...completedSteps, index])
    if (index === steps.length - 1) handleFinish()
    else setCurrentStep(index + 1)
  }

  if (!recipe) return <div className="min-h-screen bg-[#F0F9FF] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-cyan-600" /></div>

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen relative font-sans overflow-x-hidden bg-[#F0F9FF] text-slate-900 pb-20">
      {/* GLOBAL BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-200/30 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: 'cover' }} />
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[50px] p-12 max-w-sm w-full text-center shadow-2xl relative overflow-hidden border border-white">
              <div className="w-24 h-24 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                 <Award className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-black mb-2 text-slate-900">Level Up!</h2>
              <div className="inline-flex items-center justify-center gap-2 mb-6 bg-cyan-100 py-1.5 px-4 rounded-full">
                 <span className="text-cyan-600 font-black text-[10px] uppercase tracking-widest">+100 XP</span>
              </div>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">Selamat! Resep <span className="font-bold text-slate-900">"{recipe.title}"</span> berhasil diselesaikan.</p>
              <button onClick={() => navigate(`/recipes/${id}`)} className="w-full py-5 bg-cyan-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[24px] shadow-xl hover:bg-cyan-700 transition-all">Kembali ke Resep</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-lg mx-auto p-6 flex flex-col min-h-screen">
        {/* HEADER PROGRESS */}
        <div className="w-full flex items-center justify-between gap-4 mb-10 pt-6">
          <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-xl flex items-center justify-center shadow-premium text-slate-400 hover:text-cyan-600 transition-colors shrink-0 border border-white">
             <X className="w-5 h-5" />
          </button>
          <div className="h-2 w-full bg-white/60 backdrop-blur-xl rounded-full overflow-hidden flex-1 border border-white">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="h-full bg-cyan-500" 
            />
          </div>
          <span className="text-[9px] font-black text-cyan-600 bg-cyan-50 px-3 py-1.5 rounded-full border border-cyan-100 uppercase tracking-widest">Langkah {currentStep + 1} / {steps.length}</span>
        </div>

        {/* INSTRUCTION CARD */}
        <div className="flex-1 flex flex-col justify-center gap-8">
           <AnimatePresence mode="wait">
              <motion.div 
                 key={currentStep}
                 initial={{ scale: 0.95, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.95, opacity: 0 }}
                 className="bg-white/70 backdrop-blur-2xl rounded-[45px] shadow-premium p-8 border border-white relative flex flex-col items-center"
              >
                 <div className="w-full h-64 bg-slate-100 rounded-[35px] overflow-hidden mb-8 relative">
                    <img src={recipe.image_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/40">
                      <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-white' : 'text-white/40'}`} />
                      <span className="text-[8px] font-black text-white uppercase tracking-widest">Audio ON</span>
                    </div>
                 </div>
                 
                 <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 mb-2">
                       <span className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-black text-xs">
                          {currentStep + 1}
                       </span>
                       <h2 className="text-xl font-black text-slate-900 tracking-tight">
                          {step?.title || "Instruksi"}
                       </h2>
                    </div>
                    
                    <p className="text-slate-600 leading-relaxed text-lg font-medium italic">
                       "{step?.instruction || ""}"
                    </p>
                 </div>

                 {timerSeconds > 0 && timerRunning && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full mt-8 p-6 bg-cyan-50 rounded-[32px] flex items-center justify-between border border-cyan-100">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                             <TimerIcon className="w-6 h-6 text-cyan-600" />
                          </div>
                          <div className="text-left">
                             <p className="text-[9px] font-black text-cyan-600 uppercase tracking-widest leading-none mb-1">Timer</p>
                             <p className="text-2xl font-black text-slate-900 leading-none">{formatTime(timerSeconds)}</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => setTimerRunning(!timerRunning)} className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-lg">
                             {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </button>
                          <button onClick={() => { setTimerRunning(false); setTimerSeconds(step?.duration ? step.duration * 60 : 0) }} className="w-12 h-12 rounded-2xl bg-white text-slate-400 flex items-center justify-center border border-slate-100 shadow-sm">
                             <RotateCcw className="w-5 h-5" />
                          </button>
                       </div>
                    </motion.div>
                 )}
              </motion.div>
           </AnimatePresence>
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="flex items-center gap-4 py-8">
           <button 
             onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} 
             disabled={currentStep === 0}
             className="w-16 h-16 rounded-[24px] bg-white/60 backdrop-blur-xl border border-white shadow-premium flex items-center justify-center text-slate-400 disabled:opacity-30"
           >
              <ArrowLeft className="w-6 h-6" />
           </button>
           <button 
             onClick={() => markStepComplete(currentStep)}
             className="flex-1 h-16 bg-cyan-600 text-white rounded-[24px] shadow-xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-cyan-700 transition-all"
           >
              {currentStep === steps.length - 1 ? (
                <><Check className="w-6 h-6" /> Selesai</>
              ) : (
                <><ArrowRight className="w-6 h-6" /> Berikutnya</>
              )}
           </button>
        </div>
      </div>
    </div>
  )
}
