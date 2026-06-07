import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { recipeApi, authApi } from '../../lib/api';
import { 
  ArrowLeft, ArrowRight, X, Play, Pause, RotateCcw, 
  Loader2, Award, Home, User, Volume2, Timer as TimerIcon, Check, Sparkles
} from '@icons/CookEduIcons';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// Static Recipes Fallback import
import { recipes as staticRecipes } from '../../data/recipes';
import { getStoredRecipes } from '../../data/recipeStore';

// Asset Imports
import bgPattern from '../../assets/food_drawing.jpg';

interface NormalizedStep {
  title: string;
  instruction: string;
  duration: number; // in minutes
}

export default function CookingMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const initialStep = parseInt(queryParams.get('step') || '0');
  const urlTimer = queryParams.get('timer');
  const urlUnit = queryParams.get('unit');

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loadingXp, setLoadingXp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const intervalRef = useRef<any>(null);

  // 1. API Fetch Query
  const { data: apiData, isLoading: apiLoading } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => recipeApi.show(Number(id)),
    enabled: !!id && !isNaN(Number(id)) && !id.startsWith('rec_'),
    retry: 1
  });

  // 2. Resolve Recipe (API Response -> Fallback Local Array -> Fallback LocalStorage Catalog)
  const resolvedRecipe = React.useMemo(() => {
    if (apiData?.data?.data) {
      return apiData.data.data;
    }
    
    // Look up in static local array
    const staticItem = staticRecipes.find(r => r.id === Number(id));
    if (staticItem) {
      return {
        title: staticItem.title,
        image_url: staticItem.imageUrl,
        category: staticItem.category,
        instructions: staticItem.instructions,
        steps: staticItem.instructions.map((inst, index) => ({
          title: `Langkah ${index + 1}`,
          instruction: inst,
          duration: 5 // Default 5 mins
        }))
      };
    }

    // Look up in local storage custom recipes
    const customItems = getStoredRecipes();
    const customItem = customItems.find(r => r.id === id);
    if (customItem) {
      return {
        title: customItem.title,
        image_url: customItem.image,
        category: customItem.category,
        instructions: ["Siapkan bahan utama di atas meja dapur.", "Iris tipis bumbu dan tumis hingga mengeluarkan bau harum segar.", "Masukkan bahan utama dan tambahkan air secukupnya.", "Masak dengan api sedang selama 15 menit hingga matang sempurna."],
        steps: [
          { title: "Langkah 1", instruction: "Siapkan bahan utama di atas meja dapur.", duration: 2 },
          { title: "Langkah 2", instruction: "Iris tipis bumbu dan tumis hingga mengeluarkan bau harum segar.", duration: 3 },
          { title: "Langkah 3", instruction: "Masukkan bahan utama dan tambahkan air secukupnya.", duration: 5 },
          { title: "Langkah 4", instruction: "Masak dengan api sedang selama 15 menit hingga matang sempurna.", duration: 15 }
        ]
      };
    }

    return null;
  }, [apiData, id]);

  // Normalize steps to ensure 100% compatibility across all sources
  const steps: NormalizedStep[] = React.useMemo(() => {
    if (!resolvedRecipe) return [];
    if (resolvedRecipe.steps && resolvedRecipe.steps.length > 0) {
      return resolvedRecipe.steps.map((s: any, idx: number) => ({
        title: s.title || `Langkah ${idx + 1}`,
        instruction: s.instruction || s.content || "",
        duration: s.duration || 5
      }));
    }
    if (resolvedRecipe.instructions && resolvedRecipe.instructions.length > 0) {
      return resolvedRecipe.instructions.map((inst: string, idx: number) => ({
        title: `Langkah ${idx + 1}`,
        instruction: inst,
        duration: 5
      }));
    }
    return [];
  }, [resolvedRecipe]);

  const step = steps[currentStep];

  // Immersive Indonesian Audio TTS
  const speakInstruction = () => {
    if (!step?.instruction) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(step.instruction);
      utterance.lang = 'id-ID';
      
      // Select indonesian voice if available
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
      if (idVoice) utterance.voice = idVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Text-to-speech failed to initiate.', e);
    }
  };

  useEffect(() => {
    if (step) {
      speakInstruction();
    }
    return () => {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    };
  }, [currentStep, step]);

  // Screen Wake Lock API to prevent mobile lock screens
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try { 
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } 
      } catch (err) {
        console.warn('Wake Lock request skipped.', err);
      }
    };
    requestWakeLock();
    return () => { 
      if (wakeLock) {
        try { wakeLock.release(); } catch (e) {}
      } 
    };
  }, []);

  // Timer Countdown Logic
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            try { 
              // Elite chime alert sound
              const alarm = new Audio('https://assets.mixkit.co/active_storage/sfx/1070/1070-preview.mp3');
              alarm.volume = 0.5;
              alarm.play(); 
            } catch (e) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning, timerSeconds]);

  // Timer Initialization & Parsing
  useEffect(() => {
    setTimerRunning(false);
    if (urlTimer && parseInt(urlTimer) > 0) {
      let seconds = parseInt(urlTimer);
      if (urlUnit?.toLowerCase().includes('menit')) seconds *= 60;
      if (urlUnit?.toLowerCase().includes('jam')) seconds *= 3600;
      setTimerSeconds(seconds);
      setTimerRunning(true);
      navigate(`/cook/${id}?step=${currentStep}`, { replace: true });
    } else if (step?.duration) {
      setTimerSeconds(step.duration * 60);
    } else {
      setTimerSeconds(0);
    }
  }, [currentStep, step?.duration, urlTimer, urlUnit, id, navigate]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60); 
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleFinish = async () => {
    setLoadingXp(true);
    try {
      // Premium Canvas Confetti explosion
      confetti({ 
        particleCount: 180, 
        spread: 80, 
        origin: { y: 0.55 }, 
        colors: ['#2A4D88', '#7C94B8', '#B1BBC8', '#D9D9D8']
      });
      
      // API call fallback support
      if (authApi.addXp) {
        await authApi.addXp(100);
      }
      setShowSuccess(true);
    } catch (err) {
      setShowSuccess(true);
    } finally {
      setLoadingXp(false);
    }
  };

  const markStepComplete = (index: number) => {
    if (!completedSteps.includes(index)) {
      setCompletedSteps([...completedSteps, index]);
    }
    if (index === steps.length - 1) {
      handleFinish();
    } else {
      setCurrentStep(index + 1);
    }
  };

  // Safe Loading State
  if (apiLoading && !resolvedRecipe) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-sky-500" />
        <span className="text-xs font-bold text-slate-500 tracking-wider">Menyiapkan Dapur Masterchef...</span>
      </div>
    );
  }

  // Not Found State
  if (!resolvedRecipe) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Award className="w-16 h-16 text-sky-300 mb-4 animate-bounce" />
        <h2 className="text-xl font-black text-slate-800 mb-2">Resep Tidak Ditemukan</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6">Kami gagal mencari detail instruksi langkah masak resep ini. Silakan coba resep lainnya.</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-8 py-3.5 bg-gradient-to-r from-sky-500 to-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-transform"
        >
          Kembali ke Kitchen
        </button>
      </div>
    );
  }

  const progressPercentage = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <div className="min-h-screen relative font-sans overflow-x-hidden bg-transparent text-slate-800 dark:text-slate-100 pb-20">
      
      {/* GLOBAL BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-200/30 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: 'cover' }} />
      </div>

      {/* SUCCESS MODAL CEREMONY */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.85, y: 30 }} 
              animate={{ scale: 1, y: 0 }} 
              className="bg-white rounded-[45px] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden border border-white"
            >
              {/* Gold Top Light Orb */}
              <div className="absolute top-[-50px] inset-x-0 mx-auto w-36 h-36 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

              <div className="w-20 h-20 bg-gradient-to-tr from-sky-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-sky-500/30">
                 <Award className="w-10 h-10 text-white animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-black mb-1.5 text-slate-800 tracking-tight">Koki Hebat!</h2>
              
              <div className="inline-flex items-center justify-center gap-1.5 mb-5 bg-teal-50 border border-teal-100 py-1.5 px-4 rounded-full">
                 <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                 <span className="text-teal-600 font-extrabold text-[10px] uppercase tracking-widest">+100 XP MASAK</span>
              </div>
              
              <p className="text-slate-500 text-xs mb-8 leading-relaxed font-semibold">
                Selamat! Anda baru saja menyelesaikan resep <span className="font-extrabold text-slate-800">"{resolvedRecipe.title}"</span> dengan sempurna. Bakat memasak Anda bertumbuh pesat!
              </p>
              
              <button 
                onClick={() => navigate('/recipes')} 
                className="w-full py-4.5 bg-gradient-to-r from-sky-500 to-teal-600 text-white font-extrabold text-xs uppercase tracking-[0.2em] rounded-[22px] shadow-lg shadow-sky-500/25 active:scale-95 transition-transform"
              >
                Kembali ke Beranda
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-lg mx-auto p-6 flex flex-col min-h-screen">
        
        {/* ================= HEADER PROGRESS PROGRESSION ================= */}
        <div className="w-full flex items-center justify-between gap-4 mb-8 pt-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-11 h-11 rounded-2xl bg-white border border-sky-100/80 shadow-sm flex items-center justify-center text-slate-400 hover:text-sky-600 active:scale-95 transition-transform shrink-0"
            title="Keluar dari mode memasak"
          >
             <X className="w-4 h-4 text-sky-600" />
          </button>
          
          <div className="h-2.5 w-full bg-white/70 border border-sky-100/60 rounded-full overflow-hidden flex-1 relative shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="h-full bg-gradient-to-r from-sky-500 to-teal-500 rounded-full" 
            />
          </div>
          
          <span className="text-[9px] font-black text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100 uppercase tracking-wider shrink-0 shadow-sm">
            Langkah {currentStep + 1} / {steps.length}
          </span>
        </div>

        {/* ================= STEP PRESENTATION SWIPE CARD ================= */}
        <div className="flex-1 flex flex-col justify-center gap-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentStep}
              initial={{ scale: 0.96, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="bg-white/80 backdrop-blur-2xl rounded-[40px] shadow-xl p-6 border border-sky-100/60 relative flex flex-col items-center min-h-[500px] justify-between"
            >
              {/* Recipe Step Image Cover */}
              <div className="w-full h-56 bg-sky-50 rounded-[28px] overflow-hidden relative shadow-sm border border-sky-100/40">
                <img 
                  src={resolvedRecipe.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"} 
                  alt={resolvedRecipe.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
                
                {/* Voice assistant badge indicator */}
                <button
                  onClick={speakInstruction}
                  className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 hover:bg-white/35 active:scale-95 transition-transform"
                  title="Dengarkan Suara Koki"
                >
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-teal-400 animate-bounce' : 'text-white'}`} />
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">
                    {isSpeaking ? 'Membaca...' : 'Ulang Audio'}
                  </span>
                </button>
              </div>

              {/* Title & Step Text */}
              <div className="text-center space-y-4 px-2 my-6">
                <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-100/60 px-3.5 py-1.5 rounded-full shadow-inner">
                   <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-500 to-teal-500 text-white flex items-center justify-center font-black text-[10px]">
                      {currentStep + 1}
                   </div>
                   <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {step?.title || `Langkah ${currentStep + 1}`}
                   </h2>
                </div>
                
                <p className="text-slate-700 leading-relaxed text-base font-extrabold italic px-2">
                   "{step?.instruction || ""}"
                </p>
              </div>

              {/* Countdown Ticking Timer Circular Card */}
              {timerSeconds > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="w-full p-4 bg-sky-50/70 border border-sky-100/60 rounded-[30px] flex items-center justify-between shadow-inner"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl bg-white border border-sky-100 flex items-center justify-center shadow-sm relative ${timerRunning ? 'animate-pulse' : ''}`}>
                       <TimerIcon className={`w-5 h-5 ${timerRunning ? 'text-teal-500' : 'text-sky-500'}`} />
                    </div>
                    <div className="text-left">
                       <p className="text-[8px] font-black text-sky-500 uppercase tracking-widest leading-none mb-1">Penghitung Waktu</p>
                       <p className="text-xl font-black text-slate-800 tracking-tight leading-none">
                         {formatTime(timerSeconds)}
                       </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setTimerRunning(!timerRunning)} 
                      className={`w-11 h-11 rounded-xl text-white flex items-center justify-center shadow-md active:scale-95 transition-all ${
                        timerRunning ? 'bg-amber-500 shadow-amber-500/20' : 'bg-teal-500 shadow-teal-500/20'
                      }`}
                      title={timerRunning ? "Jeda" : "Mulai"}
                    >
                       {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <button 
                      onClick={() => { 
                        setTimerRunning(false); 
                        setTimerSeconds(step?.duration ? step.duration * 60 : 300); 
                      }} 
                      className="w-11 h-11 rounded-xl bg-white text-slate-400 flex items-center justify-center border border-sky-100/60 shadow-sm active:scale-95 transition-transform"
                      title="Reset Timer"
                    >
                       <RotateCcw className="w-4 h-4 text-sky-600" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="w-full text-center py-2 text-[10px] font-bold text-slate-400 tracking-wider">
                  ⚠️ Langkah ini tidak memerlukan durasi masak khusus
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ================= CONTROLS STEPS NAVIGATOR ================= */}
        <div className="flex items-center gap-4 py-6 z-25">
           <button 
             onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} 
             disabled={currentStep === 0}
             className="w-16 h-16 rounded-[22px] bg-white/70 border border-sky-100/70 shadow-md flex items-center justify-center text-slate-400 hover:text-sky-600 disabled:opacity-30 disabled:scale-100 active:scale-95 transition-transform"
             title="Langkah sebelumnya"
           >
              <ArrowLeft className="w-5 h-5 text-sky-600" />
           </button>
           
           <button 
             onClick={() => markStepComplete(currentStep)}
             className="flex-1 h-16 bg-gradient-to-r from-sky-500 to-teal-600 text-white rounded-[22px] shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-transform"
           >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className="w-5 h-5 text-teal-100" /> 
                  <span>SELESAIKAN HIDANGAN</span>
                </>
              ) : (
                <>
                  <span>LANGKAH BERIKUTNYA</span>
                  <ArrowRight className="w-5 h-5 text-sky-100" />
                </>
              )}
           </button>
        </div>

      </div>
    </div>
  );
}
