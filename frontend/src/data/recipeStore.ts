export interface Recipe {
  id: string;
  title: string;
  category: "Soup" | "Salad" | "Main Course" | "Dessert";
  image: string;
  createdBy: string;
  authorRole: "Admin" | "Premium User" | "Standard User";
  isOfficial: boolean;
  status: "Approved" | "Pending";
}

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: "rec_1",
    title: "Spicy Kimchi Jjigae",
    category: "Soup",
    image: "https://images.unsplash.com/photo-1626804475315-76c240954b83?auto=format&fit=crop&w=600&q=80",
    createdBy: "System",
    authorRole: "Admin",
    isOfficial: true,
    status: "Approved"
  },
  {
    id: "rec_2",
    title: "Soto Ayam Kuah Hangat",
    category: "Soup",
    image: "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=600&q=80",
    createdBy: "System",
    authorRole: "Admin",
    isOfficial: true,
    status: "Approved"
  },
  {
    id: "rec_3",
    title: "Rendang Daging Padang",
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80",
    createdBy: "System",
    authorRole: "Admin",
    isOfficial: true,
    status: "Approved"
  },
  {
    id: "rec_4",
    title: "Crispy Caesar Salad",
    category: "Salad",
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80",
    createdBy: "community_member",
    authorRole: "Standard User",
    isOfficial: false,
    status: "Approved"
  },
  {
    id: "rec_5",
    title: "Mango Mint Sorbet",
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
    createdBy: "community_member",
    authorRole: "Standard User",
    isOfficial: false,
    status: "Approved"
  },
  {
    id: "rec_6",
    title: "Gado-Gado Siram Betawi",
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    createdBy: "System",
    authorRole: "Admin",
    isOfficial: true,
    status: "Approved"
  },
  {
    id: "rec_7",
    title: "Creamy Mushroom Bisque",
    category: "Soup",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
    createdBy: "premium_budi",
    authorRole: "Premium User",
    isOfficial: false,
    status: "Pending"
  },
  {
    id: "rec_8",
    title: "Fresh Greek Avocado Salad",
    category: "Salad",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    createdBy: "premium_budi",
    authorRole: "Premium User",
    isOfficial: false,
    status: "Approved"
  },
  {
    id: "rec_9",
    title: "Matcha Lava Cake",
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    createdBy: "community_member",
    authorRole: "Standard User",
    isOfficial: false,
    status: "Pending"
  }
];

const LOCAL_STORAGE_KEY = "cookedu_recipes_pool";

export const getStoredRecipes = (): Recipe[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_RECIPES));
    return INITIAL_RECIPES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_RECIPES;
  }
};

export const saveRecipesToStorage = (recipes: Recipe[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recipes));
};

export const resetRecipesStorage = () => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_RECIPES));
  return INITIAL_RECIPES;
};
