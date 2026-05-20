import { useState, useEffect } from 'react';

/**
 * Breakpoint type definition
 * - mobile: < 768px
 * - tablet: 768px - 1024px
 * - desktop: 1024px - 1440px
 * - wide: >= 1440px
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

/**
 * Custom hook to detect and track viewport width changes
 * Returns the current breakpoint based on viewport width
 * 
 * Breakpoint ranges:
 * - mobile: < 768px
 * - tablet: 768px - 1024px
 * - desktop: 1024px - 1440px
 * - wide: >= 1440px
 * 
 * @returns {Breakpoint} Current breakpoint
 * 
 * @example
 * ```tsx
 * const breakpoint = useBreakpoint();
 * 
 * if (breakpoint === 'mobile') {
 *   // Render mobile layout
 * }
 * ```
 */
export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    // Initialize with current viewport width
    return getBreakpointFromWidth(window.innerWidth);
  });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const newBreakpoint = getBreakpointFromWidth(width);
      setBreakpoint(newBreakpoint);
    };

    // Add resize listener
    window.addEventListener('resize', updateBreakpoint);

    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};

/**
 * Helper function to determine breakpoint from viewport width
 * @param width - Viewport width in pixels
 * @returns {Breakpoint} Corresponding breakpoint
 */
function getBreakpointFromWidth(width: number): Breakpoint {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1440) return 'desktop';
  return 'wide';
}

/**
 * Hook to check if current viewport matches a specific breakpoint
 * @param targetBreakpoint - The breakpoint to check against
 * @returns {boolean} True if current breakpoint matches target
 * 
 * @example
 * ```tsx
 * const isMobile = useBreakpointMatch('mobile');
 * const isDesktopOrWider = useBreakpointMatch(['desktop', 'wide']);
 * ```
 */
export const useBreakpointMatch = (
  targetBreakpoint: Breakpoint | Breakpoint[]
): boolean => {
  const currentBreakpoint = useBreakpoint();

  if (Array.isArray(targetBreakpoint)) {
    return targetBreakpoint.includes(currentBreakpoint);
  }

  return currentBreakpoint === targetBreakpoint;
};

/**
 * Hook to get viewport dimensions
 * @returns {{ width: number, height: number }} Current viewport dimensions
 * 
 * @example
 * ```tsx
 * const { width, height } = useViewportSize();
 * ```
 */
export const useViewportSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
};
