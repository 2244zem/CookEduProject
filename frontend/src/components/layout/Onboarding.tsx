import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Monitor, Smartphone, Sparkles } from 'lucide-react'

import { useDeviceProfile } from '../../hooks/useDeviceProfile'
import imgBg from '../../assets/background.png'
import imgBgDrop from '../../assets/backgrounddrop.jpg'
import img1 from '../../assets/download (1).jpg'
import img2 from '../../assets/download (2).jpg'
import img3 from '../../assets/download (3).jpg'
import imgFood from '../../assets/food_drawing.jpg'

interface OnboardingProps {
  onComplete: () => void
}

type Slide = {
  title: string
  caption: string
  image: string
}

const slides: Slide[] = [
  {
    title: 'Dapur virtual siap dipakai.',
    caption: 'Cari resep, simpan bahan, dan lanjut masak tanpa halaman yang terasa berat.',
    image: img1,
  },
  {
    title: 'Resep cocok untuk dapur harian.',
    caption: 'Mulai dari menu Nusantara sampai ide cepat saat bahan di rumah terbatas.',
    image: img2,
  },
  {
    title: 'Belajar teknik dengan alur jelas.',
    caption: 'Panduan langkah, catatan ibu, dan mode masak dibuat lebih mudah dibaca.',
    image: img3,
  },
  {
    title: 'Chef AI tetap ringan saat dibuka.',
    caption: 'Tanya bahan pengganti, teknik memasak, atau langkah resep dari satu tempat.',
    image: imgFood,
  },
  {
    title: 'Ayo mulai memasak.',
    caption: 'CookEdu sudah menyesuaikan tampilan untuk Android dan desktop.',
    image: imgBgDrop,
  },
]

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { isDesktop, isAndroid, shouldReduceMotion } = useDeviceProfile()
  const activeSlide = slides[currentIndex]

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      onComplete()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] w-screen overflow-hidden bg-slate-950 text-slate-900"
      style={{ backgroundImage: `url(${imgBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.92] via-cyan-50/[0.88] to-sky-100/[0.94]" />
      <div className="relative z-10 h-full">
        {isDesktop ? (
          <DesktopOnboarding
            activeSlide={activeSlide}
            currentIndex={currentIndex}
            onComplete={onComplete}
            onSelect={setCurrentIndex}
            onNext={nextSlide}
          />
        ) : (
          <AndroidOnboarding
            activeSlide={activeSlide}
            currentIndex={currentIndex}
            isAndroid={isAndroid}
            onComplete={onComplete}
            onNext={nextSlide}
            shouldReduceMotion={shouldReduceMotion}
          />
        )}
      </div>
    </div>
  )
}

function DesktopOnboarding({
  activeSlide,
  currentIndex,
  onComplete,
  onSelect,
  onNext,
}: {
  activeSlide: Slide
  currentIndex: number
  onComplete: () => void
  onSelect: (index: number) => void
  onNext: () => void
}) {
  const progress = useMemo(() => Math.round(((currentIndex + 1) / slides.length) * 100), [currentIndex])

  return (
    <div className="relative mx-auto grid h-full max-w-7xl grid-cols-[360px_1fr] gap-8 px-8 py-8">
      <div className="absolute right-8 top-8 z-20 flex items-center gap-3">
        <button
          onClick={onComplete}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 shadow-sm transition hover:border-cyan-200 hover:text-cyan-700"
        >
          Lewati
        </button>
        <button
          onClick={onNext}
          className="flex h-11 items-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-sm transition hover:bg-cyan-700"
        >
          {currentIndex === slides.length - 1 ? 'Selesai' : 'Lanjut'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <aside className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/[0.88] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600 text-white">
            <Monitor className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-700">Desktop view</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">CookEdu</h1>
          </div>
        </div>

        <div className="mt-8 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {slides.map((slide, index) => {
            const isActive = currentIndex === index
            return (
              <button
                key={slide.title}
                onClick={() => onSelect(index)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  isActive
                    ? 'border-cyan-300 bg-cyan-50 text-slate-950 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${
                    isActive ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black">{slide.title}</p>
                    <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{slide.caption}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="shrink-0 pt-6">
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-cyan-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            {progress}% siap
          </p>
        </div>
      </aside>

      <main className="flex min-h-0 items-center">
        <div className="relative grid h-full max-h-[760px] w-full grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-[32px] border border-white/70 bg-white/[0.76] shadow-2xl">
          <div className="flex flex-col justify-between p-10">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">
                <Sparkles className="h-4 w-4" />
                Stabil untuk layar besar
              </div>
              <div>
                <h2 className="max-w-xl text-5xl font-black leading-tight tracking-tight text-slate-950">
                  {activeSlide.title}
                </h2>
                <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-slate-600">
                  {activeSlide.caption}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['Navigasi jelas', 'Efek ringan', 'Klik aman'].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <CheckCircle2 className="mb-3 h-5 w-5 text-cyan-600" />
                  <p className="text-sm font-black text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-0 bg-cyan-900">
            <img
              key={activeSlide.image}
              src={activeSlide.image}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
          </div>
        </div>
      </main>
    </div>
  )
}

function AndroidOnboarding({
  activeSlide,
  currentIndex,
  isAndroid,
  onComplete,
  onNext,
  shouldReduceMotion,
}: {
  activeSlide: Slide
  currentIndex: number
  isAndroid: boolean
  onComplete: () => void
  onNext: () => void
  shouldReduceMotion: boolean
}) {
  return (
    <div className="flex h-full w-full max-w-full flex-col overflow-hidden px-5 pb-8 pt-7">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="inline-flex min-w-0 max-w-[calc(100vw-7rem)] items-center gap-2 truncate rounded-full bg-white/[0.86] px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-700 shadow-sm">
          <Smartphone className="h-4 w-4" />
          {isAndroid ? 'Android view' : 'Mobile view'}
        </div>
        <button
          onClick={onComplete}
          className="shrink-0 rounded-full bg-white/[0.86] px-4 py-2 text-xs font-black text-slate-500 shadow-sm active:scale-95"
        >
          Lewati
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.title}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -14 }}
            transition={{ duration: 0.18 }}
            className="mx-auto w-full min-w-0 max-w-md"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-xl">
              <img src={activeSlide.image} alt="" className="h-full w-full object-cover" />
            </div>
            <h1 className="mt-7 break-words text-3xl font-black leading-tight tracking-tight text-slate-950">
              {activeSlide.title}
            </h1>
            <p className="mt-3 break-words text-base font-semibold leading-7 text-slate-600">
              {activeSlide.caption}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="mb-5 flex justify-center gap-2">
          {slides.map((slide, index) => (
            <div
              key={slide.title}
              className={`h-2 rounded-full transition-all ${index === currentIndex ? 'w-8 bg-cyan-600' : 'w-2 bg-cyan-600/20'}`}
            />
          ))}
        </div>
        <button
          onClick={onNext}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-base font-black text-white shadow-xl active:scale-[0.98]"
        >
          {currentIndex === slides.length - 1 ? 'Mulai Masak' : 'Lanjut'}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
