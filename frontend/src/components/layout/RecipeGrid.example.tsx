/**
 * RecipeGrid Component Usage Examples
 * 
 * This file demonstrates how to use the RecipeGrid component
 * with different configurations and custom render functions.
 */

import React from 'react';
import { RecipeGrid } from './RecipeGrid';
import type { RecipeViewModel } from '../../types/RecipeViewModel';

// Example 1: Basic usage with default settings
export const BasicRecipeGrid: React.FC<{ recipes: RecipeViewModel[] }> = ({ recipes }) => {
  return (
    <RecipeGrid
      recipes={recipes}
      viewMode="grid"
    />
  );
};

// Example 2: Grid with custom column configuration
export const CustomColumnsGrid: React.FC<{ recipes: RecipeViewModel[] }> = ({ recipes }) => {
  return (
    <RecipeGrid
      recipes={recipes}
      viewMode="grid"
      columns={{
        mobile: 1,
        tablet: 2,
        desktop: 4,  // 4 columns on desktop instead of default 3
        wide: 5,     // 5 columns on wide screens instead of default 4
      }}
    />
  );
};

// Example 3: List view mode
export const ListViewGrid: React.FC<{ recipes: RecipeViewModel[] }> = ({ recipes }) => {
  return (
    <RecipeGrid
      recipes={recipes}
      viewMode="list"
    />
  );
};

// Example 4: With custom recipe card renderer
export const CustomCardGrid: React.FC<{ recipes: RecipeViewModel[] }> = ({ recipes }) => {
  const renderCustomCard = (recipe: RecipeViewModel, viewMode: 'grid' | 'list') => {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <img
          src={recipe.image_url || '/placeholder.jpg'}
          alt={recipe.title}
          className="w-full h-48 object-cover rounded-md mb-3"
        />
        <h3 className="font-bold text-lg mb-2">{recipe.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{recipe.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{recipe.formatted_cooking_time}</span>
          <span>{recipe.difficulty_label}</span>
          <span>⭐ {recipe.rating.toFixed(1)}</span>
        </div>
      </div>
    );
  };

  return (
    <RecipeGrid
      recipes={recipes}
      viewMode="grid"
      renderCard={renderCustomCard}
    />
  );
};

// Example 5: With loading state
export const LoadingGrid: React.FC = () => {
  return (
    <RecipeGrid
      recipes={[]}
      loading={true}
    />
  );
};

// Example 6: With empty state
export const EmptyGrid: React.FC = () => {
  return (
    <RecipeGrid
      recipes={[]}
      emptyMessage="Belum ada resep yang tersedia"
    />
  );
};

// Example 7: Complete page with view mode toggle
export const RecipeGridPage: React.FC<{ recipes: RecipeViewModel[] }> = ({ recipes }) => {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* View mode toggle */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-sky-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-sky-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Recipe grid */}
      <RecipeGrid
        recipes={recipes}
        viewMode={viewMode}
        loading={loading}
        emptyMessage="Tidak ada resep yang ditemukan"
        className="mb-8"
      />
    </div>
  );
};

// Mock data for testing
export const mockRecipes: RecipeViewModel[] = [
  {
    id: 1,
    title: 'Nasi Goreng Spesial',
    slug: 'nasi-goreng-spesial',
    description: 'Nasi goreng dengan bumbu rahasia yang lezat',
    ingredients: ['nasi', 'telur', 'bawang merah', 'kecap'],
    steps: ['Tumis bumbu', 'Masukkan nasi', 'Aduk rata'],
    image_url: 'https://example.com/nasi-goreng.jpg',
    difficulty: 'beginner',
    cooking_time: 30,
    nutritional_info: { calories: 450, protein: 12, carbohydrates: 60, fat: 15 },
    is_published: true,
    moderation_status: 'approved',
    is_system: false,
    creator: { id: 1, name: 'Chef Budi', role: 'chef' },
    category: { id: 1, name: 'Main Course', slug: 'main-course', description: null, icon: null, order_index: 1 },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    rating: 4.5,
    review_count: 120,
    is_bookmarked: false,
    is_favorited: true,
    formatted_cooking_time: '30 menit',
    difficulty_label: 'Mudah',
    calories_per_serving: 450,
  },
  // Add more mock recipes as needed...
];
