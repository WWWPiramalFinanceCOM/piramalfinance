export default function decorate(block) {
    const [img, gif, link] = block.children;
    if (!img || !gif || !link) return;

    img.classList.add('img');
    gif.classList.add('gif');
    link.classList.add('link');

    link.querySelector('a')?.setAttribute('target', '_blank');

    const gifMarkup = gif.innerHTML;

    function setState(showGif) {
        img.style.visibility = showGif ? 'hidden' : 'visible';
        gif.style.visibility = showGif ? 'visible' : 'hidden';
    }

    function showGif() {
        setState(true);

        if (!gif.innerHTML) {
            gif.innerHTML = gifMarkup;
        }
    }

    function showImage() {
        setState(false);

        if (gif.innerHTML) {
            gif.innerHTML = '';
        }
    }

    showImage();

    setTimeout(() => {
        showGif();
    }, 4000);

    setTimeout(() => {
        showImage();
    }, 8000);
}