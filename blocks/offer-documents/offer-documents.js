import { getProps } from "../../scripts/scripts.js";

export default function decorate(block) {
    const [mainTitle, title, subTitle, content, button, buttonURL, type, image] = getProps(block, {
        index: [3, 7]
    });

    if (type === "secondary") {
        block.innerHTML = `
            <div class="richtext text boxContainer stakeholder-container popup-rich-text">
                <div  class="cmp-text">
                    <p>
                        <a href="${buttonURL}" target="_blank" rel="noopener noreferrer"> ${mainTitle}</a>
                    </p>
                </div>
            </div>    
        `
        return;
    }
    block.innerHTML = `
            <div class="richtext text boxContainer stakeholder-container popup-rich-text modal-cta">
                <div  class="cmp-text">
                    <p>${image.outerHTML.includes("picture") ? image.outerHTML : mainTitle}</p>
                </div>
                <div class="stake-pop-up dp-none">
                    <div class="popup stake-document-popup">
                        <div class="text popupText">
                            <div class="cmp-text">
                                <div class="cpm-sub-text">
                                    <p><span class="title">${title}</span></p>
                                    <p><span class="description">${subTitle}</span></p>
                                    <p class="cross-container">
                                        <img src="/content/dam/piramalfinance/company/about-us/partnership/close.png" alt="close">
                                    </p>
                                </div>
                                <div class="popup-parent-cont">
                                    <div class="popupContainer">
                                        ${content.innerHTML}
                                        <p>
                                            <span class="popupbutton">
                                                <a href="${buttonURL}"
                                                    target="_blank">
                                                    ${button}
                                                </a>
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>    
    `
    block.addEventListener("click", function (e) {
        e.stopPropagation();
        e.currentTarget.querySelector(".stake-pop-up")?.classList.add("dp-block");
    })
    block.querySelectorAll(".stake-pop-up .text.popupText .cmp-text .cross-container img").forEach(function (ele) {
        ele.addEventListener("click", function (currentEle) {
            currentEle.stopImmediatePropagation();
            currentEle.target.closest('.stake-pop-up').classList.remove('dp-block')
        })
    })
}

//     block.addEventListener("click", function (e) {
//         document.body.classList.add("popup-active");
//     });

//     document.querySelector(".cross-container").addEventListener("click", function (e) {
//         e.stopPropagation();
//         document.body.classList.remove("popup-active");
//     });
// }

// // Create and append the overlay to the body
// const overlay = document.createElement('div');
// overlay.className = 'overlay';
// document.body.appendChild(overlay);

// // Add click event to overlay to close the popup
// overlay.addEventListener('click', function () {
//     document.body.classList.remove('popup-active');
// });