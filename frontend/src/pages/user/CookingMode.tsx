import { useState, useEffect, useRef } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { recipeApi, authApi } from '../../lib/api'
import { 
  ArrowLeft, ArrowRight, X, Play, Pause, RotateCcw, 
  Loader2, Award, ChefHat, AlertTriangle, Home, User,
  Volume2, Timer as TimerIcon, Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import telorImg from '../../assets/telor.png'

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

  // Auto TTS on step change
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
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#0077B6', '#00B4D8', '#CAF0F8'] })
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

  if (!recipe) return <div className="min-h-screen bg-[#F4F9F8] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  // Format instruction to embed interactive timer capsule
  const formatInstruction = (text: string) => {
    // Simple regex to find "X menit"
    const regex = /(\d+)\s*(menit|detik)/gi;
    const parts = text.split(regex);
    
    if (parts.length === 1) return <>{text}</>;
    
    const elements = [];
    let i = 0;
    while (i < parts.length) {
      elements.push(<span key={`text-${i}`}>{parts[i]}</span>);
      if (i + 1 < parts.length && i + 2 < parts.length) {
        const val = parts[i + 1];
        const unit = parts[i + 2];
        elements.push(
          <button 
            key={`timer-${i}`}
            onClick={() => {
              setTimerSeconds(parseInt(val) * (unit.toLowerCase() === 'menit' ? 60 : 1));
              setTimerRunning(true);
            }}
            className="mx-1 px-3 py-1 bg-[#caf0f8] text-primary font-bold rounded-full text-sm border border-[#90e0ef] hover:scale-105 transition-transform inline-flex items-center gap-1 shadow-sm align-middle"
          >
            {timerRunning && timerSeconds > 0 ? (
              <span className="tabular-nums font-mono">{formatTime(timerSeconds)}</span>
            ) : (
              `${val} ${unit}`
            )}
          </button>
        );
        i += 3;
      } else {
        i++;
      }
    }
    return <>{elements}</>;
  }

  return (
    <div className="min-h-screen bg-[#F4F9F8] dark:bg-[#0A0A0A] p-4 md:p-8 flex flex-col justify-between font-sans overflow-hidden">
      
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-surface-card rounded-[40px] p-10 md:p-12 max-w-sm w-full text-center shadow-2xl relative overflow-hidden border border-slate-100">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                 <Award className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-3xl font-black mb-2 text-slate-800 dark:text-white">Level Up!</h2>
              <div className="inline-flex items-center justify-center gap-2 mb-6 bg-[#caf0f8] dark:bg-primary/20 py-1.5 px-4 rounded-full">
                 <span className="text-primary font-bold text-sm">+100 XP</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">Selamat! Resep <span className="font-bold text-slate-800 dark:text-white">"{recipe.title}"</span> berhasil diselesaikan.</p>
              <button onClick={() => navigate(`/recipes/${id}`)} className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-primary-dark text-white font-bold rounded-2xl transition-all shadow-md">Kembali ke Resep</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HEADER PROGRESS */}
      <div className="w-full flex items-center justify-between gap-4 max-w-4xl mx-auto mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0">
           <X className="w-5 h-5" />
        </button>
        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex-1">
          <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <span className="text-xs font-bold text-primary whitespace-nowrap bg-[#caf0f8] dark:bg-primary/20 px-3 py-1 rounded-full">Langkah {currentStep + 1} dari {steps.length}</span>
      </div>

      {/* 2. MAIN CARD (COOKING MODE INTERACTIVE) */}
      <div className="flex-1 flex items-center justify-center w-full max-w-4xl mx-auto">
         <AnimatePresence mode="wait">
            <motion.div 
               key={currentStep}
               initial={{ scale: 0.95, y: 20, opacity: 0 }}
               animate={{ scale: 1, y: 0, opacity: 1 }}
               exit={{ scale: 0.95, y: -20, opacity: 0 }}
               transition={{ type: "spring", stiffness: 300, damping: 25 }}
               className="w-full bg-white dark:bg-surface-card rounded-[40px] shadow-xl p-4 md:p-6 flex flex-col md:flex-row gap-6 md:gap-10 border border-slate-100 dark:border-white/5 relative items-center"
            >
               {/* Left/Top: HD Photo */}
               <div className="w-full md:w-1/2 h-64 md:h-[400px] bg-slate-100 dark:bg-black rounded-[35px] overflow-hidden relative shrink-0">
                  <img 
                     src={recipe.image_url} 
                     alt={recipe.title} 
                     className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                  />
                  {/* Floating AI Status in Image */}
                  <div className="absolute bottom-4 right-4">
                     <motion.div 
                        animate={{ 
                           scale: isSpeaking ? [1, 1.2, 1] : 1,
                           opacity: isSpeaking ? [0.8, 1, 0.8] : 0.5
                        }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-10 h-10 bg-primary rounded-full blur-md absolute inset-0"
                     />
                     <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full border border-white/50 flex items-center justify-center relative z-10">
                        <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-white' : 'text-white/50'}`} />
                     </div>
                  </div>
               </div>
               
               {/* Right/Bottom: Text Instruction */}
               <div className="w-full md:w-1/2 space-y-6 flex flex-col justify-center py-4">
                  <div className="inline-flex items-center gap-2">
                     <span className="w-8 h-8 rounded-full bg-[#caf0f8] dark:bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
                        {currentStep + 1}
                     </span>
                     <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                        {step?.title || "Instruksi Memasak"}
                     </h2>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg md:text-xl font-medium">
                     {formatInstruction(step?.instruction || "")}
                  </p>

                  {/* Built-in fallback timer UI if no text timer found but duration exists */}
                  {timerSeconds > 0 && timerRunning && (
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-[#caf0f8] dark:bg-primary/20 rounded-2xl flex items-center justify-between border border-[#90e0ef] dark:border-primary/50">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-white dark:bg-black/20 flex items-center justify-center">
                              <TimerIcon className="w-5 h-5 text-primary" />
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Sisa Waktu</p>
                              <p className="text-2xl font-mono font-black text-slate-800 dark:text-white leading-none">{formatTime(timerSeconds)}</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => setTimerRunning(!timerRunning)} className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
                              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                           </button>
                           <button onClick={() => { setTimerRunning(false); setTimerSeconds(step?.duration ? step.duration * 60 : 0) }} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 text-slate-400 flex items-center justify-center border border-slate-200 dark:border-white/10">
                              <RotateCcw className="w-4 h-4" />
                           </button>
                        </div>
                     </motion.div>
                  )}
               </div>
               
               {/* Desktop Side Navigation Arrows overlay */}
               <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} className="hidden md:flex absolute -left-6 w-12 h-12 bg-white dark:bg-surface-card rounded-full shadow-lg border border-slate-100 dark:border-white/10 items-center justify-center text-slate-400 hover:text-primary disabled:opacity-0 transition-all z-20">
                  <ArrowLeft className="w-5 h-5" />
               </button>
               <button onClick={() => markStepComplete(currentStep)} className="hidden md:flex absolute -right-6 w-12 h-12 bg-primary rounded-full shadow-lg items-center justify-center text-white hover:scale-110 transition-transform z-20">
                  {currentStep === steps.length - 1 ? <Check className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
               </button>
            </motion.div>
         </AnimatePresence>
      </div>

      {/* 3. PREMIUM FLOATING BOTTOM NAVIGATION & AI BUTTON */}
      <div className="w-full max-w-md mx-auto relative bg-white/90 dark:bg-surface-card/90 backdrop-blur-lg shadow-2xl rounded-full p-3 flex items-center justify-between border border-slate-100 dark:border-white/10 z-50 mt-6">
        <button onClick={() => navigate('/')} className="flex flex-col items-center justify-center w-12 h-12 text-slate-400 hover:text-[#03045E] dark:hover:text-white transition-colors">
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Beranda</span>
        </button>
        
        {/* INTERACTIVE AI BUTTON (FAB) */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <button 
             onClick={() => window.dispatchEvent(new CustomEvent('open-ai-chat'))}
             className="w-16 h-16 bg-gradient-to-tr from-[#0077B6] to-[#03045E] rounded-full flex items-center justify-center text-white shadow-[0_10px_20px_rgba(3,4,94,0.4)] hover:scale-110 active:scale-95 transition-all ring-4 ring-white dark:ring-surface-card overflow-hidden group"
          >
             <motion.img 
               src={telorImg} 
               alt="Egg AI" 
               animate={{ rotate: [-10, 10, -10], y: [0, -3, 0] }}
               transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
               className="w-10 h-10 drop-shadow-xl filter contrast-125"
             />
          </button>
        </div>

        <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center w-12 h-12 text-slate-400 hover:text-[#03045E] dark:hover:text-white transition-colors">
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Profil</span>
        </button>
      </div>

      {/* Mobile Sticky Next Button */}
      <div className="md:hidden fixed bottom-28 right-4 z-40">
         <button onClick={() => markStepComplete(currentStep)} className="w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform">
            {currentStep === steps.length - 1 ? <Check className="w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
         </button>
      </div>

    </div>
  )
}
