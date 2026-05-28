import { CFApiCall, groupAllKeys } from '../../scripts/common.js';
import { featureDropDownClick } from '../keyfeatures/keyfeatures.js';
import { setLocationObj } from '../moredetailsaddress/moredetailsaddress.js';

export default async function decorate(block) {
  const {
    geoInfo: { city },
  } = setLocationObj;
  const linkURL = block.textContent.trim();

  const keyFeatureDiv = document.createElement('div');

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
    if (jsonResponseData[eachKey].includes(city)) {
      const getKeyFeatureEle = mainContainer.querySelector(`.${eachKey}-key-feature`);
      if (getKeyFeatureEle) {
        getKeyFeatureEle.querySelectorAll('.keyfeatures-wrapper').forEach((eachKeyFeatureEle) => {
          keyFeatureDiv.append(eachKeyFeatureEle);
        });
      }
    } else {
      if(eachKey === 'personal-loan'){
        const personalLoanFeature = mainContainer.querySelector('.personal-loan-key-feature');
        const wrapperContainer = personalLoanFeature?.querySelector('.wrapper-creation-container');
        wrapperContainer?.querySelectorAll('.keyfeatures-wrapper').forEach(function (eachfeature) {
          eachfeature.remove();
        });
      }
    }
  });

  mainContainer.querySelectorAll('.loans-fragment').forEach((eachEle) => {
    eachEle.remove();
  });

  const viewMoreLessContainer = mainContainer.querySelector('.view-more-less-js .wrapper-creation-container');
  if (viewMoreLessContainer) {
    viewMoreLessContainer.insertAdjacentHTML('beforeend', keyFeatureDiv.innerHTML);
  }

  const mainFeatureDiv = mainContainer.querySelector('.view-more-less-js.wrappercreation-container');
  const featureWrapperCheck = mainContainer.querySelectorAll('.view-more-less-js .wrapper-creation-container .keyfeatures-wrapper').length;
  if(featureWrapperCheck > 0){
    mainContainer.querySelectorAll('.view-more-less-js .wrapper-creation-container .keyfeatures-wrapper').forEach((eackfeatures, index) => {
      if (index <= 2) {
        eackfeatures.classList.remove('dp-none');
      } else {
        eackfeatures.classList.add('dp-none');
      }
    });
  } else if (mainFeatureDiv) {
    mainFeatureDiv.classList.add('dp-none');
  }

  const featurePlus = mainContainer.querySelector('.view-more-less-js .wrapper-creation-container');

  try {
    if (featurePlus) {
      featureDropDownClick(featurePlus);
    }
  } catch (error) {
    console.warn(error);
  }

  block.classList.add('dp-none');
}
