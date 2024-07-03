export default function decorate(block) {
  const props = Array.from(block.children, (row) => row.firstElementChild);
  const renderTeaserHTML = renderTeaserHTMLFactory(props);
  block.innerHTML = "";
  block.append(renderTeaserHTML);
}

function renderTeaserHTMLFactory(props) {
  const [mainHref, bgImage, frontImage, title, description, mobileDescription, button, buttonHref, bgColor, teaserv2Attr, textwithinnerhtml] = props;

  const createElement = (tag, className, content) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.innerHTML = content || "";
    return element;
  };

  const mainLink = mainHref?.textContent.trim() || "";
  const container = document.createElement("a");
  if (mainLink) container.href = mainLink;

  const bgImageSrc = bgImage?.querySelector("picture > img")?.src || "";
  const bgBannerColor = bgColor?.textContent.trim()?.src || "";
  const bgImageDiv = createElement("div", "bg-image");
  if (bgImageSrc) bgImageDiv.style.backgroundImage = `url(${bgImageSrc})`;
  if (bgBannerColor) bgImageDiv.style.backgroundColor = bgBannerColor;

  const frontImagePic = frontImage?.querySelector("picture");
  const frontImageDiv = createElement("div", "front-image");
  if (frontImagePic) frontImageDiv.append(frontImagePic);

  const titleDiv = createElement("div", "title", title?.textContent.trim() || "");
  const descriptionDiv = createElement("div", "description", description?.textContent.trim() || "");

  let newButtonTag = "";
  const buttonHrefAnchor = buttonHref?.querySelector("a") || "";
  if (buttonHrefAnchor) {
    buttonHrefAnchor.innerText = button?.textContent.trim() || "";
    newButtonTag = buttonHrefAnchor.outerHTML;
  } else if (button) {
    newButtonTag = createElement("div", "button-container-text", button?.textContent.trim() || "");
  }

  const textwithDiv = document.createElement("div");
  textwithDiv.innerHTML = textwithinnerhtml?.innerHTML || "";
  
  bgImageDiv.append(frontImageDiv, titleDiv, descriptionDiv, newButtonTag, textwithDiv);

  const teaserv2AttrGet = teaserv2Attr?.textContent?.trim() || "";
  teaserv2Attr.closest(".teaserv2-wrapper").setAttribute("data-teaserv2-xf", teaserv2AttrGet);

  if (container.tagName === "A") {
    container.append(bgImageDiv);
  }

  return container;
}


