export default function decorate(block) {
    const props = [...block.children].map((row) => row);
    generateFeatureHTML(props, block);
}

function generateFeatureHTML(props, block) {
    let [
        containerLink,
        cardDescription,
        mainImage,
        mainImageAlt,
        topCornerImage,
        topCornerImageAlt,
        topCornerText,
    ] = props;

    containerLink = containerLink?.querySelector('a')?.href || '';
    cardDescription = cardDescription?.querySelector('div > div').innerHTML || '';
    mainImage = mainImage?.querySelector('picture > img')?.src || '';
    mainImageAlt = mainImageAlt?.textContent.trim() || '';
    topCornerImage = topCornerImage?.querySelector('picture > img')?.src || '';
    topCornerImageAlt = topCornerImageAlt?.textContent?.trim() || '';
    topCornerText = topCornerText?.querySelector('div > div').innerHTML || '';

    const teaser = containerLink ? document.createElement('a') : document.createElement('div');
    if (containerLink) {
        teaser.href = containerLink;
    }
    teaser.classList.add('teaser');

    teaser.innerHTML = `
       <div class="cmp-teaser__content">
            <div class="teaser__image">
                <img loading="lazy" class="cmp-image__image" aria-label="${mainImageAlt}" role="img" alt="${mainImageAlt}" src="${mainImage}">
            </div>
            <div class="teaser__description" aria-labelledby="teaser-description">
               ${cardDescription}
            </div>              
        </div>

        ${topCornerImage || topCornerText ? `
            <div class="teaser_top-content">
                ${topCornerImage ? `
                    <div class="top__image">
                        <img loading="lazy" class="cmp-image__image" aria-label="${topCornerImageAlt}" role="img" alt="${topCornerImageAlt}" src="${topCornerImage}">
                    </div>
                ` : ''}
                ${topCornerText ? `
                    <div class="top__content" aria-labelledby="top-corner-content">
                        ${topCornerText}
                    </div>
                ` : ''}
            </div>
        ` : ''}
    `

    block.append(teaser);
    props.forEach(prop => prop.remove());
}