import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, ChevronRight, Play, CheckCircle2, ArrowLeft, 
  ChevronLeft, BarChart3, BookOpen, Snowflake, User, Bookmark,
  Globe, Moon
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { lessonApi, categoryApi } from '../../lib/api'

// Asset Imports
import bgPattern from '../../assets/food_drawing.jpg'

export default function Learning() {
  const navigate = useNavigate()
  const location = useLocation()
  const [lessons, setLessons] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)

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
    <div className="min-h-screen relative font-sans overflow-x-hidden bg-[#F0F9FF] text-slate-900 pb-40">
      {/* GLOBAL BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-200/30 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: 'cover' }} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto">
        {/* HEADER SECTION */}
        <header className="px-6 pt-12 pb-8">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-black mb-4 tracking-tighter leading-none text-slate-900"
          >
            Kurikulum <span className="text-cyan-600">Eksklusif</span>
          </motion.h1>
          <p className="text-slate-500 text-sm font-bold max-w-2xl leading-relaxed">
            Kuasai teknik kuliner tingkat lanjut dengan kurikulum yang disusun oleh chef profesional.
          </p>
        </header>

        <main className="px-6 space-y-16">
          {loading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/70 backdrop-blur-2xl p-8 rounded-[40px] shadow-premium border border-white/80 animate-pulse">
                  <div className="h-8 w-3/4 bg-slate-100 rounded-xl mb-4" />
                  <div className="h-4 w-full bg-slate-50 rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {categories.map((category) => {
                const categoryLessons = lessons.filter(l => l.category?.id === category.id)
                if (categoryLessons.length === 0) return null

                return (
                  <section key={category.id} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center text-lg font-black shadow-lg">
                        {category.id}
                      </div>
                      <div>
                        <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">{category.name}</h2>
                        <p className="text-[9px] font-black text-cyan-600 uppercase tracking-widest">Modul Pembelajaran</p>
                      </div>
                    </div>

                    <div className="space-y-6">
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
        </main>
      </div>

      {/* PREMIUM LESSON MODAL */}
      <AnimatePresence>
        {showModal && selectedLesson && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white rounded-t-[50px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border-t border-white"
            >
              <div className="absolute top-6 left-6 z-10 flex gap-2">
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl text-slate-900 flex items-center justify-center hover:bg-white transition-all border border-white/40 shadow-xl"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>

              <div className="w-full bg-slate-900 aspect-video relative group overflow-hidden">
                {selectedLesson.video_url ? (
                  <iframe 
                    src={getEmbedUrl(selectedLesson.video_url) || ''}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                    <Play className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Konten Video Segera Hadir</p>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="flex items-center gap-4 mb-6">
                  <span className="px-4 py-1.5 rounded-full bg-cyan-100 text-cyan-600 text-[9px] font-black uppercase tracking-widest border border-cyan-200">
                    {selectedLesson.level}
                  </span>
                  <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                    <Clock className="w-4 h-4" />
                    {selectedLesson.duration} Menit
                  </div>
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                  {selectedLesson.title}
                </h2>

                <div 
                  className="prose prose-slate max-w-none text-slate-600 leading-relaxed mb-12 text-sm font-medium"
                  dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                />

                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full h-16 rounded-[28px] bg-cyan-600 text-white font-black text-sm shadow-xl hover:bg-cyan-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  <CheckCircle2 className="w-5 h-5" /> Selesaikan Modul
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHARED NAVIGATION */}
      <nav className="fixed bottom-8 inset-x-0 z-50 flex justify-center px-6">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-white/80 backdrop-blur-3xl border border-white/80 rounded-[40px] py-4 px-8 shadow-2xl flex items-center justify-between w-full max-w-sm ring-1 ring-black/5"
        >
          {[
            { id: "home", path: "/", icon: Bookmark },
            { id: "notes", path: "/catatan-ibu", icon: BookOpen },
            { id: "fridge", path: "/fridge", icon: Snowflake },
            { id: "shopping", path: "/daftar-belanja", icon: Globe },
            { id: "profile", path: "/profile", icon: User },
            { id: "theme", path: "#", icon: Moon }
          ].map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button 
                key={item.id}
                onClick={() => {
                  if (item.id === "theme") setIsDarkMode(!isDarkMode)
                  else if (item.path !== "#") navigate(item.path)
                }} 
                className={`relative p-3 transition-all ${isActive ? "text-cyan-500" : "text-slate-400 hover:text-slate-600"}`}
              >
                <item.icon className={`w-6 h-6 transition-all ${isActive ? "scale-110 shadow-glow-sm" : ""}`} />
                {isActive && (
                  <motion.div 
                    layoutId="active-tab-nav"
                    className="absolute inset-0 bg-cyan-50 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            )
          })}
        </motion.div>
      </nav>
    </div>
  )
}

function LessonCard({ lesson, onClick }: any) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white/90 backdrop-blur-3xl rounded-[40px] shadow-premium border border-white cursor-pointer transition-all duration-500 group relative overflow-hidden"
    >
      {/* Thumbnail Header */}
      <div className="h-44 w-full relative overflow-hidden">
        {lesson.thumbnail ? (
          <img src={lesson.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-indigo-500 opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        
        <div className="absolute top-6 left-6">
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 backdrop-blur-md border border-white/50 ${
             lesson.is_completed ? 'bg-green-500/80 text-white' : 'bg-white/80 text-cyan-600'
           }`}>
             {lesson.is_completed ? <CheckCircle2 className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
           </div>
        </div>

        <div className="absolute top-6 right-6">
           <div className="flex items-center gap-2 text-[9px] font-black text-slate-900 uppercase tracking-widest bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
             <Clock className="w-3.5 h-3.5" />
             {lesson.duration}m
           </div>
        </div>
      </div>

      <div className="p-8 pt-0 relative z-10">
        <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight group-hover:text-cyan-600 transition-colors tracking-tighter">
          {lesson.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 font-bold leading-relaxed opacity-80 mb-6">
          {lesson.summary || 'Kuasai teknik kuliner ini dengan panduan langkah demi langkah dari chef profesional.'}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest px-3 py-1 bg-cyan-50 rounded-lg">{lesson.level}</span>
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{lesson.order_index} Unit</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-cyan-600 transition-all shadow-lg">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

