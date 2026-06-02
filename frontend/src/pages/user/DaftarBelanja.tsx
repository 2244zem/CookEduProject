import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Clock, Flame, ShoppingCart, 
  BookOpen, Bookmark, 
  User, Globe, CheckCircle2,
  ChefHat, Grid, Star,
  Snowflake, Trash2, Sparkles
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useShoppingStore } from '../../store/shoppingStore'
import { useAuthStore } from '../../store'
import { avatarFallbackUrl, resolveMediaUrl } from '../../lib/media'

// Asset Imports
import bgPattern from '../../assets/food_drawing.jpg'

export default function DaftarBelanja() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { groups, toggleItem, removeGroup, clearChecked, getMergedItems, togglePantry } = useShoppingStore()
  const [activeTab, setActiveTab] = useState('all') // all, merged, inventory

  const mergedItems = getMergedItems()
  const totalPrice = mergedItems
    .filter(i => !i.isPantry && !i.checked) // Only items we still need to buy
    .reduce((acc, curr) => acc + curr.price, 0)

  return (
    <div className="min-h-screen relative font-sans transition-colors duration-500 overflow-x-hidden bg-transparent text-slate-800 pb-40">
      {/* GLOBAL BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 lg:hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-200/30 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: 'cover' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-lg lg:max-w-7xl">
        {/* SERENE HEADER */}
        <header className="px-6 pt-10 flex items-center justify-between lg:px-0 lg:pt-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-xl overflow-hidden bg-white/80 backdrop-blur-md p-0.5">
              <img src={resolveMediaUrl(user?.avatar_url || user?.avatar) || avatarFallbackUrl(user?.name)} alt="User" className="w-full h-full rounded-xl object-cover" />
            </div>
            <div>
              <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest block opacity-70">Halo,</span>
              <h2 className="text-xl font-black tracking-tight leading-none text-slate-800">{user?.name?.toLowerCase() || 'koki cookedu'}</h2>
            </div>
          </motion.div>

          <div className="flex gap-2">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className="w-12 h-12 rounded-2xl bg-cyan-100 border-2 border-white shadow-lg flex items-center justify-center text-cyan-600 relative"
            >
              <div className="bg-cyan-600 p-1.5 rounded-xl text-white">
                <ChefHat className="w-6 h-6" />
              </div>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-xl border-2 border-white shadow-lg flex items-center justify-center text-slate-400"
            >
              <Search className="w-5 h-5" />
            </motion.button>
          </div>
        </header>

        {/* SEARCH BOX */}
        <section className="px-6 mt-8 lg:px-0">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative bg-white/80 backdrop-blur-3xl border-2 border-white p-2.5 rounded-[32px] shadow-2xl flex items-center gap-3 ring-1 ring-black/5"
          >
            <Search className="w-5 h-5 text-slate-300 ml-4" />
            <input 
              type="text"
              placeholder="Cari item belanja..."
              className="flex-1 bg-transparent py-2 text-sm font-bold text-slate-600 placeholder:text-slate-300 focus:outline-none"
            />
          </motion.div>
        </section>

        {/* SHOPPING TABS */}
        <section className="px-6 mt-8 lg:px-0">
          <h3 className="text-sm font-black text-slate-800 mb-4 ml-1">Grup Belanja & Inventaris</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: "Per Resep", icon: BookOpen },
              { id: 'merged', label: "Auto-Merge", icon: Sparkles },
              { id: 'inventory', label: "Inventaris", icon: Grid }
            ].map((item) => (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(item.id)}
                className={`px-5 py-2.5 rounded-full text-[10px] font-black flex items-center gap-2 border-2 border-white shadow-sm transition-all ${
                  activeTab === item.id ? 'bg-cyan-500 text-white shadow-glow-sm' : 'bg-white text-slate-500'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </motion.button>
            ))}
          </div>
        </section>

        {/* PRICE ESTIMATION SUMMARY */}
        {activeTab !== 'all' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 mt-8 lg:px-0"
          >
            <div className="bg-cyan-600 text-white p-6 rounded-[32px] shadow-xl flex items-center justify-between overflow-hidden relative">
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 blur-[40px] rounded-full" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Estimasi Belanja</p>
                  <p className="text-2xl font-black">Rp {totalPrice.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <Sparkles className="w-8 h-8 text-white/20 relative z-10" />
            </div>
          </motion.div>
        )}

        <main className="px-6 mt-8 space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 lg:px-0 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {activeTab === 'merged' || activeTab === 'inventory' ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-[40px] border-2 border-white bg-white/80 p-6 shadow-xl backdrop-blur-2xl lg:col-span-2 xl:col-span-3"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeTab === 'merged' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {activeTab === 'merged' ? <Sparkles className="w-6 h-6" /> : <Grid className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 leading-tight">
                      {activeTab === 'merged' ? 'Daftar Terkonsolidasi' : 'Pantry & Inventaris'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                      {activeTab === 'merged' ? 'Bahan-bahan digabung otomatis' : 'Centang bahan yang sudah ada di kulkas'}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                   {mergedItems
                    .filter(item => activeTab === 'inventory' || !item.isPantry)
                    .map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between p-4 bg-white border-2 rounded-2xl shadow-sm transition-all ${
                          item.isPantry ? 'border-amber-100 bg-amber-50/20' : 'border-slate-50'
                        }`}
                      >
                         <div className="flex items-center gap-3">
                            <button 
                              onClick={() => togglePantry(item.name)}
                              className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${item.isPantry ? 'bg-amber-500 border-amber-500' : 'border-slate-200'}`}
                            >
                               {item.isPantry && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </button>
                            <span className={`text-sm font-bold text-slate-600 capitalize ${item.isPantry ? 'text-slate-400 line-through' : ''}`}>
                              {item.name}
                            </span>
                         </div>
                         <div className="flex flex-col items-end">
                            <div className="px-3 py-1 bg-cyan-50 text-cyan-600 rounded-lg text-[10px] font-black">
                               {item.amount} {item.unit}
                            </div>
                            {item.price > 0 && !item.isPantry && (
                              <span className="text-[9px] font-bold text-slate-400 mt-1">~Rp {item.price.toLocaleString('id-ID')}</span>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
              </motion.div>
            ) : groups.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[40px] border border-white bg-white/70 p-12 text-center shadow-premium backdrop-blur-2xl lg:col-span-2 xl:col-span-3"
              >
                <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-bold">Belum ada daftar belanja.</p>
                <div className="flex gap-2 mt-6">
                  <button 
                    onClick={() => setActiveTab('merged')}
                    className={`flex-1 py-4 px-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'merged' ? 'bg-white text-cyan-600 shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Auto-Merge
                  </button>
                  <button 
                    onClick={() => setActiveTab('inventory')}
                    className={`flex-1 py-4 px-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white text-cyan-600 shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Stok Dapur
                  </button>
                </div>
              </motion.div>
            ) : (
              groups.map((group) => {
                const total = group.items.length
                const checkedCount = group.items.filter(i => i.checked).length
                const progress = total > 0 ? (checkedCount / total) * 100 : 0

                return (
                  <motion.div 
                    key={group.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white/80 backdrop-blur-2xl border-2 border-white rounded-[40px] p-6 shadow-xl group transition-all duration-500 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 shadow-inner">
                          <Bookmark className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-800 leading-tight">
                            {group.title}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                            {checkedCount}/{total} Item Terbeli
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeGroup(group.id)}
                        className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                      >
                         <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full mb-6 overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-cyan-500 shadow-glow-sm" 
                       />
                    </div>

                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleItem(group.id, item.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${
                            item.checked 
                              ? 'bg-slate-50 border-transparent opacity-60' 
                              : 'bg-white border-slate-50 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                              item.checked ? 'bg-cyan-500 border-cyan-500' : 'border-slate-200'
                            }`}>
                              {item.checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className={`text-sm font-bold ${item.checked ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                              {item.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-slate-400">{item.amount} {item.unit}</span>
                        </button>
                      ))}
                    </div>

                    {checkedCount > 0 && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => clearChecked(group.id)}
                        className="mt-6 w-full py-3 bg-cyan-50 text-cyan-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-cyan-100"
                      >
                        Bersihkan Item Selesai
                      </motion.button>
                    )}
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
