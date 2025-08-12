/**
 * Lazy Loading Utilities
 * Implements dynamic imports and image lazy loading for performance
 */

import { logger } from './utils/clientLogger';

/**
 * Lazy load images with Intersection Observer
 */
export function setupImageLazyLoading() {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers that don't support IntersectionObserver
    loadAllImages();
    return;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          // Create new image to preload
          const tempImg = new Image();
          tempImg.onload = () => {
            img.src = src;
            img.classList.add('lazy-loaded');
            img.removeAttribute('data-src');
            logger.debug('Performance', 'Lazy loaded image', { src });
          };
          tempImg.onerror = () => {
            logger.error('Performance', 'Failed to lazy load image', new Error(src));
          };
          tempImg.src = src;
        }
        
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px', // Start loading 50px before the image enters viewport
    threshold: 0.01
  });

  // Observe all images with data-src attribute
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach(img => imageObserver.observe(img));
  
  logger.info('Performance', 'Image lazy loading initialized', { 
    imageCount: lazyImages.length 
  });
}

/**
 * Fallback to load all images immediately
 */
function loadAllImages() {
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach(img => {
    const imgElement = img as HTMLImageElement;
    if (imgElement.dataset.src) {
      imgElement.src = imgElement.dataset.src;
      imgElement.removeAttribute('data-src');
    }
  });
}

/**
 * Component lazy loading with React.lazy
 */
export const lazyLoadComponent = (
  importFunc: () => Promise<any>,
  componentName: string
) => {
  return async () => {
    const startTime = performance.now();
    
    try {
      const module = await importFunc();
      const loadTime = performance.now() - startTime;
      
      logger.debug('Performance', 'Component lazy loaded', {
        component: componentName,
        loadTime: `${loadTime.toFixed(2)}ms`
      });
      
      return module;
    } catch (error) {
      logger.error('Performance', `Failed to lazy load ${componentName}`, error as Error);
      throw error;
    }
  };
};

/**
 * Route-based code splitting setup
 * Note: Components will be lazy loaded when created
 */
export const routeConfig = {
  // Route paths that can benefit from lazy loading
  // Components will be imported dynamically when needed
  '/game': 'Game',
  '/campaign': 'Campaign',
  '/leaderboard': 'Leaderboard',
  '/tournament': 'Tournament',
  '/blog': 'Blog',
  '/strategy-guide': 'StrategyGuide',
  '/ai-training': 'AITraining'
};

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  const criticalResources = [
    '/assets/images/board.png',
    '/assets/images/pieces-sprite.png',
    '/assets/sound-fx/move_clack.mp3',
    '/assets/sound-fx/capture_zap.mp3'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    if (resource.endsWith('.mp3')) {
      link.as = 'audio';
    } else if (resource.endsWith('.png') || resource.endsWith('.jpg')) {
      link.as = 'image';
    } else {
      link.as = 'fetch';
    }
    
    link.href = resource;
    document.head.appendChild(link);
  });
  
  logger.info('Performance', 'Critical resources preloaded', {
    count: criticalResources.length
  });
}

/**
 * Initialize all lazy loading features
 */
export function initializeLazyLoading() {
  // Setup image lazy loading
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupImageLazyLoading);
  } else {
    setupImageLazyLoading();
  }
  
  // Preload critical resources
  preloadCriticalResources();
  
  logger.info('Performance', 'Lazy loading system initialized');
}