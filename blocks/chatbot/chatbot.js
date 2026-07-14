export default function decorate(block) {
    const flipHost = block.closest('.section.chatbot-container') || block;
    const [img, gif, link] = block.children;
    if (!img || !gif || !link) return;

    img.classList.add('img');
    gif.classList.add('gif');
    link.classList.add('link');

    link.querySelector('a')?.setAttribute('target', '_blank');

    const flipper = document.createElement('span');
    flipper.className = 'chatbot-flipper';

    const frontFace = img;
    const backFace = gif;
    frontFace.classList.add('chatbot-face', 'chatbot-face-front');
    backFace.classList.add('chatbot-face', 'chatbot-face-back');

    flipper.append(frontFace, backFace);
    block.insertBefore(flipper, link);

    flipHost.classList.remove('is-flipped');

    let isFlipped = false;

    setInterval(() => {
        isFlipped = !isFlipped;
        flipHost.classList.toggle('is-flipped', isFlipped);
    }, 4000);
}