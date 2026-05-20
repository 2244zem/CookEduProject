# Requirements Document

## Introduction

This document defines the requirements for adding a desktop/web layout to CookEdu while preserving the existing Android layout. The solution introduces platform-aware API responses and responsive frontend components that adapt to different device form factors.

## Glossary

- **Platform**: The client platform type (android, desktop, tablet)
- **Platform Detection Middleware**: Backend component that identifies the client platform from request headers or User-Agent
- **Response Resource**: Laravel resource class that transforms model data into JSON API responses
- **Desktop-specific Fields**: Additional fields (rating, review_count, is_bookmarked, is_favorited) included only in desktop API responses
- **RecipeViewModel**: Data structure representing a recipe in API responses
- **LessonViewModel**: Data structure representing a lesson in API responses
- **Responsive Grid**: CSS grid layout that adapts column count based on viewport width

## Requirements

### Requirement 1: Platform Detection Middleware

**User Story:** As a backend developer, I want to detect the client platform from API requests, so that I can return platform-appropriate responses.

#### Acceptance Criteria

1. WHEN a request includes the X-Platform header, THE Platform Detection Middleware SHALL extract and use that platform value
2. WHEN a request does not include the X-Platform header, THE Platform Detection Middleware SHALL detect the platform from the User-Agent string
3. WHEN the X-Platform header contains an invalid value, THE Platform Detection Middleware SHALL default to "android" platform
4. WHEN platform detection completes, THE Platform Detection Middleware SHALL attach the platform to the request attributes for downstream use
5. THE Platform Detection Middleware SHALL recognize "android", "desktop", and "tablet" as valid platform values

### Requirement 2: Platform-Aware Recipe API Responses

**User Story:** As an API consumer, I want to receive platform-appropriate recipe data, so that I can display relevant information on each platform.

#### Acceptance Criteria

1. WHEN a recipe request is made with X-Platform header set to "desktop", THE API SHALL return response containing rating, review_count, is_bookmarked, and is_favorited fields
2. WHEN a recipe request is made with X-Platform header set to "android", THE API SHALL NOT include rating, review_count, is_bookmarked, and is_favorited fields in the response
3. WHEN a recipe request is made with X-Platform header set to "desktop", THE API SHALL include formatted display fields (formatted_cooking_time, difficulty_label, calories_per_serving)
4. WHEN a recipe list request is made from desktop, THE API SHALL return desktop-specific fields for each recipe in the collection
5. THE RecipeController SHALL determine which resource class to use based on the detected platform

### Requirement 3: Platform-Aware Lesson API Responses

**User Story:** As an API consumer, I want to receive platform-appropriate lesson data, so that I can display progress tracking on desktop.

#### Acceptance Criteria

1. WHEN a lesson request is made with X-Platform header set to "desktop", THE API SHALL return response containing progress, is_completed, and related_lessons fields
2. WHEN a lesson request is made with X-Platform header set to "android", THE API SHALL NOT include progress, is_completed, and related_lessons fields in the response
3. WHEN a lesson list request is made from desktop, THE API SHALL return desktop-specific fields for each lesson in the collection
4. THE LessonController SHALL determine which resource class to use based on the detected platform

### Requirement 4: Platform-Aware Dashboard API Response

**User Story:** As an API consumer, I want to receive platform-appropriate dashboard statistics, so that I can display relevant metrics on each platform.

#### Acceptance Criteria

1. WHEN a dashboard request is made with X-Platform header set to "desktop", THE API SHALL return platform-specific statistics formatted for desktop display
2. WHEN a dashboard request is made with X-Platform header set to "android", THE API SHALL return standard Android-formatted statistics

### Requirement 5: Desktop Frontend Responsive Grid Layout

**User Story:** As a desktop user, I want to view recipes in a responsive grid that adapts to my screen size, so that I have an optimal browsing experience.

#### Acceptance Criteria

1. WHEN the desktop viewport is between 768px and 1024px, THE RecipeGrid SHALL display 2 columns of recipe cards
2. WHEN the desktop viewport is between 1024px and 1440px, THE RecipeGrid SHALL display 3 columns of recipe cards
3. WHEN the desktop viewport is 1440px or wider, THE RecipeGrid SHALL display 4 columns of recipe cards
4. WHEN the viewport width changes, THE RecipeGrid SHALL dynamically adjust the number of columns without page reload

### Requirement 6: Desktop Frontend API Service Configuration

**User Story:** As a frontend developer, I want the API service to automatically include platform headers, so that all API requests are platform-aware.

#### Acceptance Criteria

1. WHEN the API service sends any request, THE service SHALL automatically include the X-Platform header with value "desktop"
2. WHEN the API service receives a response, THE service SHALL handle platform-specific error formatting
3. THE API service SHALL include X-Platform-Version header for API version tracking

### Requirement 7: Desktop Frontend Layout Components

**User Story:** As a desktop user, I want a consistent layout with header, sidebar, and footer, so that I can navigate the application easily.

#### Acceptance Criteria

1. WHEN the desktop application loads, THE MainLayout SHALL render a header with navigation links
2. WHEN the user is authenticated, THE Header SHALL display user information and logout option
3. WHEN the user is not authenticated, THE Header SHALL display login and register options
4. THE Sidebar SHALL provide navigation to key sections (Home, Recipes, Lessons, Profile)
5. THE Footer SHALL display copyright and helpful links

### Requirement 8: Desktop Frontend Recipe Display

**User Story:** As a desktop user, I want to view recipes in visually appealing cards with rich information, so that I can make informed decisions about what to cook.

#### Acceptance Criteria

1. WHEN a recipe card is displayed on desktop, THE card SHALL show the recipe image, title, cooking time, difficulty, and rating
2. WHEN the user hovers over a recipe card, THE card SHALL display a subtle elevation change for visual feedback
3. WHEN the user clicks a recipe card, THE application SHALL navigate to the recipe detail page

### Requirement 9: Desktop Frontend Recipe Detail Page

**User Story:** As a desktop user, I want to view detailed recipe information on a dedicated page, so that I can follow the cooking instructions.

#### Acceptance Criteria

1. WHEN the recipe detail page loads, THE page SHALL display the recipe image, title, description, ingredients, and step-by-step instructions
2. WHEN the user is authenticated, THE page SHALL allow the user to bookmark or favorite the recipe
3. WHEN the user is not authenticated, THE page SHALL hide bookmark and favorite buttons

### Requirement 10: Desktop Frontend Lesson Display

**User Story:** As a desktop user, I want to view lessons with progress tracking, so that I can track my learning progress.

#### Acceptance Criteria

1. WHEN the lesson list is displayed on desktop, THE list SHALL show each lesson's title, duration, level, and completion status
2. WHEN the user has started a lesson, THE lesson item SHALL display the user's progress percentage
3. WHEN a lesson is completed, THE lesson item SHALL display a visual indicator of completion

### Requirement 11: Platform Configuration

**User Story:** As a system administrator, I want to configure platform-specific settings, so that I can manage platform behavior centrally.

#### Acceptance Criteria

1. THE system SHALL provide a platform configuration file defining supported platforms and their features
2. THE platform configuration SHALL define which response fields are included for each platform
3. THE platform configuration SHALL be modifiable without code changes

### Requirement 12: Backward Compatibility

**User Story:** As an Android client developer, I want existing API behavior to remain unchanged, so that I don't need to update the mobile app.

#### Acceptance Criteria

1. WHEN a request does not include the X-Platform header AND User-Agent cannot be detected, THE system SHALL default to "desktop" platform
2. WHEN the Android app makes requests without the X-Platform header, THE API SHALL continue returning the existing response format (backward compatible)
3. THE existing Android application SHALL continue functioning without modifications

### Requirement 13: Error Handling by Platform

**User Story:** As a user, I want to receive platform-appropriate error messages, so that I can understand and recover from errors easily.

#### Acceptance Criteria

1. WHEN an error occurs on desktop, THE system SHALL display a user-friendly toast notification with the error message
2. WHEN an error response includes a recovery_action field, THE desktop UI SHALL display the recovery suggestion
3. WHEN an error occurs on Android, THE system SHALL use the existing Android error handling mechanism

### Requirement 14: Design System Compliance

**User Story:** As a UI designer, I want the desktop frontend to follow the Apple/Shopee/Tokopedia design principles, so that users have a consistent and modern experience.

#### Acceptance Criteria

1. THE desktop frontend SHALL use the defined color palette (primary blue #007AFF, secondary orange #FF9500, success green #34C759)
2. THE desktop frontend SHALL use the defined typography system with proper font sizing hierarchy
3. THE desktop frontend SHALL use generous whitespace with consistent spacing tokens
4. THE desktop frontend SHALL include subtle shadows following the iOS design language
5. THE desktop frontend SHALL use rounded corners (6px-16px radius) for a friendly appearance
6. THE desktop frontend SHALL include smooth transitions (150ms-350ms) for interactive elements