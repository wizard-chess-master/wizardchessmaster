/**
 * Lazy Loader
 * Handles lazy loading of components, images, and resources
 */

import { lazy, LazyExoticComponent, ComponentType } from 'react';

export interface LazyLoadConfig {
  rootMargin?: string;
  threshold?: number | number[];
  fallback?: React.ReactNode;
}

class LazyLoader {
  private imageObserver: IntersectionObserver | null = null;
  private componentObserver: IntersectionObserver | null = null;
  private loadedImages: Set<string> = new Set();
  private loadedComponents: Set<string> = new Set();
  private preloadQueue: string[] = [];
  private isPreloading = false;

  constructor() {
    this.initializeObservers();
  }

  /**
   * Initialize Intersection Observers
   */
  private initializeObservers(): void {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported');
      return;
    }

    // Image observer with aggressive preloading
    this.imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target as HTMLImageElement);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    // Component observer with less aggressive loading
    this.componentObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadComponent(entry.target as HTMLElement);
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.1
      }
    );
  }

  /**
   * Load an image
   */
  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (!src) return;
    
    // Check if already loaded
    if (this.loadedImages.has(src)) {
      img.src = src;
      if (srcset) img.srcset = srcset;
      this.imageObserver?.unobserve(img);
      return;
    }

    // Create a new image to preload
    const tempImg = new Image();
    
    tempImg.onload = () => {
      img.src = src;
      if (srcset) img.srcset = srcset;
      img.classList.add('loaded');
      this.loadedImages.add(src);
      this.imageObserver?.unobserve(img);
      
      // Trigger fade-in animation
      img.style.opacity = '0';
      requestAnimationFrame(() => {
        img.style.transition = 'opacity 0.3s';
        img.style.opacity = '1';
      });
    };
    
    tempImg.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      img.classList.add('error');
      this.imageObserver?.unobserve(img);
    };
    
    tempImg.src = src;
  }

  /**
   * Load a component
   */
  private loadComponent(element: HTMLElement): void {
    const componentId = element.dataset.componentId;
    
    if (!componentId || this.loadedComponents.has(componentId)) {
      return;
    }
    
    // Trigger component load event
    const event = new CustomEvent('lazyload:component', {
      detail: { componentId }
    });
    element.dispatchEvent(event);
    
    this.loadedComponents.add(componentId);
    this.componentObserver?.unobserve(element);
  }

  /**
   * Observe images for lazy loading
   */
  observeImages(selector: string = 'img[data-src]'): void {
    if (!this.imageObserver) return;
    
    const images = document.querySelectorAll(selector);
    images.forEach(img => {
      this.imageObserver!.observe(img);
    });
    
    console.log(`👁️ Observing ${images.length} images for lazy loading`);
  }

  /**
   * Observe components for lazy loading
   */
  observeComponents(selector: string = '[data-lazy-component]'): void {
    if (!this.componentObserver) return;
    
    const components = document.querySelectorAll(selector);
    components.forEach(component => {
      this.componentObserver!.observe(component);
    });
    
    console.log(`👁️ Observing ${components.length} components for lazy loading`);
  }

  /**
   * Preload critical images
   */
  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        if (this.loadedImages.has(url)) {
          resolve();
          return;
        }
        
        const img = new Image();
        img.onload = () => {
          this.loadedImages.add(url);
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to preload: ${url}`);
          reject(new Error(`Failed to preload: ${url}`));
        };
        img.src = url;
      });
    });
    
    try {
      await Promise.all(promises);
      console.log(`✅ Preloaded ${urls.length} images`);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }

  /**
   * Create a lazy-loaded React component
   */
  createLazyComponent<T extends ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>,
    options?: {
      preload?: boolean;
      delay?: number;
    }
  ): LazyExoticComponent<T> {
    const { preload = false, delay = 0 } = options || {};
    
    // Add artificial delay if specified (for testing)
    const delayedImport = delay > 0
      ? () => new Promise<{ default: T }>(resolve => {
          setTimeout(() => {
            importFunc().then(resolve);
          }, delay);
        })
      : importFunc;
    
    const LazyComponent = lazy(delayedImport);
    
    // Preload if requested
    if (preload) {
      importFunc();
    }
    
    return LazyComponent;
  }

  /**
   * Load images in viewport immediately
   */
  loadVisibleImages(): void {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      const rect = img.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        this.loadImage(img as HTMLImageElement);
      }
    });
  }

  /**
   * Queue images for background preloading
   */
  queuePreload(urls: string[]): void {
    this.preloadQueue.push(...urls);
    if (!this.isPreloading) {
      this.processPreloadQueue();
    }
  }

  /**
   * Process preload queue
   */
  private async processPreloadQueue(): Promise<void> {
    if (this.preloadQueue.length === 0) {
      this.isPreloading = false;
      return;
    }
    
    this.isPreloading = true;
    
    // Use requestIdleCallback if available
    const processNext = () => {
      if (this.preloadQueue.length === 0) {
        this.isPreloading = false;
        return;
      }
      
      const url = this.preloadQueue.shift()!;
      if (!this.loadedImages.has(url)) {
        const img = new Image();
        img.onload = () => {
          this.loadedImages.add(url);
          if ('requestIdleCallback' in window) {
            requestIdleCallback(processNext);
          } else {
            setTimeout(processNext, 100);
          }
        };
        img.onerror = () => {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(processNext);
          } else {
            setTimeout(processNext, 100);
          }
        };
        img.src = url;
      } else {
        processNext();
      }
    };
    
    processNext();
  }

  /**
   * Get loading statistics
   */
  getStats(): {
    loadedImages: number;
    loadedComponents: number;
    queuedImages: number;
  } {
    return {
      loadedImages: this.loadedImages.size,
      loadedComponents: this.loadedComponents.size,
      queuedImages: this.preloadQueue.length
    };
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.loadedImages.clear();
    this.loadedComponents.clear();
    this.preloadQueue = [];
    console.log('🗑️ Lazy loader cache cleared');
  }

  /**
   * Dispose of the lazy loader
   */
  dispose(): void {
    this.imageObserver?.disconnect();
    this.componentObserver?.disconnect();
    this.clear();
    console.log('🔌 Lazy loader disposed');
  }
}

// Export singleton instance
export const lazyLoader = new LazyLoader();