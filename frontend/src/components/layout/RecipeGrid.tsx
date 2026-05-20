import React from 'react';
import { useBreakpoint } from '../../hooks/useResponsive';
import type { RecipeViewModel } from '../../types/RecipeViewModel';

/**
 * View mode for recipe display
 */
export type ViewMode = 'grid' | 'list';

/**
 * Column configuration for different breakpoints
 */
export interface ColumnConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

/**
 * Props for RecipeGrid component
 */
export interface RecipeGridProps {
  /** Array of recipes to display */
  recipes: RecipeViewModel[];
  
  /** View mode: grid or list */
  viewMode?: ViewMode;
  
  /** Custom column configuration for breakpoints */
  columns?: ColumnConfig;
  
  /** Custom render function for recipe cards */
  renderCard?: (recipe: RecipeViewModel, viewMode: ViewMode) => React.ReactNode;
  
  /** Loading state */
  loading?: boolean;
  
  /** Empty state message */
  emptyMessage?: string;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Default column configuration based on requirements:
 * - Mobile (< 768px): 1 column
 * - Tablet (768px - 1024px): 2 columns
 * - Desktop (1024px - 1440px): 3 columns
 * - Wide (>= 1440px): 4 columns
 */
const DEFAULT_COLUMNS: ColumnConfig = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  wide: 4,
};

/**
 * RecipeGrid Component
 * 
 * Responsive CSS grid layout for displaying recipes with configurable breakpoints.
 * Supports both grid and list view modes with lightweight animations.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 * 
 * @example
 * ```tsx
 * <RecipeGrid
 *   recipes={recipes}
 *   viewMode="grid"
 *   renderCard={(recipe) => <RecipeCard recipe={recipe} />}
 * />
 * ```
 */
export const RecipeGrid: React.FC<RecipeGridProps> = ({
  recipes,
  viewMode = 'grid',
  columns = DEFAULT_COLUMNS,
  renderCard,
  loading = false,
  emptyMessage = 'Tidak ada resep ditemukan',
  className = '',
}) => {
  const breakpoint = useBreakpoint();

  // Determine grid columns based on current breakpoint
  const getGridColumns = (): string => {
    if (viewMode === 'list') {
      return 'grid-cols-1';
    }

    switch (breakpoint) {
      case 'mobile':
        return `grid-cols-${columns.mobile}`;
      case 'tablet':
        return `grid-cols-${columns.tablet}`;
      case 'desktop':
        return `grid-cols-${columns.desktop}`;
      case 'wide':
        return `grid-cols-${columns.wide}`;
      default:
        return 'grid-cols-1';
    }
  };

  // Get gap size based on breakpoint (smaller gaps on mobile)
  const getGapSize = (): string => {
    if (breakpoint === 'mobile') {
      return 'gap-4';
    }
    return 'gap-6';
  };

  // Loading skeleton
  if (loading) {
    return (
      <div
        className={`grid ${getGridColumns()} ${getGapSize()} ${className}`}
        role="status"
        aria-label="Loading recipes"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="bg-white border border-sky-100/60 rounded-[30px] p-4 animate-pulse"
          >
            <div className="w-full h-44 bg-slate-200 rounded-[22px] mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-8 bg-slate-200 rounded w-full mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!recipes || recipes.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
        role="status"
        aria-label="No recipes found"
      >
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-slate-600 font-semibold text-lg">{emptyMessage}</p>
        <p className="text-slate-400 text-sm mt-2">
          Coba ubah filter atau kata kunci pencarian Anda
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid ${getGridColumns()} ${getGapSize()} ${className}`}
      role="list"
      aria-label={`${recipes.length} recipes in ${viewMode} view`}
    >
      {recipes.map((recipe) => (
        <div
          key={recipe.id}
          role="listitem"
          className="transition-opacity duration-200 ease-in-out"
        >
          {renderCard ? (
            renderCard(recipe, viewMode)
          ) : (
            <DefaultRecipeCard recipe={recipe} viewMode={viewMode} />
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Default recipe card component (fallback if no custom renderCard provided)
 */
const DefaultRecipeCard: React.FC<{
  recipe: RecipeViewModel;
  viewMode: ViewMode;
}> = ({ recipe, viewMode }) => {
  const isListView = viewMode === 'list';

  return (
    <div
      className={`bg-white border border-sky-100/60 rounded-[30px] p-4 hover:shadow-xl hover:shadow-sky-500/[0.03] hover:border-sky-200/60 transition-all duration-300 ${
        isListView ? 'flex flex-row gap-4' : 'flex flex-col'
      }`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden bg-sky-50/20 border border-sky-100/40 rounded-[22px] ${
          isListView ? 'w-32 h-32 flex-shrink-0' : 'w-full h-44'
        }`}
      >
        <img
          src={recipe.image_url || '/placeholder-recipe.jpg'}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className={`flex flex-col justify-between ${isListView ? 'flex-1' : 'mt-4'}`}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black px-3 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-100/70">
              {recipe.category.name}
            </span>
            {recipe.rating > 0 && (
              <div className="flex items-center gap-1 text-amber-500">
                <svg
                  className="w-3 h-3 fill-current"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-[10px] font-black text-slate-500">
                  {recipe.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <h3 className="font-extrabold text-sm text-slate-800 line-clamp-2 hover:text-sky-600 transition-colors">
            {recipe.title}
          </h3>

          <p className="text-[10px] text-slate-500 line-clamp-2">
            {recipe.description}
          </p>

          <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {recipe.formatted_cooking_time}
            </span>
            <span className="text-slate-200">•</span>
            <span>{recipe.difficulty_label}</span>
          </div>
        </div>

        {/* Action button */}
        <button
          className="mt-4 w-full bg-slate-900 text-white text-[10px] font-black px-4 py-2.5 rounded-xl hover:bg-sky-500 transition-colors duration-200 active:scale-95"
          aria-label={`View ${recipe.title} recipe`}
        >
          Lihat Resep
        </button>
      </div>
    </div>
  );
};

export default RecipeGrid;
