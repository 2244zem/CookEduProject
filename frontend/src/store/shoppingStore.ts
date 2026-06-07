import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ShoppingItem {
  id: string;
  name: string;
  amount?: number;
  unit?: string;
  checked: boolean;
}

export interface ShoppingGroup {
  id: string;
  title: string;
  items: ShoppingItem[];
}

interface ShoppingState {
  groups: ShoppingGroup[];
  pantryItems: string[]; // List of ingredient names already in kitchen
  ingredientPrices: Record<string, number>; // Estimated prices per unit
  addGroup: (title: string, items: any[]) => void;
  toggleItem: (groupId: string, itemId: string) => void;
  removeGroup: (groupId: string) => void;
  clearChecked: (groupId: string) => void;
  togglePantry: (name: string) => void;
  addPantryItems: (names: string[]) => void;
  setPrices: (prices: Record<string, number>) => void;
  getMergedItems: () => { name: string; amount: number; unit: string; checked: boolean; isPantry: boolean; price: number }[];
}

const parseIngredient = (ing: any) => {
  if (typeof ing !== 'string') {
    return {
      name: ing.item || ing.name || 'Unknown',
      amount: parseFloat(ing.amount || ing.quantity) || 1,
      unit: ing.unit || ''
    };
  }
  
  // Basic Regex: "3 siung Bawang Putih" -> [3, "siung", "Bawang Putih"]
  const match = ing.match(/^(\d+)?\s?(\w+)?\s?(.*)$/);
  if (match) {
    return {
      name: match[3] || ing,
      amount: parseFloat(match[1]) || 1,
      unit: match[2] || ''
    };
  }
  return { name: ing, amount: 1, unit: '' };
};

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set, get) => ({
      groups: [],
      pantryItems: [],
      ingredientPrices: {
        'ayam': 45000,
        'daging': 120000,
        'bawang': 5000,
        'telur': 2000,
        'beras': 15000,
        'santan': 5000,
        'minyak': 18000
      },
      addGroup: (title, items) => set((state) => ({
        groups: [
          {
            id: `group-${Date.now()}`,
            title,
            items: items.map((ing, idx) => {
               const parsed = parseIngredient(ing);
               return {
                 id: `item-${idx}-${Date.now()}`,
                 name: parsed.name,
                 amount: parsed.amount,
                 unit: parsed.unit,
                 checked: false
               };
            })
          },
          ...state.groups
        ]
      })),
      toggleItem: (groupId, itemId) => set((state) => ({
        groups: state.groups.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              items: group.items.map(item => 
                item.id === itemId ? { ...item, checked: !item.checked } : item
              )
            }
          }
          return group
        })
      })),
      removeGroup: (groupId) => set((state) => ({
        groups: state.groups.filter(g => g.id !== groupId)
      })),
      clearChecked: (groupId) => set((state) => ({
        groups: state.groups.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              items: group.items.filter(item => !item.checked)
            }
          }
          return group
        })
      })),
      togglePantry: (name) => set((state) => ({
        pantryItems: state.pantryItems.includes(name.toLowerCase())
          ? state.pantryItems.filter(i => i !== name.toLowerCase())
          : [...state.pantryItems, name.toLowerCase()]
      })),
      addPantryItems: (names) => set((state) => {
        const next = new Set(state.pantryItems)
        names.forEach((name) => {
          const clean = String(name || '').trim().toLowerCase()
          if (clean) next.add(clean)
        })
        return { pantryItems: Array.from(next) }
      }),
      setPrices: (prices) => set({ ingredientPrices: prices }),
      getMergedItems: () => {
        const { groups, pantryItems, ingredientPrices } = get();
        const allItems = groups.flatMap(g => g.items);
        const merged: any = {};
        
        allItems.forEach(item => {
          const nameLower = item.name.toLowerCase();
          const unit = item.unit || '';
          const key = `${nameLower}-${unit.toLowerCase()}`;
          if (!merged[key]) {
            // Find price based on name match
            const priceKey = Object.keys(ingredientPrices).find(k => nameLower.includes(k)) || '';
            const unitPrice = priceKey ? ingredientPrices[priceKey] : 0;

            merged[key] = { 
              ...item, 
              isPantry: pantryItems.includes(nameLower),
              price: unitPrice * (item.amount || 1)
            };
          } else {
            merged[key].amount += (item.amount || 0);
            if (item.checked) merged[key].checked = true;
            
            // Update total price for this merged item
            const priceKey = Object.keys(ingredientPrices).find(k => nameLower.includes(k)) || '';
            const unitPrice = priceKey ? ingredientPrices[priceKey] : 0;
            merged[key].price = unitPrice * merged[key].amount;
          }
        });
        
        return Object.values(merged);
      }
    }),
    {
      name: 'cookedu-shopping-storage',
    }
  )
)
