// Contact page JavaScript - Mobile menu functionality and form handling

// Initialize when page content loads
document.addEventListener('DOMContentLoaded', function () {
  initEmailJS();
  initMobileMenu();
  initContactForm();
  initScrollAnimations();
  initAccordion();
  initFooterStats();
});

// Initialize EmailJS
function initEmailJS() {
  if (
    typeof emailjs !== 'undefined' &&
    emailjsConfig.publicKey !== 'YOUR_PUBLIC_KEY'
  ) {
    emailjs.init(emailjsConfig.publicKey);
    console.log('EmailJS initialized successfully');
  } else {
    console.warn(
      'EmailJS not initialized - please configure your EmailJS credentials in config.js'
    );
  }
}

// Mobile menu functionality
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking on nav links
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }
}

// Contact form functionality
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  const submitBtn = contactForm.querySelector('.submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);

    // Add input validation feedback
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach((input) => {
      input.addEventListener('blur', validateField);
      input.addEventListener('input', clearValidationError);
    });
  }
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('.submit-btn');
  const formData = new FormData(form);

  // Validate all fields
  if (!validateForm(form)) {
    return;
  }

  // Show loading state
  showLoadingState(submitBtn);

  // Collect form data for EmailJS
  const templateParams = {
    from_name: formData.get('name'),
    from_organization: formData.get('organization'),
    from_email: formData.get('email'),
    from_phone: formData.get('phone') || 'Not provided',
    message: formData.get('message'),
    to_name: 'One Million Green Entities Team',
  };

  // Send email using EmailJS
  emailjs
    .send(
      emailjsConfig.serviceId,
      emailjsConfig.templateId,
      templateParams,
      emailjsConfig.publicKey
    )
    .then(function (response) {
      console.log('Email sent successfully!', response.status, response.text);
      showSuccessMessage(submitBtn);
      form.reset();
    })
    .catch(function (error) {
      console.error('Failed to send email:', error);
      showErrorMessage(submitBtn);
    });
}

// Validate entire form
function validateForm(form) {
  const requiredFields = form.querySelectorAll(
    'input[required], textarea[required]'
  );
  let isValid = true;

  requiredFields.forEach((field) => {
    if (!validateField({ target: field })) {
      isValid = false;
    }
  });

  return isValid;
}

// Validate individual field
function validateField(e) {
  const field = e.target;
  const value = field.value.trim();
  const fieldContainer = field.closest('.form-group');

  // Clear previous error
  clearValidationError({ target: field });

  // Check if required field is empty
  if (field.hasAttribute('required') && !value) {
    showFieldError(fieldContainer, 'This field is required');
    return false;
  }

  // Email validation
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showFieldError(fieldContainer, 'Please enter a valid email address');
      return false;
    }
  }

  // Phone validation (optional)
  if (field.type === 'tel' && value) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(value)) {
      showFieldError(fieldContainer, 'Please enter a valid phone number');
      return false;
    }
  }

  return true;
}

// Show field error
function showFieldError(fieldContainer, message) {
  const existingError = fieldContainer.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }

  const errorElement = document.createElement('span');
  errorElement.className = 'field-error';
  errorElement.textContent = message;
  errorElement.style.color = '#dc3545';
  errorElement.style.fontSize = '0.875rem';
  errorElement.style.marginTop = '4px';
  errorElement.style.display = 'block';

  fieldContainer.appendChild(errorElement);

  // Add error styling to input
  const input = fieldContainer.querySelector('input, textarea');
  if (input) {
    input.style.borderColor = '#dc3545';
  }
}

// Clear validation error
function clearValidationError(e) {
  const field = e.target;
  const fieldContainer = field.closest('.form-group');
  const errorElement = fieldContainer.querySelector('.field-error');

  if (errorElement) {
    errorElement.remove();
  }

  // Reset input styling
  field.style.borderColor = '#e0e0e0';
}

// Show loading state
function showLoadingState(submitBtn) {
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="submit-icon loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
    </svg>
    Sending...
  `;

  // Add loading animation
  const loadingIcon = submitBtn.querySelector('.loading');
  if (loadingIcon) {
    loadingIcon.style.animation = 'spin 1s linear infinite';
  }
}

// Show success message
function showSuccessMessage(submitBtn) {
  submitBtn.disabled = false;
  submitBtn.innerHTML = `
    <svg class="submit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20,6 9,17 4,12"></polyline>
    </svg>
    Message Sent!
  `;
  submitBtn.style.backgroundColor = '#28a745';

  // Reset button after 3 seconds
  setTimeout(() => {
    submitBtn.innerHTML = `
      <svg class="submit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 2L11 13"></path>
        <polygon points="22,2 15,22 11,13 2,9"></polygon>
      </svg>
      Send Message
    `;
    submitBtn.style.backgroundColor = '#007a55';
  }, 3000);
}

// Show error message
function showErrorMessage(submitBtn) {
  submitBtn.disabled = false;
  submitBtn.innerHTML = `
    <svg class="submit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
    Failed to Send
  `;
  submitBtn.style.backgroundColor = '#dc3545';

  // Reset button after 3 seconds
  setTimeout(() => {
    submitBtn.innerHTML = `
      <svg class="submit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 2L11 13"></path>
        <polygon points="22,2 15,22 11,13 2,9"></polygon>
      </svg>
      Send Message
    `;
    submitBtn.style.backgroundColor = '#007a55';
  }, 3000);
}

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Accordion functionality
function initAccordion() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach((header) => {
    header.addEventListener('click', function () {
      const accordionItem = this.parentElement;
      const accordionContent =
        accordionItem.querySelector('.accordion-content');
      const isActive = this.classList.contains('active');

      // Close all accordion items
      accordionHeaders.forEach((otherHeader) => {
        const otherItem = otherHeader.parentElement;
        const otherContent = otherItem.querySelector('.accordion-content');

        otherHeader.classList.remove('active');
        otherContent.classList.remove('active');
        otherHeader.setAttribute('aria-expanded', 'false');
      });

      // If this item wasn't active, open it
      if (!isActive) {
        this.classList.add('active');
        accordionContent.classList.add('active');
        this.setAttribute('aria-expanded', 'true');
      }
    });

    // Add keyboard support
    header.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });

    // Make headers focusable for keyboard navigation
    header.setAttribute('tabindex', '0');
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'false');

    // Set up ARIA attributes
    const accordionContent =
      header.parentElement.querySelector('.accordion-content');
    const contentId =
      'accordion-content-' + Math.random().toString(36).substr(2, 9);
    accordionContent.setAttribute('id', contentId);
    header.setAttribute('aria-controls', contentId);
  });
}

// Scroll animations functionality
function initScrollAnimations() {
  // Check for Intersection Observer support
  if (!('IntersectionObserver' in window)) {
    // Fallback: show all animations immediately for older browsers
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach((element) => {
      element.classList.add('animate-in');
    });
    return;
  }

  // Create intersection observer
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px', // Trigger when 10% of element is visible
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Add animation class when element comes into view
        entry.target.classList.add('animate-in');
        // Stop observing this element once animated
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with animate-on-scroll class
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  animateElements.forEach((element) => {
    observer.observe(element);
  });

  // Add a small delay for elements that are already in viewport on page load
  setTimeout(() => {
    const visibleElements = document.querySelectorAll('.animate-on-scroll');
    visibleElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (isVisible && !element.classList.contains('animate-in')) {
        element.classList.add('animate-in');
      }
    });
  }, 100);
}

// Animate footer statistics
function initFooterStats() {
  const entitiesCount = document.getElementById('entitiesCount');
  if (entitiesCount) {
    animateCounter(entitiesCount, 0, Object.keys(imageConfigs).length, 2000);
  }
}

function animateCounter(element, start, end, duration) {
  let startTime = null;

  function animate(currentTime) {
    if (startTime === null) startTime = currentTime;
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    element.textContent = value;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  // Start animation after a delay when footer is visible
  setTimeout(() => {
    requestAnimationFrame(animate);
  }, 1000);
}
