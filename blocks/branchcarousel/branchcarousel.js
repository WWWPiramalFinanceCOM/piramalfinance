import { CFApiCall, groupAllKeys } from '../../scripts/common.js';
import { setLocationObj } from '../moredetailsaddress/moredetailsaddress.js';

// Pattern C: Custom Events for cross-block communication
window.pfx = window.pfx || {};

// Track if filter has already been applied (prevents duplicate executions)
let filterApplied = false;

// Event handler - executes once then auto-removes via {once: true}
function handleBranchLoanFilter(e) {
  if (filterApplied) return; // Guard against duplicate events
  filterApplied = true;
  
  const { loanTypesToHide, mainContainer } = e.detail;
  if (!mainContainer) return;
  
  loanTypesToHide.forEach((eachKey) => {
    const selfBlocks = mainContainer.querySelectorAll(`.${eachKey}-branch-carousel`);
    selfBlocks.forEach((targetEl) => {
      const getDataPanel = targetEl.getAttribute('data-panel');
      if (getDataPanel) {
        mainContainer.querySelectorAll(`[data-panel=${getDataPanel}]`).forEach((eachEle) => {
          eachEle.remove();
        });
      }
    });
  });
}

// Register listener with {once: true} for automatic cleanup
window.addEventListener('pf:branch-loan-filter', handleBranchLoanFilter, { once: true });

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

  // Store in shared store for other blocks to access
  window.pfx.branchLoanMapping = jsonResponseData;
  window.pfx.branchCity = city;

  // Fire custom event - listener handles DOM manipulation
  const loanTypesToHide = Object.keys(jsonResponseData).filter(
    (eachKey) => !jsonResponseData[eachKey].includes(city)
  );
  
  // Get main container for scoped queries (avoids document.querySelector in handler)
  const mainContainer = block.closest('main') || block.closest('body');
  
  // Defer event dispatch to ensure all blocks are loaded
  requestAnimationFrame(() => {
    window.dispatchEvent(new CustomEvent('pf:branch-loan-filter', {
      detail: { loanTypesToHide, city, mappingData: jsonResponseData, mainContainer }
    }));
  });

  block.classList.add('dp-none');
}

