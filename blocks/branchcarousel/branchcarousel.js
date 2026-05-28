import { CFApiCall, groupAllKeys } from '../../scripts/common.js';
import { setLocationObj } from '../moredetailsaddress/moredetailsaddress.js';

export default async function decorate(block) {
  const { geoInfo: { city } } = setLocationObj;
  const linkURL = block.textContent.trim();

  let jsonResponseData = '';
  if(sessionStorage.getItem('branchloanmapping')){
    jsonResponseData = JSON.parse(sessionStorage.getItem('branchloanmapping'));
  }else{
    if (!linkURL) {
      return false;
    }
    const cfRepsonse = linkURL && await CFApiCall(linkURL);
    const reponseData = cfRepsonse && cfRepsonse.data;
    jsonResponseData = groupAllKeys(reponseData);
    sessionStorage.setItem('branchloanmapping', JSON.stringify(jsonResponseData));
  }

  // Scoped access - use mainContainer instead of document
  const mainContainer = block.closest('main') || block.closest('body');

  Object.keys(jsonResponseData).forEach((eachKey) => {
    if (!jsonResponseData[eachKey].includes(city)) {
      const targetEl = mainContainer.querySelector(`.${eachKey}-branch-carousel`);
      if (targetEl) {
        const getDataPanel = targetEl.getAttribute('data-panel');
        if (getDataPanel) {
          mainContainer.querySelectorAll(`[data-panel=${getDataPanel}]`).forEach((eachEle) => {
            eachEle.remove();
          });
        }
      }
    }
  });

  block.classList.add('dp-none');
}

