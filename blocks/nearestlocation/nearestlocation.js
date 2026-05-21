import { fetchPlaceholders } from '../../scripts/aem.js';
import { branchURLStr, selectBranchDetails } from '../../scripts/common.js';
import { setLocationObj } from '../moredetailsaddress/moredetailsaddress.js';

export function nearestLoction(placeholders) {
  const { storedata } = setLocationObj;
  if (!storedata || storedata.length == 0) {
    return false;
  }

  let branch_cards = '';
  const cityName = storedata[0].City;
  storedata.forEach((eachLocation) => {
    const eachState = eachLocation.State;
    const eachCity = eachLocation.City;
    const eachLocationCode = eachLocation['Location Code'];
    const eachLocationAdd = eachLocation.Location;
    const hasCoords = eachLocation.Latitude && eachLocation.Longitude;
    const directionsBtn = hasCoords
      ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${eachLocation.Latitude},${eachLocation.Longitude}" target="_blank" rel="noopener noreferrer" class='directions-btn'>${placeholders.directionstext || 'Directions'}</a>`
      : '';
    branch_cards += `
        <div class='card-box'>
        <h3 class='card-title'>${eachLocation.Location}</h3>
        <p class='card-address'>${eachLocation.Address}</p>
        <p class='card-gmail'> <span> <img src='/images/gmail.svg' alt='gmail-icon'/> </span> ${placeholders.branchlocatorgmail}</p>
        <div class='card-actions'>
            <a href="${branchURLStr(eachLocationAdd, eachCity, eachState, 'loans', eachLocationCode)}" class='more-details-btn'>${placeholders.moredetailtext}</a>
            ${directionsBtn}
        </div>
        </div>`;
    // <a href="/branch-locator/${eachState}/${eachCity}/loans-in-${eachCity}-${eachState}-${eachLocationCode}" id='more-details-btn'> More details </a>
  });

  const mainWrapperNearest = `<div class='cards-branches cards-branches-container mt-45 mb-40 mob-mb-45'>
            <div class='title'>
                 <h2 class="title-to-show"> Find all ${cityName} Branches here </h2>
            </div>
            <div class='cards-container'>
                <div class='cards-wrapper branch-list-wrapper'>
                    ${branch_cards}
                </div>
            </div>
        </div>`;

  return mainWrapperNearest;
}

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  const DOMnearestBranch = nearestLoction(placeholders);
  if (DOMnearestBranch) {
    block.innerHTML = DOMnearestBranch;
  }
  selectBranchDetails(block);
}
