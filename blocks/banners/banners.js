export default function decorate(block) {
  if (!block) return;

  const slides = Array.from(block.children).filter((child) => child.tagName === 'DIV');
  slides.forEach((slide) => slide.classList.add('banner-slide'));

  // Get all pictures in the block
  const pictures = Array.from(block.querySelectorAll('picture'));

  // Alternate between desktop and mobile classes
  pictures.forEach((picture, index) => {
    if (index % 2 === 0) {
      picture.classList.add('desktop-image');
    } else {
      picture.classList.add('mobile-image');
    }
  });

  // Set alt text from adjacent text divs
  pictures.forEach((picture) => {
    const parent = picture.parentElement;
    if (parent) {
      const nextDiv = parent.nextElementSibling;
      if (nextDiv && nextDiv.textContent.trim()) {
        const img = picture.querySelector('img');
        if (img) {
          img.setAttribute('alt', nextDiv.textContent.trim());
        }
      }
    }
  });

  if (slides.length <= 1) {
    if (slides[0]) slides[0].classList.add('is-active');
    return;
  }

  let activeIndex = 0;
  let timerId;
  const intervalMs = 6000;

  const setActiveSlide = (nextIndex) => {
    slides[activeIndex]?.classList.remove('is-active');
    activeIndex = nextIndex;
    slides[activeIndex]?.classList.add('is-active');
  };

  const startRotation = () => {
    if (timerId) return;
    timerId = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      setActiveSlide(nextIndex);
    }, intervalMs);
  };

  const stopRotation = () => {
    if (!timerId) return;
    clearInterval(timerId);
    timerId = null;
  };

  setActiveSlide(0);
  startRotation();

  block.addEventListener('mouseenter', stopRotation);
  block.addEventListener('mouseleave', startRotation);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopRotation();
    } else {
      startRotation();
    }
  });

  // Make banner cards clickable - find cards in the same section
  const makeCardsClickable = () => {
    const bannersSection = block.closest('.section.banners-container');
    if (bannersSection) {
      const cardsBlock = bannersSection.querySelector('.cards.block');
      if (cardsBlock) {
        cardsBlock.querySelectorAll('li').forEach((card) => {
          // Skip if already processed
          if (card.dataset.clickable) return;
          card.dataset.clickable = 'true';
          
          const link = card.querySelector('a');
          if (link) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
              if (!e.target.closest('a')) {
                window.location.href = link.href;
              }
            });
          }
        });
      }
    }
  };

  // Try immediately and also after a delay to ensure cards are loaded
  makeCardsClickable();
  setTimeout(makeCardsClickable, 500);
  setTimeout(makeCardsClickable, 1000);
}
