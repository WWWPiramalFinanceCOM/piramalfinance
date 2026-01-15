export default function decorate(block) {
  // Get the banners wrapper
  const wrapper = block.querySelector('.banners-wrapper');
  
  if (!wrapper) {
    return;
  }

  // Get all direct children divs (each represents a banner item)
  const items = block.querySelectorAll(':scope > div');

  items.forEach((item) => {
    // Create a banner item container
    const bannerItem = document.createElement('div');
    bannerItem.classList.add('banners-item');

    // Get the content from the original item
    const children = Array.from(item.children);
    
    let desktopImage = null;
    let desktopAlt = '';
    let mobileImage = null;
    let mobileAlt = '';

    // Parse the banner item structure
    // Expected structure: desktop-image div, desktop-alt div, mobile-image div, mobile-alt div
    if (children.length >= 4) {
      // Extract desktop image
      const desktopImageDiv = children[0];
      const desktopImgElement = desktopImageDiv.querySelector('img, picture');
      if (desktopImgElement) {
        desktopImage = desktopImgElement.closest('picture') || desktopImgElement;
        desktopImage.classList.add('desktop-image');
      }

      // Extract desktop alt text
      const desktopAltDiv = children[1];
      desktopAlt = desktopAltDiv.textContent.trim();

      // Extract mobile image
      const mobileImageDiv = children[2];
      const mobileImgElement = mobileImageDiv.querySelector('img, picture');
      if (mobileImgElement) {
        mobileImage = mobileImgElement.closest('picture') || mobileImgElement;
        mobileImage.classList.add('mobile-image');
      }

      // Extract mobile alt text
      const mobileAltDiv = children[3];
      mobileAlt = mobileAltDiv.textContent.trim();
    }

    // Build the banner item
    if (desktopImage) {
      bannerItem.appendChild(desktopImage);
      if (desktopAlt) {
        desktopImage.querySelector('img')?.setAttribute('alt', desktopAlt);
      }
    }

    if (mobileImage) {
      bannerItem.appendChild(mobileImage);
      if (mobileAlt) {
        mobileImage.querySelector('img')?.setAttribute('alt', mobileAlt);
      }
    }

    // Append the banner item to the wrapper
    wrapper.appendChild(bannerItem);
  });

  // Remove the original items
  items.forEach((item) => {
    if (item.closest('.banners-wrapper') !== wrapper) {
      item.remove();
    }
  });
}
