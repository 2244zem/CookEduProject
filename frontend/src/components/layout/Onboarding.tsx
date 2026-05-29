import { useState, useRef } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'

import imgBg from '../../assets/background.png'
import imgBgDrop from '../../assets/backgrounddrop.jpg'
import img1 from '../../assets/download (1).jpg'
import img2 from '../../assets/download (2).jpg'
import img3 from '../../assets/download (3).jpg'
import imgFood from '../../assets/food_drawing.jpg'

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const dragControls = useDragControls()

  const slides = [
    {
      title: "Dapur Virtual Anda Dimulai Di Sini.",
      icon: <img src={img1} alt="Welcome" className="w-full h-full object-contain mix-blend-multiply p-4" />,
      bg: "bg-gradient-to-br from-[#E0F7FA] to-[#B2EBF2]"
    },
    {
      title: "Dari Masakan Nusantara hingga Hidangan Global.",
      icon: <img src={img2} alt="Global" className="w-full h-full object-contain mix-blend-multiply p-4" />,
      bg: "bg-gradient-to-br from-[#E0F7FA] to-[#B2EBF2]"
    },
    {
      title: "Kuasai Teknik dengan Video Tutorial & Panduan Teks.",
      icon: <img src={img3} alt="Tutorials" className="w-full h-full object-contain mix-blend-multiply p-4" />,
      bg: "bg-gradient-to-br from-[#E0F7FA] to-[#B2EBF2]"
    },
    {
      title: "Tanyakan pada Chef AI Assistant: Bantuan Cerdas Selalu Siap.",
      icon: <img src={imgFood} alt="AI" className="w-full h-full object-cover mix-blend-overlay opacity-80 rounded-full" />,
      bg: "bg-gradient-to-br from-[#E0F7FA] to-[#B2EBF2]"
    },
    {
      title: "Jadilah Koki yang Andal: Mulai Perjalanan Masak Anda.",
      icon: <img src={imgBgDrop} alt="Chef" className="w-full h-full object-cover mix-blend-overlay opacity-80 rounded-full" />,
      bg: "bg-gradient-to-br from-[#E0F7FA] to-[#B2EBF2]"
    },
    {
      title: "Dapur Kami Sudah Siap. Ayo Mulai!",
      icon: <img src={img1} alt="Start" className="w-full h-full object-contain mix-blend-multiply p-4 scale-110" />,
      bg: "bg-gradient-to-br from-[#E0F7FA] to-[#B2EBF2]"
    }
  ]

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) setCurrentIndex(prev => prev + 1)
  }

  const handleDragEnd = (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -50 || velocity < -500) {
      if (currentIndex < slides.length - 1) {
        setCurrentIndex(prev => prev + 1)
      }
    } else if (offset > 50 || velocity > 500) {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
      }
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden font-sans bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${imgBg})` }}
    >
      {/* Fallback overlay to ensure text readability - optimized for mobile performance */}
      <div className={`absolute inset-0 bg-gradient-to-b ${window.innerWidth <= 768 ? 'from-white/60 via-white/40 to-[#0077B6]/30' : 'from-white/30 via-white/10 to-[#0077B6]/20 backdrop-blur-[2px]'}`} />
      
      {/* Floating Ocean Theme Ambience (Sun and Clouds) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated Sun */}
        <motion.div 
          animate={window.innerWidth <= 768 ? {
            opacity: [0.6, 0.8, 0.6]
          } : { 
            scale: [1, 1.1, 1], 
            rotate: [0, 10, 0] 
          }} 
          transition={window.innerWidth <= 768 ? {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          } : { 
            repeat: Infinity, 
            duration: 8, 
            ease: "easeInOut" 
          }} 
          className={`absolute top-12 left-12 rounded-full opacity-80 ${window.innerWidth <= 768 ? 'w-24 h-24 bg-yellow-100 blur-sm' : 'w-32 h-32 bg-gradient-to-tr from-yellow-300 to-orange-200 blur-xl mix-blend-screen'}`}
        />
        
        {/* Hide extra heavy sun and clouds entirely on mobile screen sizes to keep FPS at 60 */}
        {window.innerWidth > 768 && (
          <>
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
              className="absolute top-16 left-16 w-24 h-24 bg-white rounded-full blur-md opacity-90"
            />
            
            {/* Animated Clouds */}
            <motion.div 
              animate={{ x: [0, 50, 0] }} 
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }} 
              className="absolute top-24 right-10 w-48 h-16 bg-white/40 rounded-full blur-2xl"
            />
            <motion.div 
              animate={{ x: [0, -40, 0] }} 
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }} 
              className="absolute top-40 left-1/4 w-64 h-20 bg-white/30 rounded-full blur-3xl"
            />
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center px-6 relative z-10">
        
        {/* Title positioned above the card */}
        <div className="h-28 mb-8 flex items-end justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-snug max-w-sm mx-auto">
                {slides[currentIndex].title}
              </h1>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Glassmorphism Card Slider */}
        <div className="relative w-full max-w-md mx-auto aspect-[3/4] md:aspect-square">
          <AnimatePresence initial={false} custom={currentIndex}>
            <motion.div
              key={currentIndex}
              custom={currentIndex}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, scale: 0.9, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute inset-0 w-full h-full bg-white/70 backdrop-blur-md rounded-[40px] shadow-[0_20px_40px_-15px_rgba(0,119,182,0.15)] border border-white flex flex-col items-center justify-center p-8 cursor-grab active:cursor-grabbing overflow-hidden"
            >
              {/* Card Internal Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
              
              {/* Illustration from assets */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative z-10 w-64 h-64 md:w-72 md:h-72 rounded-3xl flex items-center justify-center shadow-sm overflow-hidden bg-transparent"
              >
                {slides[currentIndex].icon}
              </motion.div>
              
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-10">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-500 ease-out ${i === currentIndex ? 'w-8 bg-[#0077B6]' : 'w-2 bg-[#0077B6]/20'}`} 
            />
          ))}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-8 pb-12 w-full max-w-md mx-auto relative z-10 flex flex-col items-center gap-4">
        {currentIndex === slides.length - 1 ? (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onComplete}
            className="w-full py-4 bg-[#0077B6] text-white rounded-3xl font-black text-lg shadow-[0_10px_20px_rgba(0,119,182,0.3)] hover:scale-105 active:scale-95 transition-all"
          >
            Lanjut
          </motion.button>
        ) : (
          <button
            onClick={nextSlide}
            className="w-16 h-16 rounded-full bg-white text-[#0077B6] flex items-center justify-center shadow-[0_10px_20px_rgba(0,119,182,0.1)] hover:scale-110 active:scale-95 transition-all border border-blue-50"
          >
            <ArrowRight className="w-8 h-8" />
          </button>
        )}
        
        <button 
          onClick={onComplete}
          className="text-sm font-bold text-slate-400 hover:text-[#0077B6] transition-colors mt-2"
        >
          Lewati
        </button>
      </div>

    </div>
  )
}
