/* GSAP-powered scroll animations. Maps existing scroll-animation classes/attributes to GSAP + ScrollTrigger. */
const DIRECTION_MAP = {
  'slide-left': { x: 60, y: 0, opacity: 0 },
  'slide-right': { x: -60, y: 0, opacity: 0 },
  'slide-up': { x: 0, y: 60, opacity: 0 },
  'fade-only': { x: 0, y: 0, opacity: 0 },
  default: { x: 0, y: 30, opacity: 0 },
};

const SPEED_MAP = { fast: 0.4, slow: 0.9, default: 0.65 };

function getStaggerDelay(el) {
  const match = Array.from(el.classList).find((cls) => cls.startsWith('stagger-'));
  if (!match) return 0;
  const value = Number.parseInt(match.replace('stagger-', ''), 10);
  return Number.isNaN(value) ? 0 : value * 0.1;
}

async function loadGsap() {
  console.log('loadGsap called');
  
  // Always use CDN for reliability
  const loadScript = (src) => new Promise((resolve, reject) => {
    console.log('Loading script:', src);
    
    if (window.gsap && src.includes('gsap.min')) {
      console.log('GSAP already loaded');
      return resolve();
    }
    if (window.ScrollTrigger && src.includes('ScrollTrigger')) {
      console.log('ScrollTrigger already loaded');
      return resolve();
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    script.onload = () => {
      console.log('Script loaded:', src);
      console.log('window.gsap:', typeof window.gsap);
      console.log('window.ScrollTrigger:', typeof window.ScrollTrigger);
      setTimeout(resolve, 100); // Wait for execution
    };
    
    script.onerror = (err) => {
      console.error('Script error:', src, err);
      reject(err);
    };
    
    document.head.appendChild(script);
    console.log('Script appended to head');
  });

  try {
    console.log('Loading GSAP from CDN...');
    await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js');
    console.log('GSAP loaded, loading ScrollTrigger...');
    await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js');
    console.log('ScrollTrigger loaded');
  } catch (e) {
    console.error('Failed to load GSAP:', e);
    throw e;
  }

  console.log('Final check - gsap:', typeof window.gsap, 'ST:', typeof window.ScrollTrigger);
  
  if (!window.gsap || !window.ScrollTrigger) {
    throw new Error('GSAP not loaded: gsap=' + typeof window.gsap + ', ST=' + typeof window.ScrollTrigger);
  }

  console.log('Registering ScrollTrigger plugin...');
  window.gsap.registerPlugin(window.ScrollTrigger);
  console.log('Ready to animate!');
  return { gsap: window.gsap, ScrollTrigger: window.ScrollTrigger };
}

export default async function initGsapAnimations() {
  console.log('initGsapAnimations called');
  
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.log('Window/document not available');
    return;
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('prefers-reduced-motion');
    return;
  }
  if (window.__gsapAnimationsInitialized) {
    console.log('Already initialized');
    return;
  }

  window.__gsapAnimationsInitialized = true;

  console.log('Loading GSAP...');
  let gsap, ScrollTrigger;
  try {
    const result = await loadGsap();
    gsap = result.gsap;
    ScrollTrigger = result.ScrollTrigger;
    console.log('GSAP loaded successfully');
  } catch (e) {
    console.error('Failed to load GSAP:', e);
    return;
  }

  const animatedElements = Array.from(document.querySelectorAll('.scroll-animation, [data-scroll-animation]'));
  console.log('Found animated elements:', animatedElements.length);
  
  if (!animatedElements.length) {
    console.log('No animated elements found, but GSAP is ready');
    return;
  }

  console.log('Setting up animations for', animatedElements.length, 'elements');

  animatedElements.forEach((sectionEl) => {
    const type = sectionEl.dataset.scrollAnimation || Array.from(sectionEl.classList).find((cls) => cls.startsWith('slide-') || cls === 'fade-only') || 'default';
    const direction = DIRECTION_MAP[type] || DIRECTION_MAP.default;
    const speedKey = sectionEl.classList.contains('fast') ? 'fast' : sectionEl.classList.contains('slow') ? 'slow' : 'default';
    const duration = SPEED_MAP[speedKey];

    // Get child content elements to animate
    const childElements = sectionEl.querySelectorAll('.default-content-wrapper, .cards-wrapper, .cards, .banner-carousel-wrapper, [class*="-wrapper"]');
    
    if (childElements.length > 0) {
      // Animate each child with stagger
      childElements.forEach((el, index) => {
        const delay = index * 0.1; // Stagger children
        console.log('Animating child element:', el, 'index:', index, 'delay:', delay);

        const animation = gsap.fromTo(
          el,
          { opacity: direction.opacity ?? 0, x: direction.x, y: direction.y },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration,
            delay,
            ease: 'power2.out',
            paused: true,
            overwrite: 'auto',
          },
        );

        ScrollTrigger.create({
          trigger: sectionEl,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            console.log('Animating on scroll');
            animation.play();
          },
        });
      });
    } else {
      // Fallback: animate the section itself
      console.log('No children found, animating section:', sectionEl);
      const animation = gsap.fromTo(
        sectionEl,
        { opacity: direction.opacity ?? 0, x: direction.x, y: direction.y },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay: 0,
          ease: 'power2.out',
          paused: true,
          overwrite: 'auto',
        },
      );

      ScrollTrigger.create({
        trigger: sectionEl,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          animation.play();
        },
      });
    }
  });
  
  console.log('Animation setup complete!');
}

initGsapAnimations();
