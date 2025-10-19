/**
 * TEKLINI TECHNOLOGIES - CONTACT FORM HANDLER
 * Enhanced contact form functionality with validation and WhatsApp integration
 */

class ContactFormController {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.serviceSelect = document.querySelector('#service');
    this.whatsappButtons = document.querySelectorAll('[data-whatsapp]');
    this.isSubmitting = false;
    
    // WhatsApp message templates
    this.whatsappMessages = {
      general: 'Hi%20Bravin%2C%20I%27m%20interested%20in%20your%20IT%20and%20digital%20services.%20Can%20you%20share%20more%20details%3F',
      'web-development': 'Hi%20Bravin%2C%20I%27m%20interested%20in%20web%20development%20services.%20Can%20you%20provide%20more%20details%20and%20pricing%3F',
      'mobile-app': 'Hi%20Bravin%2C%20I%27d%20like%20to%20discuss%20mobile%20app%20development%20for%20my%20business.%20Please%20share%20more%20information.',
      'ai-solutions': 'Hi%20Bravin%2C%20I%27m%20interested%20in%20AI%20and%20automation%20solutions.%20Can%20you%20guide%20me%20on%20the%20possibilities%3F',
      'digital-marketing': 'Hi%20Bravin%2C%20I%27d%20like%20to%20improve%20my%20digital%20marketing%20strategy.%20Can%20we%20discuss%20your%20services%3F',
      'it-support': 'Hi%20Bravin%2C%20I%27m%20looking%20for%20IT%20support%20services.%20Can%20you%20tell%20me%20more%20about%20your%20offerings%3F',
      consultation: 'Hi%20Bravin%2C%20I%27d%20like%20to%20book%20a%20consultation%20with%20you.%20Please%20guide%20me%20on%20the%20next%20steps.',
      collaboration: 'Hello%20Bravin%2C%20I%27m%20interested%20in%20collaborating%20with%20you%20on%20a%20project.%20Let%27s%20discuss%20how%20we%20can%20work%20together.'
    };
  }

  init() {
    if (!this.form) return;
    
    this.setupFormValidation();
    this.setupFormSubmission();
    this.setupWhatsAppIntegration();
    this.setupServiceSelection();
    this.setupFieldDependencies();
    this.setupAutoSave();
  }

  setupFormValidation() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      // Real-time validation on blur
      input.addEventListener('blur', () => this.validateField(input));
      
      // Clear errors on input
      input.addEventListener('input', () => this.clearFieldError(input));
      
      // Add floating label effect
      this.setupFloatingLabel(input);
    });
  }

  setupFloatingLabel(input) {
    const label = input.previousElementSibling;
    if (!label || label.tagName !== 'LABEL') return;

    const checkValue = () => {
      if (input.value.trim()) {
        label.classList.add('floating');
      } else {
        label.classList.remove('floating');
      }
    };

    input.addEventListener('focus', () => label.classList.add('floating'));
    input.addEventListener('blur', () => {
      if (!input.value.trim()) {
        label.classList.remove('floating');
      }
    });

    // Check initial value
    checkValue();
  }

  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    const name = field.name || field.id;

    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (required && !value) {
      isValid = false;
      errorMessage = `${this.getFieldLabel(field)} is required`;
    } else if (value) {
      // Type-specific validation
      switch (type) {
        case 'email':
          if (!this.validateEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
          }
          break;
        case 'tel':
          if (!this.validatePhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number (e.g., +254 700 000 000)';
          }
          break;
        case 'url':
          if (!this.validateURL(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid URL (e.g., https://example.com)';
          }
          break;
      }

      // Custom validation based on field name
      switch (name) {
        case 'firstName':
        case 'lastName':
          if (value.length < 2) {
            isValid = false;
            errorMessage = 'Name must be at least 2 characters long';
          }
          break;
        case 'message':
          if (value.length < 10) {
            isValid = false;
            errorMessage = 'Message must be at least 10 characters long';
          }
          break;
        case 'company':
          if (value.length < 2 && value.length > 0) {
            isValid = false;
            errorMessage = 'Company name must be at least 2 characters long';
          }
          break;
      }
    }

    this.updateFieldState(field, isValid, errorMessage);
    return isValid;
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  getFieldLabel(field) {
    const label = field.previousElementSibling;
    if (label && label.tagName === 'LABEL') {
      return label.textContent.replace('*', '').trim();
    }
    return field.name || field.id || 'Field';
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
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });
  }

  handleFormSubmit() {
    if (this.isSubmitting) return;

    const inputs = this.form.querySelectorAll('input[required], textarea[required], select[required]');
    let isFormValid = true;
    
    // Validate all required fields
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });

    if (isFormValid) {
      this.submitForm();
    } else {
      this.showFormError('Please correct the errors above before submitting');
      this.scrollToFirstError();
    }
  }

  scrollToFirstError() {
    const firstError = this.form.querySelector('.is-invalid');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }
  }

  async submitForm() {
    this.isSubmitting = true;
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
    
    try {
      // Get form data
      const formData = this.getFormData();
      
      // Simulate API call (replace with actual endpoint)
      const response = await this.sendFormData(formData);
      
      if (response.success) {
        this.showFormSuccess();
        this.form.reset();
        this.clearAllFieldStates();
        this.trackFormSubmission(formData);
      } else {
        throw new Error(response.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showFormError('Sorry, there was an error submitting your message. Please try again or contact us directly.');
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      this.isSubmitting = false;
    }
  }

  getFormData() {
    const formData = new FormData(this.form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    // Add additional metadata
    data.timestamp = new Date().toISOString();
    data.userAgent = navigator.userAgent;
    data.referrer = document.referrer;
    data.url = window.location.href;
    
    return data;
  }

  async sendFormData(data) {
    // Simulate API call - replace with actual endpoint
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate success
        resolve({ success: true, message: 'Form submitted successfully' });
      }, 2000);
    });
  }

  showFormSuccess() {
    const successMessage = document.createElement('div');
    successMessage.className = 'alert alert-success mt-4';
    successMessage.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="fas fa-check-circle fa-2x me-3 text-success"></i>
        <div>
          <h5 class="mb-1">Message Sent Successfully!</h5>
          <p class="mb-0">Thank you for your message. We'll get back to you within 24 hours.</p>
        </div>
      </div>
    `;
    
    this.form.parentNode.insertBefore(successMessage, this.form);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      successMessage.remove();
    }, 10000);
  }

  showFormError(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'alert alert-error mt-4';
    errorMessage.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="fas fa-exclamation-circle fa-2x me-3 text-error"></i>
        <div>
          <h5 class="mb-1">Submission Error</h5>
          <p class="mb-0">${message}</p>
        </div>
      </div>
    `;
    
    this.form.parentNode.insertBefore(errorMessage, this.form);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      errorMessage.remove();
    }, 8000);
  }

  clearAllFieldStates() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.classList.remove('is-valid', 'is-invalid');
      const feedback = input.parentNode.querySelector('.invalid-feedback');
      if (feedback) feedback.remove();
    });
  }

  setupWhatsAppIntegration() {
    // Update WhatsApp links based on form data
    this.whatsappButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const messageType = button.dataset.whatsapp || 'general';
        const message = this.getWhatsAppMessage(messageType);
        const url = `https://wa.me/254791832015?text=${message}`;
        
        // Track WhatsApp click
        this.trackWhatsAppClick(messageType);
        
        // Open WhatsApp
        window.open(url, '_blank');
      });
    });
  }

  getWhatsAppMessage(type) {
    // If service is selected, use that specific message
    if (this.serviceSelect && this.serviceSelect.value) {
      return this.whatsappMessages[this.serviceSelect.value] || this.whatsappMessages.general;
    }
    
    return this.whatsappMessages[type] || this.whatsappMessages.general;
  }

  setupServiceSelection() {
    if (!this.serviceSelect) return;

    this.serviceSelect.addEventListener('change', () => {
      const selectedService = this.serviceSelect.value;
      
      // Update WhatsApp buttons with service-specific message
      this.whatsappButtons.forEach(button => {
        const message = this.getWhatsAppMessage(selectedService);
        button.href = `https://wa.me/254791832015?text=${message}`;
      });
      
      // Show/hide relevant fields based on service
      this.handleServiceSelection(selectedService);
    });
  }

  handleServiceSelection(service) {
    // Show additional fields based on selected service
    const additionalFields = {
      'web-development': ['websiteUrl', 'currentPlatform'],
      'mobile-app': ['appType', 'platform'],
      'ai-solutions': ['useCase', 'dataSource'],
      'digital-marketing': ['currentMarketing', 'budget'],
      'it-support': ['issueType', 'urgency']
    };

    // Hide all additional fields first
    Object.values(additionalFields).flat().forEach(fieldName => {
      const field = document.getElementById(fieldName);
      if (field) {
        field.closest('.form-group').style.display = 'none';
      }
    });

    // Show relevant fields for selected service
    if (additionalFields[service]) {
      additionalFields[service].forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
          field.closest('.form-group').style.display = 'block';
        }
      });
    }
  }

  setupFieldDependencies() {
    // Example: Show budget field only if service is not free consultation
    const budgetField = document.getElementById('budget');
    if (budgetField && this.serviceSelect) {
      const toggleBudget = () => {
        const showBudget = this.serviceSelect.value && 
                          this.serviceSelect.value !== 'consultation';
        budgetField.closest('.form-group').style.display = 
          showBudget ? 'block' : 'none';
      };

      this.serviceSelect.addEventListener('change', toggleBudget);
      toggleBudget(); // Initial check
    }
  }

  setupAutoSave() {
    // Auto-save form data to localStorage
    const inputs = this.form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      const storageKey = `contact_form_${input.name || input.id}`;
      
      // Load saved data
      const savedValue = localStorage.getItem(storageKey);
      if (savedValue && !input.value) {
        input.value = savedValue;
      }
      
      // Save on change
      input.addEventListener('input', () => {
        localStorage.setItem(storageKey, input.value);
      });
    });

    // Clear saved data on successful submission
    this.form.addEventListener('submit', () => {
      inputs.forEach(input => {
        const storageKey = `contact_form_${input.name || input.id}`;
        localStorage.removeItem(storageKey);
      });
    });
  }

  trackFormSubmission(data) {
    // Analytics tracking
    console.log('Form submitted:', data);
    
    // Google Analytics event (if available)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submit', {
        event_category: 'Contact',
        event_label: data.service || 'General Inquiry'
      });
    }
  }

  trackWhatsAppClick(type) {
    // Analytics tracking
    console.log('WhatsApp clicked:', type);
    
    // Google Analytics event (if available)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'whatsapp_click', {
        event_category: 'Contact',
        event_label: type
      });
    }
  }
}

// Initialize contact form when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = new ContactFormController();
  contactForm.init();
});

// Export for global access
window.ContactFormController = ContactFormController;
