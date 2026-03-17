import Swiper from "./swiper-bundle.min.js";

export default function decorate(block) {
    // debugger;
    block;
    console.log(block);

  const bannerCarousel = document.querySelector(".banner-carousel.block");

  if (!bannerCarousel) return;

  // Add swiper classes dynamically
  bannerCarousel.classList.add("swiper", "mySwiper");

  // Get inner wrapper (the <div> that contains image divs)
  const innerWrapper = bannerCarousel.querySelector(":scope > div");

  if (innerWrapper) {
    innerWrapper.classList.add("swiper-wrapper");

    // Each child becomes a swiper-slide
    const slides = innerWrapper.querySelectorAll(":scope > div");
    slides.forEach((slide) => {
      slide.classList.add("swiper-slide");
    });
  }

  // Create navigation and pagination elements dynamically
  const pagination = document.createElement("div");
  pagination.classList.add("swiper-pagination");

  // Only append pagination; navigation buttons are not created
//   bannerCarousel.appendChild(pagination);

  // Hide navigation arrows and pagination via an injected stylesheet
//   const style = document.createElement('style');
//   style.type = 'text/css';
//   style.appendChild(document.createTextNode(
//     `.banner-carousel.block .swiper-button-next,
//      .banner-carousel.block .swiper-button-prev,
//      .banner-carousel.block .swiper-pagination { display: none !important; }`
//   ));
//   document.head.appendChild(style);

  // Initialize Swiper
  const swiper = new Swiper(".mySwiper", {
    loop: true,
    // pagination: {
    //   el: ".swiper-pagination",
    //   clickable: true,
    // },
    // Removed navigation arrows per request
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