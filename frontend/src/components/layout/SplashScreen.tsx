import { motion } from 'framer-motion'
import bgSplash from '../../assets/background/MyStyle25.jpg'
import bgBatik from '../../assets/background/Bold Batik Patterns to Transform Your Home Decor Today!.jpg'
import { useDeviceProfile } from '../../hooks/useDeviceProfile'

export default function SplashScreen() {
  const { isMobile, shouldReduceMotion } = useDeviceProfile()
  const auraAnimation = shouldReduceMotion
    ? { opacity: 0.42 }
    : isMobile
      ? { opacity: [0.3, 0.55, 0.3] }
      : {
          scale: [1, 1.12, 1],
          rotate: [0, 120, 240, 360],
          borderRadius: [
            "40% 60% 70% 30% / 40% 50% 60% 50%",
            "60% 40% 30% 70% / 50% 60% 40% 60%",
            "40% 60% 70% 30% / 40% 50% 60% 50%"
          ]
        }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* Background with images */}
      <div className="absolute inset-0 z-0">
         <img src={bgSplash} alt="" className={`w-full h-full object-cover opacity-[0.65] scale-105 ${shouldReduceMotion ? '' : 'animate-pulse'}`} style={{ animationDuration: '7s' }} />
         <img src={bgBatik} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.04] mix-blend-overlay" />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Soft Egg-like Glow Aura - optimized for mobile performance */}
        <motion.div 
          animate={auraAnimation}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: isMobile ? 4 : 10, repeat: Infinity, ease: isMobile ? "easeInOut" : "linear" }}
          className={`absolute w-64 h-64 bg-white/10 z-[-1] ${isMobile ? 'blur-md' : 'blur-3xl'}`}
        />

        <div className="flex mb-4">
           {"CookEdu".split("").map((letter, i) => (
             <motion.span
               key={i}
               initial={{ y: 0 }}
               animate={shouldReduceMotion ? { y: 0 } : { y: [0, -20, 0] }}
               transition={{
                 duration: 2,
                 repeat: shouldReduceMotion ? 0 : Infinity,
                 delay: i * 0.1,
                 ease: "easeInOut"
               }}
               className={`text-6xl md:text-8xl font-black tracking-tighter uppercase ${i > 3 ? 'text-white/60' : 'text-white'}`}
             >
               {letter}
             </motion.span>
           ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-white/50 font-bold uppercase tracking-[0.5em] text-[10px] md:text-xs"
        >
           Master the Culinary Arts
        </motion.p>

        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ delay: 0.6, duration: 1.5 }}
          className="h-1 bg-white/20 rounded-full mt-12 overflow-hidden"
        >
           <motion.div 
             animate={shouldReduceMotion ? { x: 0 } : { x: [-200, 200] }}
             transition={{ repeat: shouldReduceMotion ? 0 : Infinity, duration: 1, ease: 'linear' }}
             className="w-1/2 h-full bg-white shadow-glow"
           />
        </motion.div>
      </div>
    </div>
  )
}
