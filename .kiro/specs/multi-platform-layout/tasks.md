# Implementation Plan: Multi-Platform Layout for CookEdu

## Overview

This implementation plan adds desktop/web layout support to CookEdu while preserving the existing Android layout. The solution introduces platform-aware API responses and responsive frontend components that adapt to different device form factors. The desktop layout will follow Apple/Shopee/Tokopedia design principles: clean typography, generous whitespace, grid-based product displays, and smooth animations.

## Tasks

- [x] 1. Backend: Platform Detection Infrastructure
  - [x] 1.1 Create Platform Detection Middleware
    - Create `backend/app/Http/Middleware/DetectPlatform.php`
    - Implement header-based detection with User-Agent fallback
    - Validate platform values against allowed list (android, desktop, tablet)
    - Attach platform to request attributes for downstream use
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.2 Create Platform Configuration File
    - Create `backend/config/platform.php` with supported platforms and features
    - Define response field mappings per platform
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 1.3 Register middleware in bootstrap/app.php
    - Add DetectPlatform to the global middleware stack
    - _Requirements: 1.4_

- [x] 2. Backend: Desktop Recipe Resources
  - [x] 2.1 Create DesktopRecipeResource class
    - Create `backend/app/Http/Resources/Platform/DesktopRecipeResource.php`
    - Extend existing RecipeResource with desktop-specific fields
    - Implement rating, review_count, is_bookmarked, is_favorited fields
    - Add formatted display fields (formatted_cooking_time, difficulty_label, calories_per_serving)
    - _Requirements: 2.1, 2.3_

  - [x] 2.2 Implement bookmark and favorite lookup methods
    - Add isBookmarkedBy() method to check user bookmarks
    - Add isFavoritedBy() method to check user favorites
    - _Requirements: 2.1_

  - [x] 2.3 Implement formatting helper methods
    - Add formatCookingTime() for localized time display
    - Add getDifficultyLabel() for Indonesian difficulty labels
    - Add calculateCaloriesPerServing() for nutrition display
    - _Requirements: 2.3_

  - [ ]* 2.4 Write unit tests for DesktopRecipeResource
    - Test desktop response contains all required fields
    - Test formatting methods return correct values
    - _Requirements: 2.1, 2.3_

- [ ] 3. Backend: Desktop Lesson Resources
  - [x] 3.1 Create DesktopLessonResource class
    - Create `backend/app/Http/Resources/Platform/DesktopLessonResource.php`
    - Extend existing LessonResource with desktop-specific fields
    - Implement progress, is_completed, related_lessons fields
    - _Requirements: 3.1_

  - [x] 3.2 Implement progress tracking methods
    - Add getUserProgress() method for lesson progress percentage
    - Add isCompletedBy() method for completion status
    - Add getRelatedLessons() method for related content
    - _Requirements: 3.1_

  - [ ]* 3.3 Write unit tests for DesktopLessonResource
    - Test desktop response contains progress fields
    - Test related lessons are properly included
    - _Requirements: 3.1_

- [x] 4. Backend: Platform-Aware Controller Updates
  - [x] 4.1 Update RecipeController for platform awareness
    - Modify index() method to detect platform from request
    - Return DesktopRecipeResource for desktop platform
    - Keep existing RecipeResource for android platform
    - Add platform metadata to response
    - _Requirements: 2.4, 2.5_

  - [x] 4.2 Update RecipeController show() method
    - Add platform detection for single recipe view
    - Include desktop-specific fields in desktop responses
    - _Requirements: 2.1, 2.2_

  - [x] 4.3 Update LessonController for platform awareness
    - Modify index() and show() methods for platform detection
    - Return DesktopLessonResource for desktop platform
    - _Requirements: 3.3, 3.4_

  - [x] 4.4 Update DashboardController for platform awareness
    - Add platform-specific statistics formatting
    - Return desktop-optimized stats for desktop platform
    - _Requirements: 4.1, 4.2_

  - [ ]* 4.5 Write feature tests for platform-aware responses
    - Test recipe list with X-Platform header
    - Test lesson list with X-Platform header
    - Test dashboard stats with different platforms
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 4.1, 4.2_

- [x] 5. Backend: Database Migrations for Desktop Features
  - [x] 5.1 Create bookmarks table migration
    - Create migration for user_bookmarks table
    - Include user_id, recipe_id, timestamps
    - Add unique constraint for user-recipe pairs
    - _Requirements: 2.1_

  - [x] 5.2 Create favorites table migration
    - Create migration for user_favorites table
    - Include user_id, recipe_id, timestamps
    - Add unique constraint for user-recipe pairs
    - _Requirements: 2.1_

  - [x] 5.3 Run migrations and verify schema
    - Execute php artisan migrate
    - Verify tables created correctly
    - _Requirements: 2.1_

- [~] 6. Checkpoint - Backend Platform Detection Complete
  - Ensure all backend tests pass, ask the user if questions arise.

- [ ] 7. Frontend: API Service Platform Headers
  - [x] 7.1 Update API service to include platform headers
    - Modify `frontend/src/lib/api.ts` to add X-Platform header
    - Add X-Platform-Version header for API version tracking
    - Set platform value to "desktop" for web requests
    - _Requirements: 6.1, 6.3_

  - [-] 7.2 Add platform-specific error handling
    - Implement toast notification for desktop errors
    - Handle recovery_action field in error responses
    - _Requirements: 13.1, 13.2_

  - [ ]* 7.3 Write unit tests for API service
    - Test X-Platform header is included in all requests
    - Test error handling with recovery_action
    - _Requirements: 6.1, 13.1_

- [x] 8. Frontend: Design System Tokens
  - [x] 8.1 Create CSS design tokens file
    - Create `frontend/src/styles/tokens.css` with design system variables
    - Define color palette (primary blue #007AFF, secondary orange #FF9500, success green #34C759)
    - Define typography system with font sizing hierarchy
    - Define spacing tokens for generous whitespace
    - Define shadow tokens for iOS-style subtle shadows
    - Define border radius tokens (6px-16px range)
    - Define transition tokens (150ms-350ms)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [x] 8.2 Import tokens in main.tsx
    - Add tokens.css import to main entry point
    - _Requirements: 14.1_

- [ ] 9. Frontend: Responsive Grid System
  - [-] 9.1 Create RecipeGrid component
    - Create `frontend/src/components/layout/RecipeGrid.tsx`
    - Implement responsive CSS grid with Tailwind
    - Configure breakpoints: 768px (2 cols), 1024px (3 cols), 1440px (4 cols)
    - Support grid and list view modes
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 9.2 Create useBreakpoint hook
    - Create `frontend/src/hooks/useResponsive.ts`
    - Detect viewport width changes
    - Return current breakpoint (mobile, tablet, desktop, wide)
    - _Requirements: 5.4_

  - [ ]* 9.3 Write unit tests for RecipeGrid
    - Test responsive column calculation at each breakpoint
    - Test view mode switching
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 10. Frontend: Desktop Layout Components
  - [ ] 10.1 Create DesktopLayout component
    - Create `frontend/src/components/layout/DesktopLayout.tsx`
    - Implement layout with header, sidebar, main content, footer
    - Use CSS Grid for desktop layout structure
    - _Requirements: 7.1_

  - [~] 10.2 Create Header component for desktop
    - Create `frontend/src/components/layout/DesktopHeader.tsx`
    - Display navigation links for desktop
    - Show user info when authenticated
    - Show login/register when not authenticated
    - _Requirements: 7.2, 7.3_

  - [~] 10.3 Create Sidebar component
    - Create `frontend/src/components/layout/Sidebar.tsx`
    - Add navigation to Home, Recipes, Lessons, Profile
    - Implement collapsible behavior
    - _Requirements: 7.4_

  - [~] 10.4 Create Footer component
    - Create `frontend/src/components/layout/Footer.tsx`
    - Display copyright and helpful links
    - _Requirements: 7.5_

  - [ ]* 10.5 Write component tests for desktop layout
    - Test header shows correct auth state
    - Test sidebar navigation links
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [ ] 11. Frontend: Recipe Card Enhancement
  - [~] 11.1 Update RecipeCard component for desktop
    - Enhance existing `frontend/src/components/RecipeCard.tsx`
    - Add rating, cooking time, difficulty display for desktop
    - Implement hover elevation effect
    - Handle click navigation to detail page
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 11.2 Add TypeScript interfaces for RecipeViewModel
    - Create `frontend/src/types/RecipeViewModel.ts`
    - Define RecipeViewModel interface with desktop fields
    - Define CategoryViewModel and UserViewModel interfaces
    - _Requirements: 2.1_

  - [ ]* 11.3 Write unit tests for RecipeCard
    - Test hover effect is applied
    - Test click triggers navigation
    - _Requirements: 8.2, 8.3_

- [ ] 12. Frontend: Recipe Detail Page
  - [~] 12.1 Create RecipeDetailPage component
    - Create `frontend/src/pages/RecipeDetailPage.tsx`
    - Display recipe image, title, description
    - Display ingredients list and step-by-step instructions
    - _Requirements: 9.1_

  - [~] 12.2 Add bookmark and favorite functionality
    - Implement bookmark button for authenticated users
    - Implement favorite button for authenticated users
    - Hide buttons for unauthenticated users
    - _Requirements: 9.2, 9.3_

  - [ ]* 12.3 Write unit tests for RecipeDetailPage
    - Test recipe data displays correctly
    - Test bookmark/favorite buttons visibility based on auth
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 13. Frontend: Lesson Display with Progress
  - [~] 13.1 Update lesson list display for desktop
    - Modify lesson list to show progress percentage
    - Display completion status indicator
    - Show lesson duration and level
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 13.2 Create LessonViewModel TypeScript interface
    - Create `frontend/src/types/LessonViewModel.ts`
    - Define LessonViewModel with desktop fields
    - Define LessonProgress interface
    - _Requirements: 3.1_

  - [ ]* 13.3 Write unit tests for lesson display
    - Test progress percentage display
    - Test completion indicator
    - _Requirements: 10.2, 10.3_

- [ ] 14. Frontend: Routing and Integration
  - [~] 14.1 Update App.tsx with desktop routes
    - Add routes for RecipeDetailPage
    - Configure DesktopLayout as wrapper for desktop pages
    - _Requirements: 7.1_

  - [~] 14.2 Implement platform detection in frontend
    - Detect if running as web or Android app
    - Switch between MobileLayout and DesktopLayout
    - _Requirements: 5.4_

  - [~] 14.3 Wire RecipeGrid to API
    - Connect RecipeGrid to recipeApi.list()
    - Implement pagination and filtering
    - _Requirements: 2.4_

- [~] 15. Checkpoint - Frontend Components Complete
  - Ensure all frontend tests pass, ask the user if questions arise.

- [ ] 16. Frontend: Error Handling Implementation
  - [~] 16.1 Create Toast notification component
    - Create `frontend/src/components/ui/Toast.tsx`
    - Implement toast.error() for user-friendly error display
    - Support recovery_action suggestions
    - _Requirements: 13.1, 13.2_

  - [~] 16.2 Create toast store with Zustand
    - Create `frontend/src/store/toastStore.ts`
    - Manage toast queue and lifecycle
    - _Requirements: 13.1_

  - [~] 16.3 Integrate error handling with API service
    - Update API interceptor to show toast on errors
    - Handle 401, 403, 404, 500 errors appropriately
    - _Requirements: 13.1, 13.3_

- [ ] 17. Integration Testing
  - [ ]* 17.1 Write integration tests for platform detection flow
    - Test backend middleware with different headers
    - Test frontend API service sends correct headers
    - Test full request/response cycle
    - _Requirements: 1.1, 1.2, 6.1_

  - [ ]* 17.2 Write integration tests for recipe display flow
    - Test recipe list loads with desktop fields
    - Test recipe detail shows bookmark/favorite options
    - Test grid responsiveness
    - _Requirements: 2.1, 5.1, 5.2, 5.3, 8.1_

  - [ ]* 17.3 Write integration tests for lesson progress flow
    - Test lesson list shows progress
    - Test completion status updates
    - _Requirements: 3.1, 10.1, 10.2, 10.3_

- [~] 18. Final Checkpoint - Implementation Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Production Deploy Fixes (Cloudflare + Railway)
  - [x] 19.1 Add PWA icon assets (`pwa-192x192.png`, `pwa-512x512.png`, `favicon.svg`)
  - [x] 19.2 Extend Laravel CORS for `*.workers.dev` / `*.pages.dev` and document `CORS_ALLOWED_ORIGINS`
  - [x] 19.3 Add `frontend/.env.example` with `VITE_API_URL` for Cloudflare builds
  - _Requirements: 6.1 (API from desktop web), design Phase 5 CORS_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The backend uses PHP (Laravel) and frontend uses TypeScript (React)
- Design tokens follow Apple/Shopee/Tokopedia design principles
- Property-based tests validate universal correctness properties from the design document

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "8.1"] },
    { "id": 1, "tasks": ["1.3", "2.1", "3.1", "5.1", "5.2", "8.2"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.2", "5.3", "7.1"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.4", "7.2", "9.1", "9.2", "10.1", "11.2", "13.2"] },
    { "id": 4, "tasks": ["4.5", "9.3", "10.2", "10.3", "10.4", "11.1", "12.1", "13.1", "16.1", "16.2"] },
    { "id": 5, "tasks": ["10.5", "11.3", "12.2", "14.1", "14.2", "14.3", "16.3"] },
    { "id": 6, "tasks": ["12.3", "13.3"] },
    { "id": 7, "tasks": ["2.4", "3.3", "7.3"] },
    { "id": 8, "tasks": ["17.1", "17.2", "17.3"] }
  ]
}
```
