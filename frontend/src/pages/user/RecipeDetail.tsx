import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Clock, Award, Star, UtensilsCrossed, 
  ChefHat, Heart, Share2, Check, Timer, 
  Flame, Sparkles, ShoppingCart, Plus, X,
  ChevronLeft, ChevronRight, Maximize2
} from 'lucide-react'
import { recipes } from '../../data/recipes'
import { useShoppingStore } from '../../store/shoppingStore'

// Asset Imports
import bgPattern from '../../assets/food_drawing.jpg'

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([])
  const [isCookingMode, setIsCookingMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const { addGroup } = useShoppingStore()
  
  // Wake Lock API to keep screen on
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      if (isCookingMode && 'wakeLock' in navigator) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.error(`${err.name}, ${err.message}`);
        }
      } else if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
      }
    };
    requestWakeLock();
    return () => { if (wakeLock) wakeLock.release(); };
  }, [isCookingMode]);

  const recipe = recipes.find(r => r.id === Number(id))

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-sky-50">
        <ChefHat className="w-16 h-16 text-cyan-200 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">Recipe Not Found</h2>
        <Link to="/" className="px-8 py-3 bg-cyan-600 text-white rounded-2xl font-bold shadow-lg shadow-cyan-600/20">
          Back to Kitchen
        </Link>
      </div>
    )
  }

  const toggleIngredient = (name: string) => {
    setCheckedIngredients(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    )
  }

  const handleStartCooking = () => {
    addGroup(`Belanja ${recipe.title}`, recipe.ingredients.map(i => `${i.name} (${i.quantity})`))
    navigate('/daftar-belanja')
  }

  return (
    <div className="min-h-screen relative font-sans overflow-x-hidden bg-[#F0F9FF]">
      {/* INTERACTIVE COOKING MODE OVERLAY */}
      <AnimatePresence>
        {isCookingMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-900 flex flex-col"
          >
            {/* Header */}
            <div className="p-8 flex items-center justify-between border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-sm uppercase tracking-widest">{recipe.title}</h3>
                  <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-tighter">Langkah {currentStep + 1} dari {recipe.instructions.length}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCookingMode(false)}
                className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-rose-500 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Step Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
              <motion.div 
                key={currentStep}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-w-3xl"
              >
                <div className="mb-12 inline-block px-8 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-6xl font-black italic">
                  {currentStep + 1}
                </div>
                <h2 className="text-white text-4xl md:text-6xl font-black leading-tight tracking-tight px-4">
                  {recipe.instructions[currentStep]}
                </h2>
              </motion.div>
            </div>

            {/* Progress & Controls */}
            <div className="p-12 bg-slate-900/80 backdrop-blur-3xl border-t border-white/10">
              <div className="max-w-4xl mx-auto flex items-center gap-6">
                <button 
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-white disabled:opacity-20 transition-all hover:bg-white/20"
                >
                  <ChevronLeft className="w-10 h-10" />
                </button>
                
                <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / recipe.instructions.length) * 100}%` }}
                    className="h-full bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                  />
                </div>

                <button 
                  onClick={() => {
                    if (currentStep === recipe.instructions.length - 1) {
                      setIsCookingMode(false);
                      setCurrentStep(0);
                    } else {
                      setCurrentStep(prev => Math.min(recipe.instructions.length - 1, prev + 1));
                    }
                  }}
                  className="w-20 h-20 bg-cyan-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  {currentStep === recipe.instructions.length - 1 ? <Check className="w-10 h-10" /> : <ChevronRight className="w-10 h-10" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-200/30 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: 'cover' }} />
      </div>

      {/* TOP IMAGE SECTION */}
      <div className="relative h-[55vh] w-full overflow-hidden z-10">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          src={recipe.imageUrl} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />
        
        {/* Actions */}
        <div className="absolute top-10 left-6 right-6 flex items-center justify-between">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-white/20 backdrop-blur-2xl rounded-2xl border border-white/40 flex items-center justify-center text-white shadow-2xl"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          
          <div className="flex gap-3">
            <motion.button whileTap={{ scale: 0.9 }} className="w-12 h-12 bg-white/20 backdrop-blur-2xl rounded-2xl border border-white/40 flex items-center justify-center text-white shadow-2xl">
              <Heart className="w-6 h-6" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} className="w-12 h-12 bg-white/20 backdrop-blur-2xl rounded-2xl border border-white/40 flex items-center justify-center text-white shadow-2xl">
              <Share2 className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Floating Title Card */}
        <div className="absolute bottom-12 left-8 right-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-1 px-4 inline-flex items-center gap-2 bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4 shadow-xl shadow-cyan-500/30"
          >
            <Sparkles className="w-3 h-3" /> {recipe.category}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black text-white leading-tight tracking-tight drop-shadow-lg"
          >
            {recipe.title}
          </motion.h1>
        </div>
      </div>

      {/* FROSTED GLASS LOWER PANEL */}
      <div className="relative z-20 -mt-10 max-w-2xl mx-auto px-4 pb-32">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/70 backdrop-blur-3xl rounded-[48px] shadow-2xl border border-white/80 p-8 md:p-12"
        >
          {/* Minimalist Metrics Grid */}
          <div className="grid grid-cols-4 gap-4 mb-12 border-b border-cyan-50 pb-10">
            {[
              { icon: Clock, label: 'Waktu', val: recipe.prepTime, color: 'text-cyan-600', bg: 'bg-cyan-50' },
              { icon: Flame, label: 'Kalori', val: recipe.calories, color: 'text-rose-500', bg: 'bg-rose-50' },
              { icon: Award, label: 'Level', val: recipe.difficulty, color: 'text-amber-500', bg: 'bg-amber-50' },
              { icon: Star, label: 'Rating', val: recipe.rating, color: 'text-yellow-500', bg: 'bg-yellow-50' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center ${item.color} shadow-sm border border-white`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                <span className="text-sm font-black text-slate-800">{item.val}</span>
              </div>
            ))}
          </div>

          <p className="text-slate-600 text-base font-medium leading-relaxed mb-8 italic text-center px-4">
            "{recipe.description}"
          </p>

          {/* Mother's Note if exists */}
          {recipe.motherNote && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="mb-12 p-6 bg-amber-50/50 backdrop-blur-sm border-2 border-amber-100/50 rounded-[2.5rem] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Heart className="w-12 h-12 text-amber-600" />
              </div>
              <div className="flex gap-4 items-start relative z-10">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <span className="text-xl">👩‍🍳</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Catatan Ibu</h4>
                  <p className="text-amber-900/80 text-sm font-medium leading-relaxed italic">
                    {recipe.motherNote.replace('{username}', 'Sayang')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Nutrition Facts Detailed Grid */}
          {recipe.nutrition && (
            <section className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-rose-500 rounded-2xl shadow-lg shadow-rose-500/20">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Informasi Gizi</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Kalori', val: recipe.nutrition.calories, icon: Flame, color: 'rose' },
                  { label: 'Protein', val: recipe.nutrition.protein, icon: Award, color: 'cyan' },
                  { label: 'Karbo', val: recipe.nutrition.carbs, icon: UtensilsCrossed, color: 'amber' },
                  { label: 'Lemak', val: recipe.nutrition.fat, icon: Sparkles, color: 'emerald' },
                ].map((nut, i) => (
                  <div key={i} className="bg-white/40 p-4 rounded-3xl border border-white flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{nut.label}</span>
                    <span className="text-lg font-black text-slate-800">{nut.val}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="space-y-16">
            {/* Ingredients Section */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-cyan-500 rounded-2xl shadow-lg shadow-cyan-500/20">
                  <UtensilsCrossed className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Daftar Bahan</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recipe.ingredients.map((ing, idx) => (
                  <motion.div 
                    key={idx}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleIngredient(ing.name)}
                    className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all border ${
                      checkedIngredients.includes(ing.name)
                        ? 'bg-cyan-50 border-cyan-100 opacity-60'
                        : 'bg-white/50 border-white hover:bg-white hover:border-cyan-100 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${
                        checkedIngredients.includes(ing.name)
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'border-slate-200 bg-white'
                      }`}>
                        {checkedIngredients.includes(ing.name) && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className={`font-bold text-slate-800 text-sm ${checkedIngredients.includes(ing.name) ? 'line-through text-slate-400' : ''}`}>
                        {ing.name}
                      </span>
                    </div>
                    <span className="text-cyan-600 font-black text-xs bg-white px-3 py-1 rounded-full border border-cyan-50">{ing.quantity}</span>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Preparation Steps Section */}
            <section>
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-cyan-500 rounded-2xl shadow-lg shadow-cyan-500/20">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Cara Pembuatan</h2>
              </div>

              <div className="space-y-10 px-2">
                {recipe.instructions.map((step, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-6 items-start group relative"
                  >
                    {/* Numbering Line */}
                    {idx !== recipe.instructions.length - 1 && (
                      <div className="absolute top-12 left-6 -translate-x-1/2 w-[2px] h-[calc(100%+40px)] bg-cyan-100/50" />
                    )}
                    
                    <div className="w-12 h-12 bg-white border-2 border-cyan-500 rounded-2xl flex items-center justify-center text-cyan-600 font-black text-lg shadow-xl shrink-0 z-10 relative">
                      {idx + 1}
                    </div>
                    
                    <div className="flex-1 pt-1">
                      <div className="bg-white/40 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white group-hover:bg-white group-hover:shadow-xl transition-all duration-300">
                        <p className="text-slate-700 text-base font-medium leading-relaxed">
                          {step}
                        </p>
                        <div className="mt-5 flex gap-3">
                          <span className="flex items-center gap-1.5 text-[8px] font-black uppercase text-cyan-600 bg-cyan-50 px-3 py-1.5 rounded-full border border-cyan-100">
                            <Timer className="w-3 h-3" /> Titik Fokus
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Master Cooking CTA */}
          <div className="mt-20 flex flex-col gap-4">
            <motion.button
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartCooking}
              className="w-full py-6 bg-cyan-600 text-white rounded-[2.5rem] font-black text-lg shadow-2xl shadow-cyan-600/30 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <ShoppingCart className="w-7 h-7" />
              MULAI BELANJA & MASAK
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCookingMode(true)}
              className="w-full py-4 bg-white text-cyan-600 rounded-[2rem] font-black text-sm border-2 border-cyan-100 shadow-xl flex items-center justify-center gap-2"
            >
              <ChefHat className="w-5 h-5" />
              MODE MEMASAK SAJA
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
