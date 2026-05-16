import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, CheckCircle2, Circle, ArrowLeft, Grid, LayoutList, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { stapleIngredientsData } from '../../data/stapleIngredients';
import foodDrawing from '../../assets/food_drawing.jpg';
import bgDrop from '../../assets/backgrounddrop.jpg';
import download1 from '../../assets/download (1).jpg';
import download2 from '../../assets/download (2).jpg';
import download3 from '../../assets/download (3).jpg';

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
}

interface ShoppingGroup {
  id: string;
  title: string;
  items: ShoppingItem[];
  bgImage?: string;
}

export default function DaftarBelanja() {
  const navigate = useNavigate();
  const [cartBadge, setCartBadge] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Tab Filter untuk Bahan Pokok
  const categories = ["Semua", "Rempah & Bumbu", "Sumber Protein", "Karbohidrat", "Sayur-Sayuran", "Susu & Olahan", "Saus & Penyedap"];
  const [activeTab, setActiveTab] = useState("Semua");

  const cardBackgrounds = [download1, download2, download3, bgDrop, foodDrawing];

  const [shoppingGroups, setShoppingGroups] = useState<ShoppingGroup[]>([
    { id: "g1", title: "Belanja Ayam Goreng Krispi", bgImage: download1, items: [{ id: "i1", name: "Ayam Utuh", checked: false }, { id: "i2", name: "Tepung Bumbu", checked: true }, { id: "i3", name: "Minyak Goreng 1L", checked: false }] },
    { id: "g2", title: "Pasta Carbonara Creamy", bgImage: download2, items: [{ id: "i4", name: "Spaghetti 500g", checked: false }, { id: "i5", name: "Whipping Cream", checked: false }, { id: "i6", name: "Keju Parmesan", checked: true }] },
    { id: "g3", title: "Soto Ayam Lamongan", bgImage: download3, items: [{ id: "i7", name: "Ayam Kampung", checked: false }, { id: "i8", name: "Soun", checked: false }, { id: "i9", name: "Keluak", checked: false }] },
    { id: "g4", title: "Nasi Goreng Spesial", bgImage: bgDrop, items: [{ id: "i10", name: "Nasi Dingin", checked: true }, { id: "i11", name: "Telur Ayam", checked: false }, { id: "i12", name: "Kecap Manis", checked: true }] },
  ]);

  const systemRecommendations = [
    { title: "Soto Ayam Kuah Bening", count: 5, items: ["Daging Ayam 500g", "8 siung Bawang Putih", "12 siung Bawang Merah", "Daun Jeruk & Sereh"] },
    { title: "Ayam Betutu Bali", count: 8, items: ["Ayam Utuh", "Base Genep", "Daun Pisang", "Minyak Kelapa"] },
    { title: "French Onion Soup", count: 4, items: ["Bawang Bombay", "Beef Stock", "Baguette", "Keju Gruyere"] },
  ];

  const filteredStaples = activeTab === "Semua" 
    ? stapleIngredientsData 
    : stapleIngredientsData.filter(item => item.category === activeTab);

  const toggleCheck = (groupId: string, itemId: string) => {
    setShoppingGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return { ...group, items: group.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item) };
      }
      return group;
    }));
  };

  const handleAddRecommendation = (rec: any) => {
    const randomBg = cardBackgrounds[Math.floor(Math.random() * cardBackgrounds.length)];
    const newGroup: ShoppingGroup = {
      id: `group-${Date.now()}`,
      title: `Belanja ${rec.title}`,
      bgImage: randomBg,
      items: rec.items.map((item: string, index: number) => ({ id: `rec-${index}-${Date.now()}`, name: item, checked: false }))
    };
    setShoppingGroups([newGroup, ...shoppingGroups]);
    setCartBadge(prev => prev + 1);
  };

  const addStapleItem = (item: any) => {
    const randomBg = cardBackgrounds[Math.floor(Math.random() * cardBackgrounds.length)];
    const newGroup: ShoppingGroup = { 
        id: `staple-${Date.now()}`, 
        title: `Belanja ${item.name}`, 
        bgImage: randomBg,
        items: [{ id: `item-${Date.now()}`, name: item.name, checked: false }] 
    };
    setShoppingGroups([newGroup, ...shoppingGroups]);
    setCartBadge(prev => prev + 1);
  }

  const totalItems = shoppingGroups.reduce((acc, g) => acc + g.items.length, 0);
  const checkedItemsCount = shoppingGroups.reduce((acc, g) => acc + g.items.filter(i => i.checked).length, 0);

  const handleFinishShopping = () => {
    if (checkedItemsCount === 0) {
       alert("Pilih minimal satu bahan yang sudah dibeli!");
       return;
    }
    setShoppingGroups(prev => prev.map(group => ({
       ...group,
       items: group.items.filter(item => !item.checked)
    })).filter(group => group.items.length > 0));
    setCartBadge(0);
    alert("🎉 Selamat! Belanjaan Anda telah selesai dicatat. Stok dapur Anda kini bertambah!");
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#03045E] font-sans pb-44 custom-scrollbar">
      
      {/* HEADER */}
      <div className="bg-gradient-to-b from-[#0077B6]/10 to-transparent p-6 pt-12 max-w-2xl mx-auto w-full flex justify-between items-center relative z-20">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="p-2 bg-white/50 backdrop-blur-md rounded-full text-[#0077B6] hover:bg-white transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </motion.button>

        <div className="text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0077B6] block">CookEdu Smart Kit</span>
          <h1 className="text-3xl font-black tracking-tight text-[#03045E]">Daftar Belanja</h1>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCartOpen(true)}
          className="relative p-3 bg-white rounded-2xl shadow-sm border border-blue-50 group transition-all hover:border-primary/30"
        >
          <ShoppingBag className="w-6 h-6 text-[#0077B6]" />
          <AnimatePresence>
            {cartBadge > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                {cartBadge}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="p-6 max-w-2xl mx-auto w-full space-y-8 relative z-10">
        
        {/* REKOMENDASI SISTEM (CAROUSEL-LIKE) */}
        <div className="overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
          <div className="flex gap-4 min-w-max">
            {systemRecommendations.map((rec, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="w-72 bg-gradient-to-br from-[#0077B6] to-[#03045E] text-white rounded-[40px] p-8 shadow-xl relative overflow-hidden shrink-0 group"
              >
                <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-white/5 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                <span className="text-[8px] bg-white/20 text-cyan-200 px-3 py-1.5 rounded-full font-black uppercase tracking-widest">💡 Rekomendasi</span>
                <h2 className="text-lg font-black mt-3 leading-tight line-clamp-1">{rec.title}</h2>
                <p className="text-[10px] text-blue-100/70 mt-1 font-bold">{rec.count} bahan siap beli</p>
                <button onClick={() => handleAddRecommendation(rec)} className="mt-5 w-full bg-white text-[#03045E] text-[10px] font-black uppercase py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-all shadow-lg active:scale-95">
                  <Plus className="w-4 h-4" /> Masukkan Daftar
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* QUICK CUSTOM ADD WITH TABS */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2 px-2"><Grid className="w-4 h-4" /> Bahan Pokok Cepat</h3>
          
          {/* CATEGORY TABS */}
          <div className="flex gap-2 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === cat 
                    ? 'bg-[#0077B6] text-white shadow-lg shadow-blue-500/30 border border-[#0077B6]' 
                    : 'bg-white text-[#03045E] border border-blue-100/60 hover:bg-blue-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* INGREDIENTS GRID */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredStaples.map((item) => (
                <motion.button 
                  key={item.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ y: -5 }} 
                  whileTap={{ scale: 0.9 }} 
                  onClick={() => addStapleItem(item)} 
                  className="bg-white border border-blue-100/60 p-5 rounded-[30px] flex flex-col items-center justify-center gap-2 shadow-sm group hover:shadow-md transition-all h-32"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-500">{item.icon}</span>
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight text-center leading-tight">{item.name}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* SHOPPING LIST GROUPS */}
        <div className="space-y-6 pt-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2 px-2"><LayoutList className="w-4 h-4" /> Catatan Grup Belanja</h3>

          <AnimatePresence mode="popLayout">
            {shoppingGroups.map((group) => (
              <motion.div 
                key={group.id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/90 backdrop-blur-md border border-white/60 shadow-xl rounded-[40px] overflow-hidden flex flex-col gap-0 group hover:shadow-2xl transition-all duration-500 relative"
              >
                {/* Background Decoration */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
                   <img src={group.bgImage || foodDrawing} alt="" className="w-full h-full object-cover grayscale" />
                </div>

                <div className="p-7 relative z-10">
                  <div className="flex justify-between items-center border-b border-slate-100/50 pb-5 mb-5">
                    <h4 className="font-black text-[12px] text-[#03045E] bg-blue-50/80 px-4 py-2 rounded-xl uppercase tracking-widest border border-blue-100/50">📂 {group.title}</h4>
                    <span className="text-[9px] text-slate-500 font-black uppercase bg-slate-50 px-3 py-1.5 rounded-full">{group.items.filter(i => i.checked).length}/{group.items.length} Selesai</span>
                  </div>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <motion.div key={item.id} onClick={() => toggleCheck(group.id, item.id)} whileTap={{ scale: 0.98 }} className="flex items-center justify-between p-3.5 rounded-[22px] hover:bg-blue-50/50 cursor-pointer transition-all group/item border border-transparent hover:border-blue-100/50">
                        <div className="flex items-center gap-4">
                          {item.checked ? <CheckCircle2 className="w-6 h-6 text-[#0077B6]" /> : <Circle className="w-6 h-6 text-slate-200 group-hover/item:text-[#0077B6] transition-colors" />}
                          <span className={`text-[14px] font-bold tracking-tight ${item.checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.name}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* SHOPPE/TOKPED STYLE BOTTOM STICKY BAR */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-xl z-40">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/95 backdrop-blur-xl border-2 border-white rounded-[35px] p-4 flex items-center justify-between shadow-2xl shadow-blue-900/10"
        >
          <div className="flex items-center gap-4 pl-4">
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Selesai</span>
                <span className="text-xl font-black text-[#03045E]">{checkedItemsCount} <span className="text-sm text-slate-400 font-bold">/ {totalItems}</span></span>
             </div>
          </div>
          
          <button 
            onClick={handleFinishShopping}
            className="bg-gradient-to-r from-[#0077B6] to-[#03045E] text-white px-8 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            Selesaikan Belanja
          </button>
        </motion.div>
      </div>

      {/* CART DRAWER / MODAL */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-[#03045E]/40 backdrop-blur-sm" />
             <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white w-full max-w-xl rounded-[60px] p-10 shadow-2xl">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8" />
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-3xl font-black text-[#03045E]">Keranjang Belanja</h3>
                   <button onClick={() => setIsCartOpen(false)} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-primary transition-colors">
                      <ShoppingBag className="w-6 h-6" />
                   </button>
                </div>
                <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                   {shoppingGroups.map(g => (
                      <div key={g.id} className="p-6 bg-blue-50/50 rounded-[40px] border border-blue-100/50 relative overflow-hidden">
                         <div className="absolute inset-0 z-0 opacity-[0.05]">
                            <img src={g.bgImage || foodDrawing} alt="" className="w-full h-full object-cover" />
                         </div>
                         <div className="relative z-10">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                               <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Grup: {g.title}
                            </p>
                            <div className="space-y-3">
                               {g.items.map(i => (
                                  <div key={i.id} className="flex justify-between items-center text-[13px] font-bold text-[#03045E]">
                                     <span className={i.checked ? 'text-slate-400 line-through' : ''}>{i.name}</span>
                                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${i.checked ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {i.checked ? 'Selesai' : 'Belum'}
                                     </span>
                                   </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
                <button 
                  onClick={handleFinishShopping}
                  className="w-full mt-10 py-6 bg-[#03045E] text-white rounded-[30px] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                   Konfirmasi Belanja
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
