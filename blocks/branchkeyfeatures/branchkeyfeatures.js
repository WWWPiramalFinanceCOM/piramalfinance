import { CFApiCall, groupAllKeys } from '../../scripts/common.js';
import { featureDropDownClick } from '../keyfeatures/keyfeatures.js';
import { setLocationObj } from '../moredetailsaddress/moredetailsaddress.js';

// Pattern C: Custom Events for cross-block communication
window.pfx = window.pfx || {};

// Track if filter has already been applied
let filterApplied = false;

// Event handler - executes once then auto-removes via {once: true}
function handleKeyFeatureFilter(e) {
  if (filterApplied) return; // Guard against duplicate events
  filterApplied = true;
  
  const { includedLoanTypes, excludedLoanTypes, keyFeatureDiv, mainContainer } = e.detail;
  if (!mainContainer) return;
  
  // Process included loan types - gather features
  includedLoanTypes.forEach((eachKey) => {
    const getKeyFeatureEle = mainContainer.querySelector(`.${eachKey}-key-feature`);
    if (getKeyFeatureEle) {
      getKeyFeatureEle.querySelectorAll('.keyfeatures-wrapper').forEach((eachKeyFeatureEle) => {
        keyFeatureDiv.append(eachKeyFeatureEle);
      });
    }
  });
  
  // Process excluded loan types - remove features
  excludedLoanTypes.forEach((eachKey) => {
    if(eachKey === 'personal-loan'){
      const personalLoanFeature = mainContainer.querySelector('.personal-loan-key-feature');
      const wrapperContainer = personalLoanFeature?.querySelector('.wrapper-creation-container');
      wrapperContainer?.querySelectorAll('.keyfeatures-wrapper').forEach(function (eachfeature) {
        eachfeature.remove();
      });
    }
  });

  // Remove loan fragments
  mainContainer.querySelectorAll('.loans-fragment').forEach((eachEle) => {
    eachEle.remove();
  });

  // Append to view-more-less container
  const viewMoreLessContainer = mainContainer.querySelector('.view-more-less-js .wrapper-creation-container');
  if (viewMoreLessContainer) {
    viewMoreLessContainer.insertAdjacentHTML('beforeend', keyFeatureDiv.innerHTML);
  }

  // Handle visibility
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

  // Initialize dropdown
  const featurePlus = mainContainer.querySelector('.view-more-less-js .wrapper-creation-container');
  try {
    if (featurePlus) {
      featureDropDownClick(featurePlus);
    }
  } catch (error) {
    console.warn(error);
  }
}

// Register listener with {once: true} for automatic cleanup
window.addEventListener('pf:keyfeature-filter', handleKeyFeatureFilter, { once: true });

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

  // Store in shared store
  window.pfx.branchLoanMapping = jsonResponseData;
  window.pfx.branchCity = city;

  // Categorize loan types
  const includedLoanTypes = Object.keys(jsonResponseData).filter(
    (eachKey) => jsonResponseData[eachKey].includes(city)
  );
  const excludedLoanTypes = Object.keys(jsonResponseData).filter(
    (eachKey) => !jsonResponseData[eachKey].includes(city)
  );

  // Get main container for scoped queries (avoids document.querySelector in handler)
  const mainContainer = block.closest('main') || block.closest('body');

  // Fire custom event with deferred execution
  requestAnimationFrame(() => {
    window.dispatchEvent(new CustomEvent('pf:keyfeature-filter', {
      detail: { includedLoanTypes, excludedLoanTypes, keyFeatureDiv, city, mainContainer }
    }));
  });

  block.classList.add('dp-none');
}
