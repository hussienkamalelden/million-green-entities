// Initiative page JavaScript - Mobile menu functionality

// Initialize when page content loads
document.addEventListener('DOMContentLoaded', function () {
  initMobileMenu();
  initScrollAnimations();
  initFooterStats();
});

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
