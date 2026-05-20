# RecipeGrid Component

A responsive CSS grid layout component for displaying recipes with configurable breakpoints and view modes.

## Features

- ✅ **Responsive Grid Layout**: Automatically adjusts columns based on viewport width
- ✅ **Configurable Breakpoints**: 768px (2 cols), 1024px (3 cols), 1440px (4 cols)
- ✅ **Grid & List View Modes**: Switch between grid and list layouts
- ✅ **Lightweight Animations**: Optimized for performance, avoiding Android lag
- ✅ **Loading State**: Built-in skeleton loading UI
- ✅ **Empty State**: Customizable empty state message
- ✅ **Custom Render Function**: Full control over recipe card rendering
- ✅ **Accessibility**: ARIA labels and semantic HTML

## Requirements

This component satisfies the following requirements:
- **Requirement 5.1**: 2 columns between 768px and 1024px
- **Requirement 5.2**: 3 columns between 1024px and 1440px
- **Requirement 5.3**: 4 columns at 1440px or wider
- **Requirement 5.4**: Dynamic column adjustment without page reload

## Installation

The component is located at:
```
frontend/src/components/layout/RecipeGrid.tsx
```

## Basic Usage

```tsx
import { RecipeGrid } from './components/layout/RecipeGrid';
import type { RecipeViewModel } from './types/RecipeViewModel';

function RecipesPage({ recipes }: { recipes: RecipeViewModel[] }) {
  return (
    <RecipeGrid
      recipes={recipes}
      viewMode="grid"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `recipes` | `RecipeViewModel[]` | **Required** | Array of recipes to display |
| `viewMode` | `'grid' \| 'list'` | `'grid'` | Display mode for recipes |
| `columns` | `ColumnConfig` | See below | Custom column configuration |
| `renderCard` | `Function` | Built-in card | Custom render function for recipe cards |
| `loading` | `boolean` | `false` | Show loading skeleton |
| `emptyMessage` | `string` | `'Tidak ada resep ditemukan'` | Message when no recipes |
| `className` | `string` | `''` | Additional CSS classes |

### Default Column Configuration

```typescript
{
  mobile: 1,   // < 768px
  tablet: 2,   // 768px - 1024px
  desktop: 3,  // 1024px - 1440px
  wide: 4      // >= 1440px
}
```

## Examples

### 1. Basic Grid View

```tsx
<RecipeGrid
  recipes={recipes}
  viewMode="grid"
/>
```

### 2. List View

```tsx
<RecipeGrid
  recipes={recipes}
  viewMode="list"
/>
```

### 3. Custom Column Configuration

```tsx
<RecipeGrid
  recipes={recipes}
  viewMode="grid"
  columns={{
    mobile: 1,
    tablet: 2,
    desktop: 4,  // 4 columns instead of default 3
    wide: 5,     // 5 columns instead of default 4
  }}
/>
```

### 4. Custom Recipe Card Renderer

```tsx
<RecipeGrid
  recipes={recipes}
  renderCard={(recipe, viewMode) => (
    <div className="custom-card">
      <img src={recipe.image_url} alt={recipe.title} />
      <h3>{recipe.title}</h3>
      <p>{recipe.description}</p>
    </div>
  )}
/>
```

### 5. Loading State

```tsx
<RecipeGrid
  recipes={[]}
  loading={true}
/>
```

### 6. Empty State

```tsx
<RecipeGrid
  recipes={[]}
  emptyMessage="Belum ada resep yang tersedia"
/>
```

### 7. Complete Page with View Toggle

```tsx
function RecipesPage({ recipes }: { recipes: RecipeViewModel[] }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* View mode toggle */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setViewMode('grid')}
          className={viewMode === 'grid' ? 'active' : ''}
        >
          Grid
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={viewMode === 'list' ? 'active' : ''}
        >
          List
        </button>
      </div>

      {/* Recipe grid */}
      <RecipeGrid
        recipes={recipes}
        viewMode={viewMode}
      />
    </div>
  );
}
```

## Responsive Breakpoints

The component uses the `useBreakpoint` hook to detect viewport width and adjust columns:

| Breakpoint | Width Range | Default Columns |
|------------|-------------|-----------------|
| `mobile` | < 768px | 1 |
| `tablet` | 768px - 1024px | 2 |
| `desktop` | 1024px - 1440px | 3 |
| `wide` | >= 1440px | 4 |

## Performance Considerations

### Lightweight Animations

The component uses minimal animations to avoid performance issues on Android:

- **Opacity transitions**: 200ms duration for smooth fade-in
- **Transform transitions**: 300ms for hover effects
- **No complex animations**: Avoids heavy CSS transforms that cause lag

### Optimizations

1. **Lazy loading images**: Uses `loading="lazy"` attribute
2. **Efficient re-renders**: Only updates when breakpoint changes
3. **Minimal DOM manipulation**: Uses CSS Grid for layout
4. **Skeleton loading**: Prevents layout shift during data fetch

## Accessibility

The component follows accessibility best practices:

- **Semantic HTML**: Uses proper `role` attributes
- **ARIA labels**: Provides context for screen readers
- **Keyboard navigation**: All interactive elements are keyboard accessible
- **Alt text**: Images have descriptive alt attributes

## Styling

The component uses Tailwind CSS with custom design tokens:

- **Colors**: Sky blue theme (`sky-*` classes)
- **Rounded corners**: 30px for cards, 22px for images
- **Shadows**: Subtle hover shadows for depth
- **Spacing**: Consistent gap sizes (4 on mobile, 6 on desktop)

## Integration with Existing Components

The RecipeGrid component works seamlessly with:

- **RecipeCard**: Can use the existing RecipeCard component via `renderCard` prop
- **useResponsive**: Uses the shared responsive hook
- **RecipeViewModel**: Typed with the desktop-specific recipe interface

## Browser Support

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ CSS Grid support required (IE11 not supported)

## Related Files

- `frontend/src/hooks/useResponsive.ts` - Responsive breakpoint hook
- `frontend/src/types/RecipeViewModel.ts` - Recipe type definitions
- `frontend/src/components/RecipeCard.tsx` - Existing recipe card component
- `frontend/src/components/layout/RecipeGrid.example.tsx` - Usage examples

## Future Enhancements

Potential improvements for future iterations:

1. **Virtualization**: For large recipe lists (1000+ items)
2. **Infinite scroll**: Load more recipes on scroll
3. **Filter integration**: Built-in filter UI
4. **Sort options**: Sort by rating, date, popularity
5. **Animation variants**: More animation options while maintaining performance
6. **Masonry layout**: Pinterest-style layout option
7. **Drag and drop**: Reorder recipes (for admin)

## Troubleshooting

### Grid columns not changing on resize

Make sure the `useBreakpoint` hook is properly imported and the window resize listener is working.

### Images not loading

Check that `image_url` in RecipeViewModel is valid. The component falls back to `/placeholder-recipe.jpg`.

### Performance issues on Android

Ensure animations are kept minimal. The component uses lightweight transitions by default.

### TypeScript errors

Make sure `RecipeViewModel` type is properly imported from `types/RecipeViewModel.ts`.

## License

Part of the CookEdu project.
