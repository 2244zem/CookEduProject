import { useState } from 'react';
import { ShoppingBag, Trash2, CheckCircle, Check } from 'lucide-react';
import type { Recipe } from '../data/recipeStore';

interface ShoppingListProps {
  cartItems: Recipe[];
  onRemoveItem: (recipe: Recipe) => void;
  onClearCart: () => void;
}

// Pre-defined ingredients for dynamic aggregation
const RECIPE_INGREDIENTS_MAP: Record<string, string[]> = {
  rec_1: ["200g Kimchi Fermentasi", "150g Daging Sapi Iris", "1 Blok Tahu Sutra", "2 batang Daun Bawang", "2 sdm Pasta Gochujang", "3 siung Bawang Putih"],
  rec_2: ["500g Daging Ayam", "100g Soun / Bihun", "2 lembar Daun Salam", "2 batang Serai", "3 butir Telur Rebus", "150g Kol Iris"],
  rec_3: ["1 kg Daging Sapi Sengkel", "1000ml Santan Kental", "4 lembar Daun Jeruk", "2 batang Serai", "100g Bumbu Rendang Padang"],
  rec_4: ["2 ikat Selada Romaine", "50g Croutons", "100ml Caesar Dressing", "50g Keju Parmesan", "200g Dada Ayam Panggang"],
  rec_5: ["3 buah Mangga Arum Manis", "1 ikat Daun Mint Segar", "100ml Sirup Gula", "2 buah Jeruk Nipis"],
  rec_6: ["1 papan Tempe Goreng", "2 kotak Tahu Putih", "100g Toge Rebus", "150g Kacang Tanah Goreng", "3 sdm Kecap Manis"],
  rec_7: ["300g Jamur Kancing", "200ml Krim Kental (Heavy Cream)", "3 siung Bawang Putih", "2 sdm Mentega", "1 sdt Thyme Kering"],
  rec_8: ["2 buah Alpukat Mentega", "150g Tomat Ceri", "1 buah Timun Jepang", "100g Keju Feta", "3 sdm Minyak Zaitun"],
  rec_9: ["2 sdm Bubuk Matcha Jepang", "150g Cokelat Putih", "3 butir Telur Ayam", "80g Tepung Terigu", "50g Mentega Leleh"]
};

export default function ShoppingList({
  cartItems,
  onRemoveItem,
  onClearCart
}: ShoppingListProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const toggleIngredientCheck = (key: string) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Compile all ingredients from the cart
  const allIngredients = cartItems.flatMap(recipe => {
    const ingredients = RECIPE_INGREDIENTS_MAP[recipe.id] || ["Bahan Standar Kuliner (Secukupnya)"];
    return ingredients.map(ing => ({
      recipeTitle: recipe.title,
      text: ing,
      key: `${recipe.id}-${ing}`
    }));
  });

  const checkedCount = Object.values(checkedIngredients).filter(Boolean).length;
  const progressPercent = allIngredients.length > 0 
    ? Math.round((checkedCount / allIngredients.length) * 100) 
    : 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-6 h-fit relative">
      {/* Sidebar Header */}
      <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
            <span>Grup Belanja Minggu Ini</span>
          </h2>
          <p className="text-[10px] text-slate-400 font-medium">
            Bahan otomatis dikelompokkan berdasarkan menu aktif
          </p>
        </div>
        {cartItems.length > 0 && (
          <button 
            onClick={onClearCart}
            className="text-[10px] font-black text-rose-500 hover:text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 transition-all flex items-center gap-1 active:scale-95"
          >
            Bersihkan
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        // Empty Cart state
        <div className="text-center py-10 text-slate-400 space-y-3">
          <div className="w-12 h-12 bg-concepto border border-slate-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag className="w-6 h-6 text-slate-300" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-extrabold text-slate-700">Belum ada menu kuliner</p>
            <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">
              Pilih menu rekomendasi hari ini dan klik "+ Masuk Belanja" untuk mengkalkulasi bahan otomatis.
            </p>
          </div>
        </div>
      ) : (
        // Active Shopping Cart State
        <div className="space-y-5">
          {/* Active menus scrollbar container */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Menu Terpilih ({cartItems.length})
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cartItems.map(item => (
                <div 
                  key={item.id} 
                  className="bg-concepto rounded-xl p-3 border border-slate-100 flex items-center justify-between group transition-all hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src={item.image} 
                      alt="" 
                      className="w-8 h-8 rounded-lg object-cover bg-slate-200 border border-white"
                    />
                    <div className="text-left">
                      <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1">{item.title}</h4>
                      <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5" /> Siap dikalkulasi
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(item)} 
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Progress tracker */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
              <span>Progress Belanja</span>
              <span className="text-emerald-600">{progressPercent}% ({checkedCount}/{allIngredients.length})</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Aggregated Shopping List Items */}
          <div className="space-y-2.5 text-left">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Daftar Bahan Yang Diperlukan
              </label>
              <span className="text-[9px] font-semibold text-slate-400 italic">Auto-aggregated</span>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {allIngredients.map((item) => {
                const isChecked = !!checkedIngredients[item.key];
                return (
                  <div 
                    key={item.key}
                    onClick={() => toggleIngredientCheck(item.key)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isChecked
                        ? "bg-slate-50/50 border-slate-100 text-slate-400 line-through"
                        : "bg-white border-slate-100 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isChecked
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 bg-white"
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="text-[11px] leading-tight flex-1">
                      <span className="font-semibold">{item.text}</span>
                      <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">
                        {item.recipeTitle}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
