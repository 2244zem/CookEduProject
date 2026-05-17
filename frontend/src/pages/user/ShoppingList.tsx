import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, ShoppingCart, CheckCircle2, Circle, 
  Trash2, Plus, Snowflake, BookOpen, BarChart3, User, Bookmark
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useShoppingStore } from '../../store/shoppingStore'

// Asset Imports
import bgPattern from '../../assets/food_drawing.jpg'

export default function ShoppingList() {
  const navigate = useNavigate()
  const location = useLocation()
  const { groups, toggleItem, removeGroup, clearChecked } = useShoppingStore()

  return (
    <div className="min-h-screen relative font-sans overflow-x-hidden bg-transparent text-slate-800 dark:text-slate-100 pb-40">
      {/* GLOBAL BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-200/30 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: 'cover' }} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto">
        <header className="px-6 pt-12">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="w-12 h-12 bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl flex items-center justify-center text-cyan-600 shadow-premium mb-8"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>

          <div className="flex items-center gap-6 mb-10">
            <div className="w-16 h-16 bg-cyan-600 rounded-3xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight leading-none">
                Daftar <span className="text-cyan-600">Belanja</span>
              </h1>
              <p className="text-slate-500 text-xs font-bold tracking-wide mt-2">Kebutuhan bahan masakanmu</p>
            </div>
          </div>
        </header>

        <main className="px-6 space-y-8">
          {groups.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-2xl p-12 rounded-[40px] text-center border border-white shadow-premium">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Belum Ada Daftar</h3>
              <p className="text-sm text-slate-400 mt-2">Tambahkan bahan dari resep untuk mulai belanja.</p>
              <button 
                onClick={() => navigate('/')}
                className="mt-8 px-8 py-3 bg-cyan-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg"
              >
                Cari Resep
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <motion.div 
                  key={group.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/70 backdrop-blur-2xl rounded-[40px] overflow-hidden shadow-premium border border-white"
                >
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-cyan-50/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <Bookmark className="w-5 h-5 text-cyan-600" />
                      </div>
                      <h4 className="font-black text-slate-900 text-sm tracking-tight">{group.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => clearChecked(group.id)}
                        className="p-2 text-slate-400 hover:text-cyan-600 transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => removeGroup(group.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {group.items.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => toggleItem(group.id, item.id)}
                        className="flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-cyan-600 border-cyan-600' : 'border-slate-200 group-hover:border-cyan-200'}`}>
                            {item.checked && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                          <span className={`text-sm font-bold transition-all ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {item.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* SHARED NAVIGATION */}
      <nav className="fixed bottom-8 inset-x-0 z-50 flex justify-center px-6">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-white/80 backdrop-blur-3xl border border-white/80 rounded-[40px] py-4 px-8 shadow-2xl flex items-center justify-between w-full max-w-sm ring-1 ring-black/5"
        >
          {[
            { id: "home", path: "/", icon: Bookmark, label: "Home" },
            { id: "notes", path: "/catatan-ibu", icon: BookOpen, label: "Notes" },
            { id: "fridge", path: "/fridge", icon: Snowflake, label: "Fridge" },
            { id: "learning", path: "/learning", icon: BarChart3, label: "Learn" },
            { id: "profile", path: "/profile", icon: User, label: "Profile" },
          ].map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button 
                key={item.id}
                onClick={() => navigate(item.path)} 
                className={`relative p-3 transition-all ${isActive ? "text-cyan-500" : "text-slate-400 hover:text-slate-600"}`}
              >
                <item.icon className={`w-6 h-6 transition-all ${isActive ? "scale-110" : ""}`} />
                {isActive && (
                  <motion.div 
                    layoutId="active-tab"
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
