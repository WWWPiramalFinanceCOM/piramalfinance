import { decorateButtons } from '../teaser/teaser.js';

function getCellContent(cell) {
  return cell?.firstElementChild || cell;
}

function getPictureSource(cell) {
  return getCellContent(cell)?.querySelector('picture img')?.src || '';
}

function getClasses(cell) {
  const classesText = getCellContent(cell)?.textContent?.trim() || '';
  return classesText
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function createArrowButton(direction, iconCell, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `banner-slider-arrow banner-slider-arrow-${direction}`;
  button.setAttribute('aria-label', label);

  const icon = getCellContent(iconCell)?.querySelector('picture');
  if (icon) {
    button.append(icon.cloneNode(true));
  } else {
    button.innerHTML = direction === 'prev' ? '&#8592;' : '&#8594;';
  }

  return button;
}

function createSlide(panel, index) {
  const cells = [...panel.children].map((child) => getCellContent(child));
  const [
    backgroundImage,
    foregroundImage,
    classesCell,
    title,
    description,
    primaryCta,
    secondaryCta,
    mobileBackgroundImage,
    backgroundColor,
  ] = cells;

  const classes = getClasses(classesCell);
  const desktopBackground = getPictureSource(backgroundImage);
  const mobileBackground = getPictureSource(mobileBackgroundImage)
    || desktopBackground;
  const foregroundPicture = foregroundImage?.querySelector('picture');
  const buttonsMarkup = decorateButtons(primaryCta, secondaryCta);

  panel.textContent = '';
  panel.className = 'banner-slider-slide';
  panel.dataset.slideIndex = `${index}`;
  classes.forEach((className) => panel.classList.add(className));
  if (!classes.some(
    (className) => className === 'image-left' || className === 'image-right',
  )) {
    panel.classList.add('image-right');
  }
  if (!classes.some(
    (className) => className === 'content-left' || className === 'content-center',
  )) {
    panel.classList.add('content-left');
  }
  if (!classes.includes('light') && !classes.includes('dark')) {
    panel.classList.add('light');
  }

  if (desktopBackground) {
    panel.style.setProperty('--banner-slider-bg-image', `url("${desktopBackground}")`);
  }
  if (mobileBackground) {
    panel.style.setProperty('--banner-slider-mobile-bg-image', `url("${mobileBackground}")`);
  }

  const colorValue = backgroundColor?.textContent?.trim();
  if (colorValue) {
    panel.style.setProperty('--banner-slider-bg-color', colorValue);
  }

  panel.innerHTML = `
    <div class="banner-slider-surface">
      <div class="banner-slider-content">
        <div class="banner-slider-copy">
          <div class="banner-slider-title">${title?.innerHTML || ''}</div>
          <div class="banner-slider-description">${description?.innerHTML || ''}</div>
          ${buttonsMarkup ? `<div class="banner-slider-cta">${buttonsMarkup}</div>` : ''}
        </div>
        <div class="banner-slider-media">${foregroundPicture ? foregroundPicture.outerHTML : ''}</div>
      </div>
    </div>
  `;

  return panel;
}

export default function decorate(block) {
  const blockRows = [...block.children];
  const [
    prevIcon,
    prevIconAlt,
    nextIcon,
    nextIconAlt,
    autorotateRow,
    autoplayDelayRow,
    ...panels
  ] = blockRows;
  const shouldRotate = getCellContent(autorotateRow)?.textContent?.trim() === 'rotate-on';
  const autoplayDelay = Number.parseInt(
    getCellContent(autoplayDelayRow)?.textContent?.trim(),
    10,
  ) || 7000;

  const stage = document.createElement('div');
  stage.className = 'banner-slider-stage';

  const dots = document.createElement('div');
  dots.className = 'banner-slider-dots';

  const previousButton = createArrowButton(
    'prev',
    prevIcon,
    getCellContent(prevIconAlt)?.textContent?.trim() || 'Previous Slide',
  );
  const nextButton = createArrowButton(
    'next',
    nextIcon,
    getCellContent(nextIconAlt)?.textContent?.trim() || 'Next Slide',
  );

  const slideElements = panels.map((panel, index) => createSlide(panel, index));
  slideElements.forEach((slide, index) => {
    stage.append(slide);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'banner-slider-dot';
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.dataset.slideIndex = `${index}`;
    dots.append(dot);
  });

  const controls = document.createElement('div');
  controls.className = 'banner-slider-controls';
  controls.append(previousButton, dots, nextButton);

  block.textContent = '';
  block.classList.add('banner-slider--ready');
  block.append(stage, controls);

  if (!slideElements.length) {
    return;
  }

  let activeIndex = 0;
  let autoplayTimer = null;

  const syncStageHeight = () => {
    const activeSlide = slideElements[activeIndex];
    if (activeSlide) {
      stage.style.height = `${activeSlide.offsetHeight}px`;
    }
  };

  const setActiveSlide = (index) => {
    activeIndex = (index + slideElements.length) % slideElements.length;

    slideElements.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
      slide.setAttribute('aria-hidden', slideIndex === activeIndex ? 'false' : 'true');
    });

    [...dots.children].forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
      dot.setAttribute('aria-current', dotIndex === activeIndex ? 'true' : 'false');
    });

    previousButton.disabled = slideElements.length < 2;
    nextButton.disabled = slideElements.length < 2;
    syncStageHeight();
  };

  const restartAutoplay = () => {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }

    if (shouldRotate && slideElements.length > 1) {
      autoplayTimer = window.setInterval(() => {
        setActiveSlide(activeIndex + 1);
      }, autoplayDelay);
    }
  };

  previousButton.addEventListener('click', () => {
    setActiveSlide(activeIndex - 1);
    restartAutoplay();
  });

  nextButton.addEventListener('click', () => {
    setActiveSlide(activeIndex + 1);
    restartAutoplay();
  });

  dots.addEventListener('click', (event) => {
    const dot = event.target.closest('.banner-slider-dot');
    if (!dot) {
      return;
    }

    setActiveSlide(Number.parseInt(dot.dataset.slideIndex, 10));
    restartAutoplay();
  });

  window.addEventListener('resize', syncStageHeight);
  setActiveSlide(0);
  restartAutoplay();
}
