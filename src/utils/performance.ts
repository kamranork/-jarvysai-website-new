// Performance utility functions for JarvysAI website

// Debounce function for performance optimization
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for performance optimization
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

// Check if device is low-end
export const isLowEndDevice = (): boolean => {
  if (typeof navigator !== 'undefined') {
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
    return hardwareConcurrency <= 2 || memory <= 2;
  }
  return false;
};

// Check if device supports modern features
export const supportsModernFeatures = (): boolean => {
  if (typeof window !== 'undefined') {
    return (
      'IntersectionObserver' in window &&
      'PerformanceObserver' in window &&
      'requestIdleCallback' in window
    );
  }
  return false;
};

// Lazy load images with intersection observer
export const lazyLoadImage = (
  img: HTMLImageElement,
  src: string,
  options: IntersectionObserverInit = {}
): void => {
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    img.src = src;
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        img.src = src;
        observer.unobserve(img);
      }
    });
  }, options);

  observer.observe(img);
};

// Optimize animations based on device capabilities
export const getOptimizedAnimationSettings = () => {
  const reducedMotion = prefersReducedMotion();
  const lowEnd = isLowEndDevice();
  const modernFeatures = supportsModernFeatures();

  if (reducedMotion) {
    return {
      enableAnimations: false,
      particleCount: 0,
      animationDuration: 0,
      enableParticles: false,
    };
  }

  if (lowEnd) {
    return {
      enableAnimations: true,
      particleCount: 20,
      animationDuration: 2000,
      enableParticles: true,
    };
  }

  if (modernFeatures) {
    return {
      enableAnimations: true,
      particleCount: 100, // Reduced from 150 for better performance
      animationDuration: 3000,
      enableParticles: true,
    };
  }

  return {
    enableAnimations: true,
    particleCount: 50,
    animationDuration: 2500,
    enableParticles: true,
  };
};

// Performance monitoring utilities
export const measurePerformance = (name: string, fn: () => void): void => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
  } else {
    fn();
  }
};

// Optimize scroll performance
export const optimizeScroll = (callback: () => void, delay: number = 16): (() => void) => {
  let ticking = false;
  
  return () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };
};

// Preload critical resources
export const preloadResource = (href: string, as: string): void => {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
};

// Optimize CSS animations
export const getOptimizedCSSVariables = () => {
  const settings = getOptimizedAnimationSettings();
  
  return {
    '--animation-duration': `${settings.animationDuration}ms`,
    '--particle-count': settings.particleCount.toString(),
    '--enable-animations': settings.enableAnimations ? '1' : '0',
    '--enable-particles': settings.enableParticles ? '1' : '0',
  };
};

// Apply performance optimizations to DOM
export const applyPerformanceOptimizations = (): void => {
  if (typeof document === 'undefined') return;

  // Apply CSS variables
  const root = document.documentElement;
  const cssVars = getOptimizedCSSVariables();
  
  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Optimize images
  const images = document.querySelectorAll('img[data-src]');
  images.forEach((img) => {
    if (img instanceof HTMLImageElement) {
      lazyLoadImage(img, img.dataset.src || '');
    }
  });

  // Optimize scroll events
  const scrollElements = document.querySelectorAll('[data-scroll-optimize]');
  scrollElements.forEach((element) => {
    element.addEventListener('scroll', optimizeScroll(() => {
      // Custom scroll logic here
    }));
  });
};

// Performance budget checker
export const checkPerformanceBudget = (metrics: {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
}): { passed: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (metrics.fcp > 2000) issues.push('FCP exceeds 2s budget');
  if (metrics.lcp > 2500) issues.push('LCP exceeds 2.5s budget');
  if (metrics.fid > 100) issues.push('FID exceeds 100ms budget');
  if (metrics.cls > 0.1) issues.push('CLS exceeds 0.1 budget');
  
  return {
    passed: issues.length === 0,
    issues,
  };
};

// NEW: Animation throttling for better performance
export const throttleAnimation = (callback: () => void, fps: number = 30): (() => void) => {
  let lastTime = 0;
  const interval = 1000 / fps;
  
  return (currentTime: number) => {
    if (currentTime - lastTime >= interval) {
      callback();
      lastTime = currentTime;
    }
  };
};

// NEW: Reduce animation complexity based on device performance
export const getReducedAnimationSettings = () => {
  const lowEnd = isLowEndDevice();
  const reducedMotion = prefersReducedMotion();
  
  if (reducedMotion || lowEnd) {
    return {
      enableParticles: false,
      enableComplexAnimations: false,
      enableHoverEffects: false,
      enableScrollAnimations: false,
      particleCount: 0,
      animationDuration: 0,
      backdropBlur: 'none',
      shadowComplexity: 'simple',
    };
  }
  
  return {
    enableParticles: true,
    enableComplexAnimations: true,
    enableHoverEffects: true,
    enableScrollAnimations: true,
    particleCount: 100,
    animationDuration: 3000,
    backdropBlur: '12px',
    shadowComplexity: 'complex',
  };
};

// NEW: Memory management for animations
export const cleanupAnimations = (): void => {
  // Stop all CSS animations
  const animatedElements = document.querySelectorAll('[class*="animate-"]');
  animatedElements.forEach((element) => {
    if (element instanceof HTMLElement) {
      element.style.animation = 'none';
    }
  });
  
  // Clear any running timeouts
  const highestTimeoutId = setTimeout(() => {}, 0);
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i);
  }
  
  // Clear any running intervals
  const highestIntervalId = setInterval(() => {}, 0);
  for (let i = 0; i < highestIntervalId; i++) {
    clearInterval(i);
  }
};

// Export all utilities
const performanceUtils = {
  debounce,
  throttle,
  prefersReducedMotion,
  isLowEndDevice,
  supportsModernFeatures,
  lazyLoadImage,
  getOptimizedAnimationSettings,
  measurePerformance,
  optimizeScroll,
  preloadResource,
  getOptimizedCSSVariables,
  applyPerformanceOptimizations,
  checkPerformanceBudget,
  throttleAnimation,
  getReducedAnimationSettings,
  cleanupAnimations,
};

export default performanceUtils;
