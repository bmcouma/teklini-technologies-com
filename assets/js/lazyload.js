/**
 * TEKLINI TECHNOLOGIES - LAZY LOADING CONTROLLER
 * Optimized image and content lazy loading with intersection observer
 */

class LazyLoadController {
  constructor() {
    this.observers = new Map();
    this.loadedImages = new Set();
    this.config = {
      rootMargin: '50px 0px',
      threshold: 0.01,
      placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
      fadeInDuration: 300,
      errorImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmVlMmUyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2RjMjYyNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg=='
    };
  }

  init() {
    this.setupImageLazyLoading();
    this.setupContentLazyLoading();
    this.setupVideoLazyLoading();
    this.setupBackgroundImageLazyLoading();
    this.setupIframeLazyLoading();
  }

  setupImageLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    if (images.length === 0) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          imageObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.config.rootMargin,
      threshold: this.config.threshold
    });

    images.forEach(img => {
      this.setupImagePlaceholder(img);
      imageObserver.observe(img);
    });

    this.observers.set('images', imageObserver);
  }

  setupImagePlaceholder(img) {
    // Set placeholder
    if (!img.src) {
      img.src = this.config.placeholder;
    }

    // Add loading class
    img.classList.add('lazy-loading');

    // Set dimensions to prevent layout shift
    if (img.dataset.width && img.dataset.height) {
      img.style.aspectRatio = `${img.dataset.width} / ${img.dataset.height}`;
    }

    // Add error handling
    img.addEventListener('error', () => {
      this.handleImageError(img);
    });

    // Add load event
    img.addEventListener('load', () => {
      this.handleImageLoad(img);
    });
  }

  async loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    try {
      // Preload image
      await this.preloadImage(src);
      
      // Update src
      img.src = src;
      
      // Remove data attributes
      delete img.dataset.src;
      
      // Add loaded class
      img.classList.add('lazy-loaded');
      img.classList.remove('lazy-loading');
      
      // Add to loaded set
      this.loadedImages.add(src);
      
    } catch (error) {
      console.warn('Failed to load image:', src, error);
      this.handleImageError(img);
    }
  }

  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = src;
    });
  }

  handleImageLoad(img) {
    // Fade in effect
    img.style.opacity = '0';
    img.style.transition = `opacity ${this.config.fadeInDuration}ms ease-in-out`;
    
    requestAnimationFrame(() => {
      img.style.opacity = '1';
    });

    // Trigger custom event
    const event = new CustomEvent('lazyImageLoaded', {
      detail: { element: img, src: img.src }
    });
    img.dispatchEvent(event);
  }

  handleImageError(img) {
    img.src = this.config.errorImage;
    img.classList.add('lazy-error');
    img.classList.remove('lazy-loading');
    
    // Trigger custom event
    const event = new CustomEvent('lazyImageError', {
      detail: { element: img, src: img.dataset.src || img.src }
    });
    img.dispatchEvent(event);
  }

  setupContentLazyLoading() {
    const contentElements = document.querySelectorAll('[data-lazy-content]');
    if (contentElements.length === 0) return;

    const contentObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadContent(entry.target);
          contentObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.config.rootMargin,
      threshold: this.config.threshold
    });

    contentElements.forEach(element => {
      element.classList.add('lazy-content-loading');
      contentObserver.observe(element);
    });

    this.observers.set('content', contentObserver);
  }

  async loadContent(element) {
    const src = element.dataset.lazyContent;
    if (!src) return;

    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const content = await response.text();
      element.innerHTML = content;
      element.classList.add('lazy-content-loaded');
      element.classList.remove('lazy-content-loading');
      
      // Trigger custom event
      const event = new CustomEvent('lazyContentLoaded', {
        detail: { element, src }
      });
      element.dispatchEvent(event);
      
    } catch (error) {
      console.warn('Failed to load content:', src, error);
      this.handleContentError(element);
    }
  }

  handleContentError(element) {
    element.innerHTML = '<p class="text-muted">Failed to load content</p>';
    element.classList.add('lazy-content-error');
    element.classList.remove('lazy-content-loading');
  }

  setupVideoLazyLoading() {
    const videos = document.querySelectorAll('video[data-src]');
    if (videos.length === 0) return;

    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadVideo(entry.target);
          videoObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.config.rootMargin,
      threshold: this.config.threshold
    });

    videos.forEach(video => {
      video.classList.add('lazy-video-loading');
      videoObserver.observe(video);
    });

    this.observers.set('videos', videoObserver);
  }

  loadVideo(video) {
    const src = video.dataset.src;
    if (!src) return;

    video.src = src;
    delete video.dataset.src;
    
    video.classList.add('lazy-video-loaded');
    video.classList.remove('lazy-video-loading');

    // Load video when ready
    video.addEventListener('canplay', () => {
      video.classList.add('lazy-video-ready');
    });

    // Trigger custom event
    const event = new CustomEvent('lazyVideoLoaded', {
      detail: { element: video, src }
    });
    video.dispatchEvent(event);
  }

  setupBackgroundImageLazyLoading() {
    const elements = document.querySelectorAll('[data-bg-src]');
    if (elements.length === 0) return;

    const bgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadBackgroundImage(entry.target);
          bgObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.config.rootMargin,
      threshold: this.config.threshold
    });

    elements.forEach(element => {
      element.classList.add('lazy-bg-loading');
      bgObserver.observe(element);
    });

    this.observers.set('backgrounds', bgObserver);
  }

  async loadBackgroundImage(element) {
    const src = element.dataset.bgSrc;
    if (!src) return;

    try {
      await this.preloadImage(src);
      
      element.style.backgroundImage = `url(${src})`;
      element.classList.add('lazy-bg-loaded');
      element.classList.remove('lazy-bg-loading');
      
      // Fade in effect
      element.style.opacity = '0';
      element.style.transition = `opacity ${this.config.fadeInDuration}ms ease-in-out`;
      
      requestAnimationFrame(() => {
        element.style.opacity = '1';
      });
      
    } catch (error) {
      console.warn('Failed to load background image:', src, error);
      element.classList.add('lazy-bg-error');
      element.classList.remove('lazy-bg-loading');
    }
  }

  setupIframeLazyLoading() {
    const iframes = document.querySelectorAll('iframe[data-src]');
    if (iframes.length === 0) return;

    const iframeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadIframe(entry.target);
          iframeObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.config.rootMargin,
      threshold: this.config.threshold
    });

    iframes.forEach(iframe => {
      iframe.classList.add('lazy-iframe-loading');
      iframeObserver.observe(iframe);
    });

    this.observers.set('iframes', iframeObserver);
  }

  loadIframe(iframe) {
    const src = iframe.dataset.src;
    if (!src) return;

    iframe.src = src;
    delete iframe.dataset.src;
    
    iframe.classList.add('lazy-iframe-loaded');
    iframe.classList.remove('lazy-iframe-loading');

    // Trigger custom event
    const event = new CustomEvent('lazyIframeLoaded', {
      detail: { element: iframe, src }
    });
    iframe.dispatchEvent(event);
  }

  // Public API methods
  loadAll() {
    // Force load all lazy elements
    const allElements = document.querySelectorAll(
      'img[data-src], [data-lazy-content], video[data-src], [data-bg-src], iframe[data-src]'
    );
    
    allElements.forEach(element => {
      if (element.tagName === 'IMG') {
        this.loadImage(element);
      } else if (element.dataset.lazyContent) {
        this.loadContent(element);
      } else if (element.tagName === 'VIDEO') {
        this.loadVideo(element);
      } else if (element.dataset.bgSrc) {
        this.loadBackgroundImage(element);
      } else if (element.tagName === 'IFRAME') {
        this.loadIframe(element);
      }
    });
  }

  refresh() {
    // Refresh lazy loading for dynamically added content
    this.destroy();
    this.init();
  }

  // Advanced features
  createLazyImage(src, options = {}) {
    const img = document.createElement('img');
    img.dataset.src = src;
    img.alt = options.alt || '';
    img.className = options.className || '';
    
    if (options.width) img.dataset.width = options.width;
    if (options.height) img.dataset.height = options.height;
    
    this.setupImagePlaceholder(img);
    
    // Re-observe if observer exists
    const imageObserver = this.observers.get('images');
    if (imageObserver) {
      imageObserver.observe(img);
    }
    
    return img;
  }

  createLazyBackground(element, src) {
    element.dataset.bgSrc = src;
    element.classList.add('lazy-bg-loading');
    
    // Re-observe if observer exists
    const bgObserver = this.observers.get('backgrounds');
    if (bgObserver) {
      bgObserver.observe(element);
    }
    
    return element;
  }

  // Performance monitoring
  getLoadedCount() {
    return this.loadedImages.size;
  }

  getLoadingStats() {
    const stats = {
      total: 0,
      loaded: this.loadedImages.size,
      failed: 0,
      pending: 0
    };

    // Count total lazy elements
    const allElements = document.querySelectorAll(
      'img[data-src], [data-lazy-content], video[data-src], [data-bg-src], iframe[data-src]'
    );
    stats.total = allElements.length;

    // Count failed elements
    const failedElements = document.querySelectorAll('.lazy-error, .lazy-content-error, .lazy-bg-error');
    stats.failed = failedElements.length;

    // Calculate pending
    stats.pending = stats.total - stats.loaded - stats.failed;

    return stats;
  }

  // Cleanup method
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.loadedImages.clear();
  }
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const lazyLoadController = new LazyLoadController();
  lazyLoadController.init();
  
  // Make globally available
  window.TekliniLazyLoad = lazyLoadController;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LazyLoadController;
}
