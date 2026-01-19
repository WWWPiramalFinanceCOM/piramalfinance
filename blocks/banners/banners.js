export default function decorate(block) {
  if (!block) return;

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
}
