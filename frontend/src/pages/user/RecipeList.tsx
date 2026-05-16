import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import { recipeApi, categoryApi } from '../../lib/api'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { Clock, ChefHat, Flame, Filter, ChevronRight, Search, Sun, Cloud } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import heroBackground from '../../assets/background.png'

export default function RecipeList() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const [search, setSearch] = useState(queryParams.get('q') || '')
  const [categoryId, setCategoryId] = useState('')

  useEffect(() => {
    setSearch(queryParams.get('q') || '')
  }, [location.search])

  const { data: recipesData, isLoading } = useQuery({
    queryKey: ['recipes', search, categoryId],
    queryFn: () => recipeApi.list({ search, category_id: categoryId || undefined }),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list(),
  })

  const recipes = recipesData?.data?.data || []
  const categories = categoriesData?.data?.data || []

  return (
    <div className="pb-40 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-b-[3rem] py-32 px-6 bg-surface-card shadow-2xl mb-12 border-b border-primary/10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 dark:opacity-40 scale-105"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-surface dark:from-primary/30 dark:via-transparent dark:to-surface" />
        
        {/* Animated Sun & Clouds in Hero */}
        <motion.div 
          animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-400/20 blur-[80px] rounded-full"
        />
        <motion.div 
          animate={{ x: [-20, 20] }} transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
          className="absolute top-40 left-10 w-40 h-40 bg-white/20 blur-[60px] rounded-full"
        />
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="text-6xl md:text-[8rem] font-bold mb-6 tracking-tight leading-none text-gray-800 dark:text-white drop-shadow-sm"
          >
            Cook<span className="text-primary font-medium">Edu</span>
            <div className="absolute -top-4 -right-10 opacity-20 dark:opacity-40">
              <Sun className="w-20 h-20 text-yellow-500 animate-spin-slow" style={{ animationDuration: '20s' }} />
            </div>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xs md:text-sm text-gray-500 dark:text-white/60 font-medium tracking-[0.1em] mb-8"
          >
            TEMPAT TENANG UNTUK BELAJAR MEMASAK
          </motion.p>
        </div>
      </section>

      {/* Mobile Search Bar (Restored for Android/iOS users) */}
      <div className="max-w-4xl mx-auto px-6 -mt-24 mb-10 relative z-30 md:hidden">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 dark:bg-black/90 backdrop-blur-xl p-2 rounded-[35px] shadow-2xl border border-gray-100 dark:border-white/5"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-6 w-5 h-5 text-primary" />
            <input 
              type="text" 
              placeholder="Cari resep..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-[30px] py-5 pl-14 pr-8 text-gray-900 dark:text-white text-base font-bold focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400"
            />
          </div>
        </motion.div>
      </div>

      <section className="max-w-7xl mx-auto px-6">
        {/* BENTO GRID LAYOUT */}
        {!search && !categoryId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 auto-rows-min">
             {/* Learning Progress Card (Hand-drawn Winding Chart) */}
             <motion.div 
                whileHover={{ y: -5 }}
                className="bg-[#fcf8f2] dark:bg-[#1a1a1a] rounded-[40px] p-6 shadow-premium border-2 border-[#e6d5c3] dark:border-white/10 relative overflow-hidden flex flex-col group"
             >
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#bde0fe]/40 to-transparent pointer-events-none" />
                <h3 className="text-xl font-bold text-[#03045E] dark:text-white mb-2 relative z-10 font-serif tracking-wide">Learning progress</h3>
                <div className="flex items-end gap-2 mb-6 relative z-10">
                   <span className="text-sm font-medium text-gray-500 italic">Average progress</span>
                   <span className="text-3xl font-black text-[#0077B6] ml-auto">78%</span>
                </div>
                
                {/* Winding Illuminated Chart Area */}
                <div className="h-32 w-full relative mb-6">
                   <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <path d="M0,40 Q15,10 35,30 T65,15 T100,5" fill="none" stroke="#0077B6" strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(0,119,182,0.6)]" />
                      <path d="M0,50 Q20,30 40,40 T80,30 T100,20" fill="none" stroke="#90e0ef" strokeWidth="1.5" strokeDasharray="2 2" />
                      {/* Milestones / Checkpoints */}
                      <circle cx="35" cy="30" r="4" fill="#fff" stroke="#03045E" strokeWidth="2" className="animate-pulse" />
                      <circle cx="65" cy="15" r="4" fill="#fff" stroke="#03045E" strokeWidth="2" className="animate-pulse" />
                      {/* Chef Flag */}
                      <g transform="translate(62, -5)">
                         <line x1="0" y1="0" x2="0" y2="15" stroke="#03045E" strokeWidth="1" />
                         <path d="M0,0 L10,4 L0,8 Z" fill="#FF8C00" />
                      </g>
                   </svg>
                   <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase mt-2">
                      <span>May</span><span>June</span><span>July</span><span>Aug</span><span>Sept</span>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-auto relative z-10">
                   <div className="bg-white dark:bg-white/5 p-3 rounded-2xl text-center border border-[#e6d5c3] dark:border-white/10 shadow-sm">
                      <p className="text-xl font-black text-[#03045E] dark:text-white">44</p>
                      <p className="text-[7px] font-black uppercase text-gray-400 mt-1 leading-tight">Total<br/>Techniques</p>
                   </div>
                   <div className="bg-[#caf0f8] dark:bg-primary/20 p-3 rounded-2xl text-center border border-[#90e0ef] shadow-inner">
                      <p className="text-xl font-black text-primary">12</p>
                      <p className="text-[7px] font-black uppercase text-primary mt-1 leading-tight">Recipes<br/>Mastered</p>
                   </div>
                   <div className="bg-white dark:bg-white/5 p-3 rounded-2xl text-center border border-[#e6d5c3] dark:border-white/10 shadow-sm">
                      <p className="text-xl font-black text-[#03045E] dark:text-white">34</p>
                      <p className="text-[7px] font-black uppercase text-gray-400 mt-1 leading-tight">Upcoming<br/>Skills</p>
                   </div>
                </div>
             </motion.div>

             {/* Recommended Courses Card */}
             <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-[#ffe5d9] to-[#ffcad4] dark:from-[#ffb5a7]/20 dark:to-[#fcd5ce]/20 rounded-[32px] p-8 shadow-premium border border-white/50 dark:border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-4 opacity-30"><Sun className="w-16 h-16 text-yellow-500 animate-spin-slow" /></div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 z-10">Recommended<br/>Courses</h3>
                <div className="w-32 h-32 bg-white/50 backdrop-blur-xl rounded-full mb-6 flex items-center justify-center shadow-xl z-10">
                   <ChefHat className="w-16 h-16 text-[#03045E]" />
                </div>
                <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md px-6 py-3 rounded-full z-10">
                   <span className="font-black text-gray-800 dark:text-white">12</span> <span className="text-[10px] font-bold text-gray-500 uppercase">Subjects</span> / <span className="font-black text-gray-800 dark:text-white">48</span> <span className="text-[10px] font-bold text-gray-500 uppercase">Lessons</span>
                </div>
             </motion.div>

             {/* Leaderboard Card (Taman Dapur Podium) */}
             <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gradient-to-b from-[#eaf4f4] to-[#cce3de] dark:from-[#2d6a4f]/20 dark:to-[#1b4332]/40 rounded-[40px] p-6 shadow-premium border-2 border-[#a4c3b2] dark:border-white/10 flex flex-col relative overflow-hidden"
             >
                {/* Decorative Leaves/Taman Dapur */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40 mix-blend-multiply">
                   <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
                      <path d="M-10,20 Q10,10 30,30 T60,20 T110,40 L110,110 L-10,110 Z" fill="#a4c3b2" />
                      <path d="M-10,50 Q20,30 40,60 T80,40 T110,70 L110,110 L-10,110 Z" fill="#6b9080" opacity="0.5" />
                   </svg>
                </div>
                
                <h3 className="text-xl font-bold text-[#03045E] dark:text-white mb-4 relative z-10 font-serif">Leaderboard</h3>
                <div className="flex bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-full p-1 mb-8 relative z-10 border border-[#a4c3b2] shadow-inner">
                   <button className="flex-1 bg-white dark:bg-surface-card rounded-full py-2 text-[10px] font-black uppercase shadow-sm text-[#03045E] dark:text-white">Weekly</button>
                   <button className="flex-1 py-2 text-[10px] font-black uppercase text-gray-500 hover:text-gray-800 transition-colors">Month</button>
                </div>
                
                {/* Podium Layout */}
                <div className="flex items-end justify-center gap-2 h-40 mb-6 relative z-10">
                   {/* Rank 2 */}
                   <div className="flex flex-col items-center w-[30%]">
                      <div className="w-10 h-10 rounded-full bg-[#f4ebd0] border-2 border-[#C0C0C0] shadow-md flex items-center justify-center mb-2 z-10">
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Idris`} alt="Rank 2" className="w-full h-full rounded-full" />
                      </div>
                      <div className="w-full bg-gradient-to-t from-[#C0C0C0] to-[#E8E8E8] h-16 rounded-t-xl shadow-lg border border-[#A0A0A0] flex flex-col items-center justify-start pt-2 relative overflow-hidden">
                         <span className="font-black text-gray-600 text-xs z-10">#2</span>
                         <span className="font-bold text-[8px] text-gray-500 z-10">61%</span>
                      </div>
                   </div>
                   {/* Rank 1 */}
                   <div className="flex flex-col items-center w-[35%]">
                      <div className="w-14 h-14 rounded-full bg-[#f4ebd0] border-4 border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.6)] flex items-center justify-center mb-2 z-20 relative">
                         <div className="absolute -top-4 text-xl">👑</div>
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Zem`} alt="Rank 1" className="w-full h-full rounded-full" />
                      </div>
                      <div className="w-full bg-gradient-to-t from-[#FFD700] to-[#FFF8DC] h-24 rounded-t-xl shadow-xl border border-[#DAA520] flex flex-col items-center justify-start pt-3 relative overflow-hidden">
                         <span className="font-black text-yellow-800 text-sm z-10">#1</span>
                         <span className="font-bold text-[9px] text-yellow-700 z-10">85%</span>
                      </div>
                   </div>
                   {/* Rank 3 */}
                   <div className="flex flex-col items-center w-[30%]">
                      <div className="w-10 h-10 rounded-full bg-[#f4ebd0] border-2 border-[#CD7F32] shadow-md flex items-center justify-center mb-2 z-10">
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Nadia`} alt="Rank 3" className="w-full h-full rounded-full" />
                      </div>
                      <div className="w-full bg-gradient-to-t from-[#CD7F32] to-[#F4A460] h-12 rounded-t-xl shadow-lg border border-[#A0522D] flex flex-col items-center justify-start pt-1 relative overflow-hidden">
                         <span className="font-black text-orange-900 text-xs z-10">#3</span>
                         <span className="font-bold text-[8px] text-orange-800 z-10">52%</span>
                      </div>
                   </div>
                </div>

                <div className="mt-auto bg-[#fcf8f2] dark:bg-[#1a1a1a] p-4 rounded-2xl border-2 border-[#e6d5c3] dark:border-white/10 flex items-center justify-between relative z-10 shadow-sm">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#03045E] text-white rounded-full flex items-center justify-center font-black text-xs shadow-inner">#13</div>
                      <div>
                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">You</p>
                         <p className="text-xs font-black text-[#03045E] dark:text-white font-serif">Accounting basics</p>
                      </div>
                   </div>
                   <div className="px-3 py-1 bg-[#0077B6]/10 text-[#0077B6] rounded-full text-[8px] font-black uppercase">Progress</div>
                </div>
             </motion.div>
          </div>
        )}
        {/* Categories Section */}
        <div className="mb-12">
           <div className="flex items-center gap-3 mb-6">
              <Filter className="w-4 h-4 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pilih Kategori</h3>
           </div>
           <div className="flex items-center gap-4 overflow-x-auto pb-6 no-scrollbar">
             <button 
               onClick={() => setCategoryId('')}
               className={`px-8 py-3 rounded-2xl text-[10px] font-black whitespace-nowrap transition-all duration-300 border ${
                 !categoryId 
                   ? 'bg-primary text-white border-primary shadow-glow scale-105' 
                   : 'bg-white dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/5 hover:border-primary/30'
               }`}
             >
               SEMUA
             </button>
             {categories.map((c: any) => (
               <button 
                 key={c.id}
                 onClick={() => setCategoryId(c.id === categoryId ? '' : c.id)}
                 className={`px-8 py-3 rounded-2xl text-[10px] font-black whitespace-nowrap transition-all duration-300 border ${
                   categoryId === c.id 
                     ? 'bg-primary text-white border-primary shadow-glow scale-105' 
                     : 'bg-white dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/5 hover:border-primary/30'
                 }`}
               >
                 {c.name.toUpperCase()}
               </button>
             ))}
           </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-4">
             {search ? `Hasil untuk "${search}"` : 'HD Food Recipes'}
             {recipes.length > 0 && <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">{recipes.length} Resep</span>}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : recipes.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-32 bg-gray-50/50 dark:bg-white/5 rounded-[40px] border border-gray-100 dark:border-white/5 shadow-sm">
            <ChefHat className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-6" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Belum Ada Resep di Sini</h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto text-sm leading-relaxed">Mungkin kata kuncinya kurang pas? Mari coba cari hidangan lain atau lihat kategori yang tersedia.</p>
            <button onClick={() => setSearch('')} className="mt-8 text-primary font-semibold text-sm hover:underline transition-all">Lihat Semua Resep</button>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            initial="hidden" animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
          >
            {recipes.map((recipe: any) => (
              <motion.div 
                key={recipe.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0 }
                }}
                className="relative group"
              >
                <Link to={`/recipes/${recipe.id}`} className="block h-full">
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-white dark:bg-surface-card rounded-[32px] overflow-hidden shadow-premium border border-gray-100 dark:border-white/5 h-full flex flex-col transition-all duration-500 hover:shadow-glow relative group"
                  >
                    {/* Thematic Elements: Ocean Waves & Sun Glow */}
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                       <Sun className="w-5 h-5 text-yellow-400 animate-pulse" />
                    </div>
                    
                    <div className="relative h-60 overflow-hidden">
                      <img 
                        src={recipe.image_url || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800`} 
                        alt={recipe.title} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      <div className="absolute top-6 left-6">
                        <span className="px-4 py-1.5 bg-primary/20 backdrop-blur-md border border-white/30 rounded-full text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                          <Cloud className="w-3 h-3" /> {recipe.category?.name || 'Recipe'}
                        </span>
                      </div>

                      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                        <div className="flex gap-2">
                          <span className="flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-glow">
                            <Flame className="w-3.5 h-3.5" /> {recipe.nutritional_info?.calories || 0} Cal
                          </span>
                        </div>
                        <span className="text-white font-black text-[10px] flex items-center gap-2 uppercase tracking-widest">
                          <Clock className="w-4 h-4" /> {recipe.cooking_time}m
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-1">
                        {recipe.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 font-medium leading-relaxed mb-4">
                        {recipe.description}
                      </p>
                      
                      <div className="mt-auto pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                        <div className="flex -space-x-2">
                           {[1,2,3].map(i => (
                             <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-card bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-400">
                               {String.fromCharCode(64 + i)}
                             </div>
                           ))}
                           <div className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-card bg-primary text-white flex items-center justify-center text-[8px] font-black shadow-sm">
                             +1k
                           </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                           <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  )
}
