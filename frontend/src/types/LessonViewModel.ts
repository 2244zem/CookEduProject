/**
 * TypeScript interfaces for Lesson ViewModels
 * These interfaces match the backend API responses for desktop platform
 */

import { CategoryViewModel } from './RecipeViewModel';

/**
 * Lesson progress interface
 * Tracks user progress and quiz attempts for a lesson
 */
export interface LessonProgress {
  completed: boolean;
  attempts: number;
  best_score: number | null;
  last_attempt_at: string | null;
}

/**
 * Related lesson interface (simplified lesson for related lessons list)
 */
export interface RelatedLesson {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  level_label: string;
}

/**
 * Base Lesson view model interface
 * Contains fields common to all platforms
 */
export interface BaseLessonViewModel {
  id: number;
  title: string;
  slug: string;
  video_url: string | null;
  content: string;
  summary: string | null;
  thumbnail: string | null;
  duration: number;
  order_index: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  level_label: string;
  is_published: boolean;
  fallback_content: string | null;
  prerequisite_id: number | null;
  is_accessible: boolean;
  is_completed: boolean;
  category: CategoryViewModel;
  prerequisite: BaseLessonViewModel | null;
  created_at: string;
  updated_at: string;
}

/**
 * Desktop Lesson view model interface
 * Extends base lesson with desktop-specific fields
 */
export interface LessonViewModel extends BaseLessonViewModel {
  // Desktop-specific fields
  progress: LessonProgress;
  related_lessons: RelatedLesson[];
}

/**
 * API response wrapper for single lesson
 */
export interface LessonResponse {
  data: LessonViewModel;
  meta?: {
    platform: string;
    layout: string;
  };
}

/**
 * API response wrapper for lesson collection
 */
export interface LessonCollectionResponse {
  data: LessonViewModel[];
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
