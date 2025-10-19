/**
 * TEKLINI TECHNOLOGIES - THEME TOGGLE CONTROLLER
 * Dark mode and theme management system
 */

class ThemeToggleController {
  constructor() {
    this.toggleButton = null;
    this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
    this.themes = {
      light: {
        name: 'Light',
        icon: 'fas fa-moon',
        color: '#1f2937'
      },
      dark: {
        name: 'Dark',
        icon: 'fas fa-sun',
        color: '#f9fafb'
      }
    };
    
    this.callbacks = {
      onChange: [],
      onLoad: []
    };
  }

  init() {
    this.createToggleButton();
    this.setTheme(this.currentTheme);
    this.setupEventListeners();
    this.setupSystemThemeListener();
    this.triggerCallbacks('onLoad');
  }

  createToggleButton() {
    // Create toggle button
    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'theme-toggle';
    this.toggleButton.setAttribute('aria-label', 'Toggle theme');
    this.toggleButton.setAttribute('title', 'Toggle dark mode');
    this.toggleButton.innerHTML = this.getToggleIcon();
    
    // Add to DOM
    document.body.appendChild(this.toggleButton);
  }

  getToggleIcon() {
    const theme = this.themes[this.currentTheme];
    return `<i class="${theme.icon}"></i>`;
  }

  setupEventListeners() {
    // Toggle button click
    this.toggleButton.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Keyboard accessibility
    this.toggleButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleTheme();
      }
    });

    // Prevent focus on mouse interaction
    this.toggleButton.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });
  }

  setupSystemThemeListener() {
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        const storedTheme = this.getStoredTheme();
        if (!storedTheme) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  getStoredTheme() {
    try {
      return localStorage.getItem('teklini-theme');
    } catch (error) {
      console.warn('Could not access localStorage:', error);
      return null;
    }
  }

  setStoredTheme(theme) {
    try {
      localStorage.setItem('teklini-theme', theme);
    } catch (error) {
      console.warn('Could not save theme to localStorage:', error);
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    if (!this.themes[theme]) {
      console.warn(`Invalid theme: ${theme}`);
      return;
    }

    this.currentTheme = theme;
    
    // Update DOM
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    
    // Update toggle button
    if (this.toggleButton) {
      this.toggleButton.innerHTML = this.getToggleIcon();
      this.toggleButton.setAttribute('aria-label', `Switch to ${this.themes[theme === 'light' ? 'dark' : 'light'].name.toLowerCase()} theme`);
    }
    
    // Store preference
    this.setStoredTheme(theme);
    
    // Update meta theme-color
    this.updateMetaThemeColor(theme);
    
    // Trigger callbacks
    this.triggerCallbacks('onChange', theme);
    
    // Announce theme change to screen readers
    this.announceThemeChange(theme);
  }

  updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.content = this.themes[theme].color;
  }

  announceThemeChange(theme) {
    // Create announcement for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Switched to ${this.themes[theme].name.toLowerCase()} theme`;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  triggerCallbacks(type, theme = null) {
    this.callbacks[type].forEach(callback => {
      try {
        callback(theme || this.currentTheme);
      } catch (error) {
        console.error('Theme callback error:', error);
      }
    });
  }

  // Public API methods
  getCurrentTheme() {
    return this.currentTheme;
  }

  isDarkMode() {
    return this.currentTheme === 'dark';
  }

  isLightMode() {
    return this.currentTheme === 'light';
  }

  onThemeChange(callback) {
    if (typeof callback === 'function') {
      this.callbacks.onChange.push(callback);
    }
  }

  onThemeLoad(callback) {
    if (typeof callback === 'function') {
      this.callbacks.onLoad.push(callback);
    }
  }

  // Advanced theme features
  setCustomTheme(themeConfig) {
    if (!themeConfig || !themeConfig.name) {
      console.warn('Invalid custom theme configuration');
      return;
    }

    // Add custom theme
    this.themes[themeConfig.name] = {
      name: themeConfig.displayName || themeConfig.name,
      icon: themeConfig.icon || 'fas fa-palette',
      color: themeConfig.color || '#1f2937',
      variables: themeConfig.variables || {}
    };

    // Apply custom CSS variables
    if (themeConfig.variables) {
      const root = document.documentElement;
      Object.entries(themeConfig.variables).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }
  }

  // Theme animation utilities
  animateThemeTransition() {
    const duration = 300; // milliseconds
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apply transition effect
      document.body.style.transition = `all ${duration}ms ease-in-out`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Clean up
        setTimeout(() => {
          document.body.style.transition = '';
        }, duration);
      }
    };
    
    requestAnimationFrame(animate);
  }

  // Theme persistence with session handling
  setThemeWithSession(theme) {
    this.setTheme(theme);
    
    // Store in session storage for multi-tab consistency
    try {
      sessionStorage.setItem('teklini-theme-session', theme);
    } catch (error) {
      console.warn('Could not save theme to sessionStorage:', error);
    }
  }

  syncThemeAcrossTabs() {
    // Listen for storage changes (multi-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === 'teklini-theme' && e.newValue !== this.currentTheme) {
        this.setTheme(e.newValue);
      }
    });

    // Listen for session storage changes
    window.addEventListener('storage', (e) => {
      if (e.key === 'teklini-theme-session' && e.newValue !== this.currentTheme) {
        this.setTheme(e.newValue);
      }
    });
  }

  // Theme analytics
  trackThemeUsage(theme) {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'theme_change', {
        event_category: 'User Preference',
        event_label: theme,
        value: theme === 'dark' ? 1 : 0
      });
    }

    // Custom analytics
    console.log(`Theme changed to: ${theme}`);
  }

  // Theme utilities
  getThemeContrast() {
    // Calculate contrast ratio for accessibility
    const lightBg = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary');
    const darkBg = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary');
    
    // Simple contrast check (would need proper color library for accurate calculation)
    return this.currentTheme === 'dark' ? 'high' : 'normal';
  }

  // Cleanup method
  destroy() {
    if (this.toggleButton) {
      this.toggleButton.remove();
    }
    
    // Remove event listeners
    window.removeEventListener('storage', this.handleStorageChange);
    
    // Clear callbacks
    this.callbacks = { onChange: [], onLoad: [] };
  }
}

// Enhanced theme controller with additional features
class EnhancedThemeController extends ThemeToggleController {
  constructor() {
    super();
    this.autoSwitchTime = null;
    this.timeBasedThemes = {
      morning: 'light',
      afternoon: 'light',
      evening: 'dark',
      night: 'dark'
    };
  }

  init() {
    super.init();
    this.setupTimeBasedSwitching();
    this.setupKeyboardShortcuts();
    this.syncThemeAcrossTabs();
  }

  setupTimeBasedSwitching() {
    // Auto-switch theme based on time of day
    const now = new Date();
    const hour = now.getHours();
    
    let timePeriod;
    if (hour >= 6 && hour < 12) {
      timePeriod = 'morning';
    } else if (hour >= 12 && hour < 18) {
      timePeriod = 'afternoon';
    } else if (hour >= 18 && hour < 22) {
      timePeriod = 'evening';
    } else {
      timePeriod = 'night';
    }

    const suggestedTheme = this.timeBasedThemes[timePeriod];
    
    // Only auto-switch if user hasn't set a preference
    if (!this.getStoredTheme()) {
      this.setTheme(suggestedTheme);
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt + T to toggle theme
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        this.toggleTheme();
      }
      
      // Alt + D for dark mode
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        this.setTheme('dark');
      }
      
      // Alt + L for light mode
      if (e.altKey && e.key === 'l') {
        e.preventDefault();
        this.setTheme('light');
      }
    });
  }

  // Time-based theme scheduling
  scheduleThemeSwitch(time, theme) {
    const now = new Date();
    const switchTime = new Date(time);
    
    if (switchTime > now) {
      const delay = switchTime.getTime() - now.getTime();
      
      this.autoSwitchTime = setTimeout(() => {
        this.setTheme(theme);
        this.autoSwitchTime = null;
      }, delay);
    }
  }

  cancelScheduledSwitch() {
    if (this.autoSwitchTime) {
      clearTimeout(this.autoSwitchTime);
      this.autoSwitchTime = null;
    }
  }
}

// Initialize theme controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const themeController = new EnhancedThemeController();
  themeController.init();
  
  // Set up theme change tracking
  themeController.onThemeChange((theme) => {
    themeController.trackThemeUsage(theme);
  });
  
  // Make globally available
  window.TekliniTheme = themeController;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeToggleController, EnhancedThemeController };
}
