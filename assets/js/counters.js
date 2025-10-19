/**
 * TEKLINI TECHNOLOGIES - ANIMATED COUNTERS
 * Smooth number animations and statistics display
 */

class CounterController {
  constructor() {
    this.counters = new Map();
    this.observers = new Map();
    this.animationOptions = {
      duration: 2000,
      easing: 'easeOutCubic',
      delay: 100
    };
  }

  init() {
    this.setupCounters();
    this.setupIntersectionObserver();
  }

  setupCounters() {
    const counterElements = document.querySelectorAll('[data-count]');
    
    counterElements.forEach((element, index) => {
      const config = this.parseCounterConfig(element);
      this.counters.set(element, {
        ...config,
        element,
        index,
        isAnimated: false,
        currentValue: 0
      });
    });
  }

  parseCounterConfig(element) {
    const target = parseInt(element.dataset.count) || 0;
    const suffix = element.dataset.suffix || '';
    const prefix = element.dataset.prefix || '';
    const duration = parseInt(element.dataset.duration) || this.animationOptions.duration;
    const delay = parseInt(element.dataset.delay) || this.animationOptions.delay;
    const format = element.dataset.format || 'number'; // number, currency, percentage
    const locale = element.dataset.locale || 'en-US';
    const currency = element.dataset.currency || 'USD';
    
    return {
      target,
      suffix,
      prefix,
      duration,
      delay,
      format,
      locale,
      currency,
      startValue: 0
    };
  }

  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = this.counters.get(entry.target);
          if (counter && !counter.isAnimated) {
            this.animateCounter(counter);
          }
        }
      });
    }, observerOptions);

    // Observe all counter elements
    this.counters.forEach((counter) => {
      observer.observe(counter.element);
    });

    this.observers.set('main', observer);
  }

  animateCounter(counter) {
    counter.isAnimated = true;
    
    // Add delay if specified
    setTimeout(() => {
      this.startCounterAnimation(counter);
    }, counter.delay);
  }

  startCounterAnimation(counter) {
    const startTime = performance.now();
    const startValue = counter.startValue;
    const endValue = counter.target;
    const duration = counter.duration;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apply easing function
      const easedProgress = this.easingFunctions[this.animationOptions.easing](progress);
      
      // Calculate current value
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      
      // Update display
      this.updateCounterDisplay(counter, currentValue);
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        this.onCounterComplete(counter);
      }
    };

    requestAnimationFrame(animate);
  }

  updateCounterDisplay(counter, value) {
    const formattedValue = this.formatValue(value, counter);
    counter.element.textContent = counter.prefix + formattedValue + counter.suffix;
    counter.currentValue = value;
  }

  formatValue(value, counter) {
    switch (counter.format) {
      case 'currency':
        return new Intl.NumberFormat(counter.locale, {
          style: 'currency',
          currency: counter.currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      
      case 'percentage':
        return new Intl.NumberFormat(counter.locale, {
          style: 'percent',
          minimumFractionDigits: 0,
          maximumFractionDigits: 1
        }).format(value / 100);
      
      case 'decimal':
        return new Intl.NumberFormat(counter.locale, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2
        }).format(value);
      
      case 'compact':
        return new Intl.NumberFormat(counter.locale, {
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(value);
      
      default: // number
        return new Intl.NumberFormat(counter.locale).format(Math.floor(value));
    }
  }

  onCounterComplete(counter) {
    // Ensure final value is exact
    this.updateCounterDisplay(counter, counter.target);
    
    // Add completion class
    counter.element.classList.add('counter-complete');
    
    // Trigger custom event
    const event = new CustomEvent('counterComplete', {
      detail: {
        element: counter.element,
        finalValue: counter.target,
        config: counter
      }
    });
    
    counter.element.dispatchEvent(event);
  }

  // Easing functions
  easingFunctions = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => 1 - (--t) * t * t * t,
    easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    easeInQuint: (t) => t * t * t * t * t,
    easeOutQuint: (t) => 1 + (--t) * t * t * t * t,
    easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
    easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
    easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
    easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeInOutExpo: (t) => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
      return (2 - Math.pow(2, -20 * t + 10)) / 2;
    },
    easeInCirc: (t) => 1 - Math.sqrt(1 - t * t),
    easeOutCirc: (t) => Math.sqrt(1 - (--t) * t),
    easeInOutCirc: (t) => {
      if (t < 0.5) return (1 - Math.sqrt(1 - 4 * t * t)) / 2;
      return (Math.sqrt(1 - 4 * (t - 1) * (t - 1)) + 1) / 2;
    },
    easeInBack: (t) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return c3 * t * t * t - c1 * t * t;
    },
    easeOutBack: (t) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    easeInOutBack: (t) => {
      const c1 = 1.70158;
      const c2 = c1 * 1.525;
      if (t < 0.5) {
        return (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2;
      }
      return (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    }
  };

  // Public API methods
  animateCounterById(id) {
    const element = document.getElementById(id);
    if (element && this.counters.has(element)) {
      const counter = this.counters.get(element);
      if (!counter.isAnimated) {
        this.animateCounter(counter);
      }
    }
  }

  resetCounter(id) {
    const element = document.getElementById(id);
    if (element && this.counters.has(element)) {
      const counter = this.counters.get(element);
      counter.isAnimated = false;
      counter.currentValue = counter.startValue;
      this.updateCounterDisplay(counter, counter.startValue);
      element.classList.remove('counter-complete');
    }
  }

  setCounterValue(id, value) {
    const element = document.getElementById(id);
    if (element && this.counters.has(element)) {
      const counter = this.counters.get(element);
      counter.target = value;
      if (counter.isAnimated) {
        this.animateCounter(counter);
      }
    }
  }

  // Advanced counter features
  createDynamicCounter(selector, options = {}) {
    const element = document.querySelector(selector);
    if (!element) return null;

    const config = {
      target: options.target || 0,
      duration: options.duration || 2000,
      suffix: options.suffix || '',
      prefix: options.prefix || '',
      format: options.format || 'number',
      easing: options.easing || 'easeOutCubic',
      onComplete: options.onComplete || null
    };

    // Add data attributes
    Object.entries(config).forEach(([key, value]) => {
      if (key !== 'onComplete') {
        element.dataset[key] = value;
      }
    });

    // Re-setup counter
    const counterConfig = this.parseCounterConfig(element);
    this.counters.set(element, {
      ...counterConfig,
      element,
      index: this.counters.size,
      isAnimated: false,
      currentValue: 0
    });

    // Add completion callback
    if (config.onComplete) {
      element.addEventListener('counterComplete', config.onComplete);
    }

    return element;
  }

  // Staggered counter animation
  animateCountersStaggered(selector, staggerDelay = 200) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((element, index) => {
      setTimeout(() => {
        this.animateCounterById(element.id);
      }, index * staggerDelay);
    });
  }

  // Counter with progress bar
  createProgressCounter(selector, options = {}) {
    const element = document.querySelector(selector);
    if (!element) return null;

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.width = '0%';
    
    element.parentNode.insertBefore(progressBar, element);

    const counter = this.createDynamicCounter(selector, {
      ...options,
      onComplete: () => {
        progressBar.style.width = '100%';
        if (options.onComplete) options.onComplete();
      }
    });

    return counter;
  }

  // Cleanup method
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.counters.clear();
  }
}

// Initialize counter controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const counterController = new CounterController();
  counterController.init();
  
  // Make globally available
  window.TekliniCounters = counterController;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CounterController;
}
