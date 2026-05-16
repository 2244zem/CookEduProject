import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronRight, Play, CheckCircle2, ArrowLeft, ChevronLeft } from 'lucide-react'
import { lessonApi, categoryApi } from '../../lib/api'

export default function Learning() {
  const [lessons, setLessons] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [lessonsRes, categoriesRes] = await Promise.all([
        lessonApi.list(),
        categoryApi.list()
      ])
      setLessons(lessonsRes.data.data)
      setCategories(categoriesRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLessonClick = (lesson: any) => {
    setSelectedLesson(lesson)
    setShowModal(true)
    setCurrentSlide(0)
  }

  const getEmbedUrl = (url: string) => {
    if (!url) return null
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('/').pop()
      return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
    }
    return url
  }

  return (
    <div className="pb-40 pt-12 px-6 max-w-7xl mx-auto relative overflow-hidden min-h-screen">
      {/* Decorative Blobs */}
      <div className="absolute top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-40 -left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="relative z-10 mb-16">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-5xl md:text-7xl font-black mb-4 tracking-tighter leading-none text-gray-900 dark:text-white"
        >
          Kurikulum <span className="text-primary">Eksklusif</span>
        </motion.h1>
        <p className="text-gray-500 text-lg font-bold max-w-2xl leading-relaxed">
          Kuasai teknik kuliner tingkat lanjut dengan kurikulum yang disusun oleh chef profesional.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-surface-card p-8 rounded-[45px] shadow-premium border border-gray-100 dark:border-white/5 animate-pulse">
               <div className="flex justify-between items-start mb-10">
                 <div className="w-16 h-16 rounded-[24px] bg-gray-100 dark:bg-white/5" />
                 <div className="w-20 h-8 rounded-full bg-gray-100 dark:bg-white/5" />
               </div>
               <div className="h-8 w-3/4 bg-gray-100 dark:bg-white/5 rounded-xl mb-4" />
               <div className="h-4 w-full bg-gray-100 dark:bg-white/5 rounded-lg mb-2" />
               <div className="h-4 w-2/3 bg-gray-100 dark:bg-white/5 rounded-lg mb-8" />
               <div className="flex justify-between items-center pt-6 border-t border-gray-50 dark:border-white/5">
                 <div className="w-16 h-4 bg-gray-100 dark:bg-white/5 rounded-md" />
                 <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5" />
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-24 relative z-10">
          {categories.map((category) => {
            const categoryLessons = lessons.filter(l => l.category?.id === category.id)
            if (categoryLessons.length === 0) return null

            return (
              <section key={category.id} className="relative">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-16 h-16 rounded-[24px] bg-primary text-white flex items-center justify-center text-2xl font-black shadow-glow">
                    {category.id}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">{category.name}</h2>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Modul Pembelajaran</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryLessons.map((lesson) => (
                    <LessonCard 
                      key={lesson.id} 
                      lesson={lesson} 
                      onClick={() => handleLessonClick(lesson)} 
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {/* Premium Lesson Modal */}
      <AnimatePresence>
        {showModal && selectedLesson && (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            
            <motion.div
              layoutId={`lesson-${selectedLesson.id}`}
              className="relative w-full max-w-5xl bg-white dark:bg-[#0A0A0A] md:rounded-[60px] rounded-t-[60px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] border border-gray-100 dark:border-white/10"
            >
              <div className="absolute top-6 left-6 z-10 flex gap-2">
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-12 h-12 rounded-[18px] bg-white/10 backdrop-blur-xl text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>

              <div className="w-full bg-black aspect-video relative group overflow-hidden shadow-2xl">
                {selectedLesson.video_url ? (
                  <div className="w-full h-full relative">
                    <iframe 
                      src={getEmbedUrl(selectedLesson.video_url) || ''}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : selectedLesson.fallback_content && selectedLesson.fallback_content.length > 0 ? (
                  <div className="w-full h-full relative bg-gray-900">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0"
                      >
                        <img 
                          src={selectedLesson.fallback_content[currentSlide].image} 
                          className="w-full h-full object-cover opacity-60"
                          alt="Slide"
                        />
                        <div className="absolute inset-0 flex items-center justify-center p-16 text-center bg-gradient-to-t from-black via-black/40 to-transparent">
                          <p className="text-white text-xl md:text-3xl font-black leading-tight max-w-3xl mt-auto pb-16 tracking-tight">
                            {selectedLesson.fallback_content[currentSlide].text}
                          </p>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 z-20">
                      <button 
                        disabled={currentSlide === 0}
                        onClick={() => setCurrentSlide(prev => prev - 1)}
                        className="w-14 h-14 rounded-[22px] bg-white/10 backdrop-blur-xl text-white flex items-center justify-center disabled:opacity-20 hover:bg-white/20 transition-all border border-white/10 shadow-2xl"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <div className="flex gap-3">
                        {selectedLesson.fallback_content.map((_: any, i: number) => (
                          <div key={i} className={`h-2 rounded-full transition-all duration-700 ${i === currentSlide ? 'w-12 bg-primary shadow-glow' : 'w-2 bg-white/20'}`} />
                        ))}
                      </div>
                      <button 
                        disabled={currentSlide === selectedLesson.fallback_content.length - 1}
                        onClick={() => setCurrentSlide(prev => prev + 1)}
                        className="w-14 h-14 rounded-[22px] bg-white/10 backdrop-blur-xl text-white flex items-center justify-center disabled:opacity-20 hover:bg-white/20 transition-all border border-white/10 shadow-2xl"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-700">
                    <Play className="w-16 h-16 mb-4 opacity-20 animate-pulse" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">Preparing Content</p>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-gradient-to-b from-white to-gray-50 dark:from-[#0A0A0A] dark:to-black">
                <div className="flex items-center gap-4 mb-8">
                  <span className="px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                    {selectedLesson.level}
                  </span>
                  <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    <Clock className="w-4 h-4" />
                    {selectedLesson.duration} Menit Sesi
                  </div>
                </div>

                <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-10 leading-[1.1] tracking-tighter">
                  {selectedLesson.title}
                </h2>

                <div 
                  className="prose prose-invert prose-purple max-w-none text-zinc-400 leading-relaxed mb-20 text-lg"
                  dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                />

                <div className="p-10 rounded-[45px] bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left">
                    <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Selesaikan Sesi Ini?</h4>
                    <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">Progress Anda akan tersimpan di profil.</p>
                  </div>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="w-full md:w-auto h-16 px-12 rounded-[25px] bg-primary text-white font-black text-sm shadow-glow hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Selesaikan Modul
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LessonCard({ lesson, onClick }: any) {
  return (
    <motion.div
      layoutId={`lesson-${lesson.id}`}
      whileHover={{ y: -10, scale: 1.02 }}
      onClick={onClick}
      className="bg-white dark:bg-surface-card p-8 rounded-[45px] shadow-premium border border-gray-100 dark:border-white/5 cursor-pointer transition-all duration-500 group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-10">
        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-500 ${
          lesson.is_completed ? 'bg-green-100 text-green-600' : 'bg-gray-50 dark:bg-white/5 text-gray-400 group-hover:bg-primary group-hover:text-white shadow-inner'
        }`}>
          {lesson.is_completed ? <CheckCircle2 className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current" />}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-full border border-gray-100 dark:border-white/10">
          <Clock className="w-4 h-4" />
          {lesson.duration}m
        </div>
      </div>
      
      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-primary transition-colors tracking-tight">
        {lesson.title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-8 font-bold leading-relaxed">
        {lesson.summary || 'Kuasai teknik kuliner ini dengan panduan langkah demi langkah dari para profesional.'}
      </p>

      <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50 dark:border-white/5">
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{lesson.level}</span>
        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  )
}

