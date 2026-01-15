import Swiper from "./swiper-bundle.min.js";

async function preloadImages(images) {
  const imageArray = Array.from(images);

  const decodeOrLoad = (img) => new Promise((resolve) => {
    const done = () => resolve();

    if (img.complete && img.naturalWidth) {
      // decode avoids flash of transparent frame on swap
      if (img.decode) {
        img.decode().then(done).catch(done);
      } else {
        done();
      }
      return;
    }

    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  });

  await Promise.all(imageArray.map(decodeOrLoad));
}

export default async function decorate(block) {
  const bannerCarousel = block || document.querySelector('.banner-carousel.block');

  if (!bannerCarousel) return;

  // Add swiper classes dynamically
  bannerCarousel.classList.add('swiper', 'mySwiper');

  // Get inner wrapper (the <div> that contains image divs)
  const innerWrapper = bannerCarousel.querySelector(':scope > div');

  if (innerWrapper) {
    innerWrapper.classList.add('swiper-wrapper');

    // Each child becomes a swiper-slide
    const slides = innerWrapper.querySelectorAll(":scope > div");
    slides.forEach((slide) => {
      slide.classList.add("swiper-slide");

      // Eager-load slide images so cross-fade never shows a blank frame
      slide.querySelectorAll('img').forEach((img) => {
        img.loading = 'eager';
        img.decoding = 'async';
        img.setAttribute('fetchpriority', 'high');
      });
    });
  }

  // Wait until slide images are decoded to avoid black frames during fade
  const slideImages = bannerCarousel.querySelectorAll('img');
  await preloadImages(slideImages);

  // Use first slide image as background fallback to prevent flashes
  const firstImg = slideImages[0];
  if (firstImg?.src) {
    bannerCarousel.style.backgroundImage = `url(${firstImg.src})`;
    bannerCarousel.style.backgroundSize = 'cover';
    bannerCarousel.style.backgroundPosition = 'center';
  }

  // Initialize Swiper
  const swiper = new Swiper(bannerCarousel, {
    loop: true,
    preloadImages: true,
    lazy: false,
    observer: true,
    observeParents: true,
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    // transition speed in ms (how quickly the next image appears)
    speed: 800,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
  });
}