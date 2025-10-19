/**
 * TEKLINI TECHNOLOGIES - MAIN JAVASCRIPT
 * Core application logic and initialization
 */

// Application Configuration
const CONFIG = {
  animationDelay: 100,
  scrollOffset: 80,
  debounceDelay: 250,
  throttleDelay: 16,
  whatsappNumber: '254791832015',
  whatsappMessages: {
    general: 'Hi%20Bravin%2C%20I%27m%20interested%20in%20your%20IT%20and%20digital%20services.%20Can%20you%20share%20more%20details%3F',
    consultation: 'Hi%20Bravin%2C%20I%27d%20like%20to%20book%20a%20consultation%20with%20you.%20Please%20guide%20me%20on%20the%20next%20steps.',
    collaboration: 'Hello%20Bravin%2C%20I%27m%20interested%20in%20collaborating%20with%20you%20on%20a%20project.%20Let%27s%20discuss%20how%20we%20can%20work%20together.'
  }
};

// Application State
const AppState = {
  isDarkMode: false,
  isScrolled: false,
  currentSection: '',
  isMenuOpen: false,
  animations: new Set(),
  observers: new Map()
};

// Utility Functions
const Utils = {
  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Check if element is in viewport
  isInViewport(element, threshold = 0.1) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
      rect.top <= windowHeight * (1 - threshold) &&
      rect.bottom >= windowHeight * threshold &&
      rect.left <= windowWidth &&
      rect.right >= 0
    );
  },

  // Get element offset from top
  getOffsetTop(element) {
    let offsetTop = 0;
    do {
      if (!isNaN(element.offsetTop)) {
        offsetTop += element.offsetTop;
      }
    } while (element = element.offsetParent);
    return offsetTop;
  },

  // Generate WhatsApp URL
  getWhatsAppURL(messageType = 'general') {
    const message = CONFIG.whatsappMessages[messageType] || CONFIG.whatsappMessages.general;
    return `https://wa.me/${CONFIG.whatsappNumber}?text=${message}`;
  },

  // Format phone number
  formatPhoneNumber(phone) {
    return phone.replace(/\D/g, '');
  },

  // Validate email
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validate phone number
  validatePhone(phone) {
    const cleaned = this.formatPhoneNumber(phone);
    return cleaned.length >= 10 && cleaned.length <= 15;
  },

  // Generate unique ID
  generateId(prefix = 'id') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

// Animation Controller
class AnimationController {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    this.observers = new Map();
  }

  init() {
    this.createObserver('fade-in', '.fade-in');
    this.createObserver('slide-in-left', '.slide-in-left');
    this.createObserver('slide-in-right', '.slide-in-right');
    this.createObserver('scale-in', '.scale-in');
    this.createObserver('slide-up', '.slide-up');
    this.createObserver('zoom-in', '.zoom-in');
    this.createObserver('stagger-children', '.stagger-children');
  }

  createObserver(name, selector) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, this.observerOptions);

    elements.forEach(element => observer.observe(element));
    this.observers.set(name, observer);
  }

  animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target + (element.dataset.suffix || '');
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current) + (element.dataset.suffix || '');
      }
    }, 16);
  }
}

// Navigation Controller
class NavigationController {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.navToggle = document.querySelector('.navbar-toggler');
    this.navCollapse = document.querySelector('.navbar-collapse');
  }

  init() {
    this.setupScrollEffect();
    this.setupSmoothScrolling();
    this.setupMobileMenu();
    this.setupActiveNavigation();
  }

  setupScrollEffect() {
    let lastScrollTop = 0;
    
    const handleScroll = Utils.throttle(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Add/remove scrolled class
      if (scrollTop > 100) {
        this.navbar.classList.add('scrolled');
        AppState.isScrolled = true;
      } else {
        this.navbar.classList.remove('scrolled');
        AppState.isScrolled = false;
      }
      
      // Hide/show navbar on scroll
      if (scrollTop > lastScrollTop && scrollTop > 200) {
        this.navbar.style.transform = 'translateY(-100%)';
      } else {
        this.navbar.style.transform = 'translateY(0)';
      }
      
      lastScrollTop = scrollTop;
    }, CONFIG.throttleDelay);

    window.addEventListener('scroll', handleScroll);
  }

  setupSmoothScrolling() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href && href.startsWith('#')) {
          e.preventDefault();
          this.scrollToSection(href);
        }
      });
    });
  }

  scrollToSection(target) {
    const element = document.querySelector(target);
    if (!element) return;

    const offsetTop = Utils.getOffsetTop(element) - CONFIG.scrollOffset;
    
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });

    // Close mobile menu
    this.closeMobileMenu();
  }

  setupMobileMenu() {
    if (!this.navToggle || !this.navCollapse) return;

    this.navToggle.addEventListener('click', () => {
      this.toggleMobileMenu();
    });

    // Close menu when clicking on links
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.navbar.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
  }

  toggleMobileMenu() {
    AppState.isMenuOpen = !AppState.isMenuOpen;
    this.navCollapse.classList.toggle('show');
    this.navToggle.setAttribute('aria-expanded', AppState.isMenuOpen);
  }

  closeMobileMenu() {
    AppState.isMenuOpen = false;
    this.navCollapse.classList.remove('show');
    this.navToggle.setAttribute('aria-expanded', false);
  }

  setupActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    
    const handleScroll = Utils.throttle(() => {
      let current = '';
      
      sections.forEach(section => {
        const sectionTop = Utils.getOffsetTop(section);
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= (sectionTop - CONFIG.scrollOffset)) {
          current = section.getAttribute('id');
        }
      });
      
      this.updateActiveLink(current);
    }, CONFIG.throttleDelay);

    window.addEventListener('scroll', handleScroll);
  }

  updateActiveLink(current) {
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }
}

// Theme Controller
class ThemeController {
  constructor() {
    this.toggleButton = null;
    this.currentTheme = localStorage.getItem('theme') || 'light';
  }

  init() {
    this.createToggleButton();
    this.setTheme(this.currentTheme);
    this.setupToggleListener();
  }

  createToggleButton() {
    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'theme-toggle';
    this.toggleButton.setAttribute('aria-label', 'Toggle dark mode');
    this.toggleButton.innerHTML = '<i class="fas fa-moon"></i>';
    document.body.appendChild(this.toggleButton);
  }

  setupToggleListener() {
    this.toggleButton.addEventListener('click', () => {
      this.toggleTheme();
    });
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.updateToggleIcon(theme);
    AppState.isDarkMode = theme === 'dark';
  }

  updateToggleIcon(theme) {
    const icon = this.toggleButton.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }
}

// WhatsApp Controller
class WhatsAppController {
  constructor() {
    this.floatingButton = null;
  }

  init() {
    this.createFloatingButton();
    this.setupWhatsAppLinks();
  }

  createFloatingButton() {
    this.floatingButton = document.createElement('a');
    this.floatingButton.className = 'whatsapp-btn';
    this.floatingButton.href = Utils.getWhatsAppURL('general');
    this.floatingButton.target = '_blank';
    this.floatingButton.setAttribute('aria-label', 'Chat on WhatsApp');
    this.floatingButton.innerHTML = '<i class="fab fa-whatsapp"></i>';
    document.body.appendChild(this.floatingButton);
  }

  setupWhatsAppLinks() {
    const whatsappButtons = document.querySelectorAll('[data-whatsapp]');
    
    whatsappButtons.forEach(button => {
      const messageType = button.dataset.whatsapp;
      button.href = Utils.getWhatsAppURL(messageType);
      button.target = '_blank';
      
      button.addEventListener('click', (e) => {
        this.trackWhatsAppClick(messageType);
      });
    });
  }

  trackWhatsAppClick(messageType) {
    // Analytics tracking could be added here
    console.log(`WhatsApp clicked: ${messageType}`);
  }
}

// Form Controller
class FormController {
  constructor() {
    this.forms = document.querySelectorAll('form');
  }

  init() {
    this.setupFormValidation();
    this.setupFormSubmission();
  }

  setupFormValidation() {
    this.forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => this.clearFieldError(input));
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    
    let isValid = true;
    let errorMessage = '';
    
    if (required && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    } else if (value) {
      switch (type) {
        case 'email':
          if (!Utils.validateEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
          }
          break;
        case 'tel':
          if (!Utils.validatePhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
          }
          break;
      }
    }
    
    this.updateFieldState(field, isValid, errorMessage);
    return isValid;
  }

  updateFieldState(field, isValid, errorMessage) {
    if (isValid) {
      this.showFieldSuccess(field);
    } else {
      this.showFieldError(field, errorMessage);
    }
  }

  showFieldError(field, message) {
    field.classList.remove('is-valid');
    field.classList.add('is-invalid');
    
    let errorElement = field.parentNode.querySelector('.invalid-feedback');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'invalid-feedback';
      field.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
  }

  showFieldSuccess(field) {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    
    const errorElement = field.parentNode.querySelector('.invalid-feedback');
    if (errorElement) {
      errorElement.remove();
    }
  }

  clearFieldError(field) {
    field.classList.remove('is-invalid');
    const errorElement = field.parentNode.querySelector('.invalid-feedback');
    if (errorElement) {
      errorElement.remove();
    }
  }

  setupFormSubmission() {
    this.forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(form);
      });
    });
  }

  handleFormSubmit(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isFormValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });
    
    if (isFormValid) {
      this.submitForm(form);
    } else {
      this.showFormError(form, 'Please correct the errors above');
    }
  }

  submitForm(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
    
    // Simulate form submission
    setTimeout(() => {
      this.showFormSuccess(form);
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 2000);
  }

  showFormSuccess(form) {
    const successMessage = document.createElement('div');
    successMessage.className = 'alert alert-success mt-3';
    successMessage.innerHTML = '<i class="fas fa-check-circle me-2"></i>Thank you! Your message has been sent successfully.';
    
    form.appendChild(successMessage);
    
    setTimeout(() => {
      successMessage.remove();
    }, 5000);
  }

  showFormError(form, message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'alert alert-error mt-3';
    errorMessage.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>${message}`;
    
    form.appendChild(errorMessage);
    
    setTimeout(() => {
      errorMessage.remove();
    }, 5000);
  }
}

// Back to Top Controller
class BackToTopController {
  constructor() {
    this.button = null;
  }

  init() {
    this.createButton();
    this.setupScrollListener();
  }

  createButton() {
    this.button = document.createElement('a');
    this.button.className = 'back-to-top';
    this.button.setAttribute('aria-label', 'Back to top');
    this.button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    this.button.href = '#';
    document.body.appendChild(this.button);
    
    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      this.scrollToTop();
    });
  }

  setupScrollListener() {
    const handleScroll = Utils.throttle(() => {
      if (window.pageYOffset > 300) {
        this.button.classList.add('visible');
      } else {
        this.button.classList.remove('visible');
      }
    }, CONFIG.throttleDelay);

    window.addEventListener('scroll', handleScroll);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

// Main Application Class
class TekliniApp {
  constructor() {
    this.controllers = {
      animation: new AnimationController(),
      navigation: new NavigationController(),
      theme: new ThemeController(),
      whatsapp: new WhatsAppController(),
      form: new FormController(),
      backToTop: new BackToTopController()
    };
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeApp());
    } else {
      this.initializeApp();
    }
  }

  initializeApp() {
    try {
      // Initialize all controllers
      Object.values(this.controllers).forEach(controller => {
        if (controller.init) {
          controller.init();
        }
      });

      // Setup global event listeners
      this.setupGlobalEvents();

      // Initialize service worker
      this.initServiceWorker();

      console.log('Teklini Technologies app initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  setupGlobalEvents() {
    // Handle window resize
    window.addEventListener('resize', Utils.debounce(() => {
      // Handle responsive adjustments
      this.handleResize();
    }, CONFIG.debounceDelay));

    // Handle visibility change (for performance optimization)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAnimations();
      } else {
        this.resumeAnimations();
      }
    });
  }

  handleResize() {
    // Update any size-dependent calculations
    const isMobile = window.innerWidth < 768;
    document.body.classList.toggle('mobile', isMobile);
  }

  pauseAnimations() {
    // Pause non-essential animations for performance
    document.querySelectorAll('.animate-pulse, .animate-float').forEach(el => {
      el.style.animationPlayState = 'paused';
    });
  }

  resumeAnimations() {
    // Resume animations
    document.querySelectorAll('.animate-pulse, .animate-float').forEach(el => {
      el.style.animationPlayState = 'running';
    });
  }

  initServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }
}

// Initialize the application
const app = new TekliniApp();
app.init();

// Export for global access
window.TekliniApp = {
  app,
  Utils,
  CONFIG,
  AppState
};