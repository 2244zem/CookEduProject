import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChefHat, BookOpen, Search, Star, Globe } from 'lucide-react'

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const slides = [
    {
      title: "Dapur Virtual Anda Dimulai Di Sini.",
      description: "Eksplorasi ribuan resep terkurasi dengan antarmuka yang bersih dan minimalis.",
      icon: <ChefHat className="w-24 h-24 text-teal-600" />
    },
    {
      title: "Dari Masakan Nusantara hingga Global.",
      description: "Temukan hidangan favorit Anda dari berbagai belahan dunia dalam satu ketukan.",
      icon: <Globe className="w-24 h-24 text-teal-600" />
    },
    {
      title: "Kuasai Teknik dengan Panduan Interaktif.",
      description: "Pelajari teknik memasak baru melalui panduan langkah demi langkah.",
      icon: <BookOpen className="w-24 h-24 text-teal-600" />
    },
    {
      title: "Dapur Pintar yang Mengerti Kebutuhan Anda.",
      description: "Sistem cerdas akan merekomendasikan resep sesuai suhu dan bahan di kulkas Anda.",
      icon: <Search className="w-24 h-24 text-teal-600" />
    },
    {
      title: "Dapur Kami Sudah Siap. Ayo Mulai!",
      description: "Jadilah koki andal untuk diri Anda sendiri.",
      icon: <Star className="w-24 h-24 text-teal-600" />
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
    <div className="fixed inset-0 z-[100] flex flex-col font-sans bg-slate-50">
      
      {/* Top Decor */}
      <div className="absolute top-0 inset-x-0 h-64 bg-teal-600/5 -skew-y-6 transform origin-top-left -z-10" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center px-6 relative z-10 max-w-lg mx-auto w-full mt-12">
        
        {/* Title positioned above the card */}
        <div className="h-32 mb-6 flex flex-col justify-end">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {slides[currentIndex].title}
              </h1>
              <p className="mt-3 text-sm text-slate-500 font-medium">
                {slides[currentIndex].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Card */}
        <div className="relative w-full aspect-square">
          <AnimatePresence initial={false} custom={currentIndex}>
            <motion.div
              key={currentIndex}
              custom={currentIndex}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, scale: 0.95, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute inset-0 w-full h-full bg-white rounded-[3rem] shadow-sm border border-slate-200 flex flex-col items-center justify-center p-8 cursor-grab active:cursor-grabbing overflow-hidden"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="relative z-10 flex items-center justify-center"
              >
                {slides[currentIndex].icon}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-12">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-500 ease-out ${i === currentIndex ? 'w-8 bg-teal-600' : 'w-2 bg-slate-200'}`} 
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
            className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold text-base shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Mulai Sekarang
          </motion.button>
        ) : (
          <button
            onClick={nextSlide}
            className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        )}
        
        <button 
          onClick={onComplete}
          className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors mt-2"
        >
          Lewati
        </button>
      </div>
    </div>
  )
}
