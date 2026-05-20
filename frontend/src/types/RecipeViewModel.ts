/**
 * TypeScript interfaces for Recipe ViewModels
 * These interfaces match the backend API responses for desktop platform
 */

/**
 * Category view model interface
 */
export interface CategoryViewModel {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  recipes_count?: number;
  lessons_count?: number;
}

/**
 * User view model interface
 */
export interface UserViewModel {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  avatar_url: string | null;
  xp: number;
  preferences: Record<string, any> | null;
  created_at: string;
}

/**
 * Creator view model interface (simplified user for recipe creator)
 */
export interface CreatorViewModel {
  id: number | null;
  name: string;
  role: string;
}

/**
 * Nutritional information interface
 */
export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  [key: string]: any;
}

/**
 * Base Recipe view model interface
 * Contains fields common to all platforms
 */
export interface BaseRecipeViewModel {
  id: number;
  title: string;
  slug: string;
  description: string;
  ingredients: string[] | any;
  steps: string[] | any;
  image_url: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  cooking_time: number;
  nutritional_info: NutritionalInfo | null;
  is_published: boolean;
  moderation_status: string;
  is_system: boolean;
  creator: CreatorViewModel;
  category: CategoryViewModel;
  created_at: string;
  updated_at: string;
}

/**
 * Desktop Recipe view model interface
 * Extends base recipe with desktop-specific fields
 */
export interface RecipeViewModel extends BaseRecipeViewModel {
  // Desktop-specific fields
  rating: number;
  review_count: number;
  is_bookmarked: boolean;
  is_favorited: boolean;
  formatted_cooking_time: string;
  difficulty_label: string;
  calories_per_serving: number;
}

/**
 * API response wrapper for single recipe
 */
export interface RecipeResponse {
  data: RecipeViewModel;
  meta?: {
    platform: string;
    layout: string;
  };
}

/**
 * API response wrapper for recipe collection
 */
export interface RecipeCollectionResponse {
  data: RecipeViewModel[];
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}
