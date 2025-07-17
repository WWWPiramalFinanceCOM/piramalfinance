export default function decorate(block) {
    console.log(block);
    const props = [...block.children].map((row) => row);
    generateFeatureHTML(props, block)
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
    cardDescription = cardDescription?.querySelector('div > div') || '';
    mainImage = mainImage?.querySelector('picture') || '';
    mainImageAlt = mainImageAlt?.textContent.trim() || '';
    topCornerImage = topCornerImage?.querySelector('picture') || '';
    topCornerImageAlt = topCornerImageAlt?.textContent?.trim() || '';
    topCornerText = topCornerText?.querySelector('div > div') || '';

    console.log(containerLink);
    console.log(cardDescription);
    console.log(mainImage);
    console.log(mainImageAlt);
    
    console.log(topCornerImage);
    console.log(topCornerImageAlt);
    console.log(topCornerText);
    
   block.innerHTML = "";
}