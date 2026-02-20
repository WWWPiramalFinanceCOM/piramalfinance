/**
 * Scroll Animations JavaScript
 * Uses Intersection Observer to add 'animate-in' class when elements scroll into view
 */

/**
 * Initialize scroll animations for elements with scroll-animation class
 */
function initScrollAnimations() {
  // Select all elements with scroll-animation class
  const animatedSections = document.querySelectorAll('.scroll-animation');

  // Also select individual elements with animate utility classes
  const animatedElements = document.querySelectorAll(
    '.animate-fade-up, .animate-fade-down, .animate-fade-left, .animate-fade-right, .animate-scale, .animate-fade'
  );

  if (animatedSections.length === 0 && animatedElements.length === 0) {
    return;
  }

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // If user prefers reduced motion, show all elements immediately
    animatedSections.forEach((section) => section.classList.add('animate-in'));
    animatedElements.forEach((element) => element.classList.add('animate-in'));
    return;
  }

  // Intersection Observer options
  const observerOptions = {
    root: null, // viewport
    rootMargin: '0px 0px -50px 0px', // trigger slightly before element is fully in view
    threshold: 0.1, // trigger when 10% of element is visible
  };

  // Create observer for sections
  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        // Optionally unobserve after animation to improve performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Create observer for individual elements with slightly different threshold
  const elementObserverOptions = {
    ...observerOptions,
    threshold: 0.2,
  };

  const elementObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, elementObserverOptions);

  // Observe all sections with scroll-animation class
  animatedSections.forEach((section) => {
    sectionObserver.observe(section);
  });

  // Observe individual animated elements
  animatedElements.forEach((element) => {
    elementObserver.observe(element);
  });
}

/**
 * Reset animations (useful for testing or re-triggering)
 */
function resetScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-in');
  animatedElements.forEach((element) => {
    element.classList.remove('animate-in');
  });
  initScrollAnimations();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
  initScrollAnimations();
}

// Also re-initialize after any lazy-loaded content (for AEM EDS)
// This uses a MutationObserver to watch for new elements being added
const mutationObserver = new MutationObserver((mutations) => {
  let shouldReinit = false;
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && (node.classList?.contains('scroll-animation') 
            || node.querySelector?.('.scroll-animation'))) {
          shouldReinit = true;
        }
      });
    }
  });
  if (shouldReinit) {
    initScrollAnimations();
  }
});

// Start observing the document body for dynamic content
mutationObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

// Export functions for external use
export { initScrollAnimations, resetScrollAnimations };
