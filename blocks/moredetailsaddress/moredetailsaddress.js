import { getMetadata } from "../../scripts/aem.js";
import { CFApiCall } from "../../scripts/common.js";

export const setLocationObj = {
  getExcelData: null,
  geoInfo: {
    city: '',
    state: '',
    country: '',
    location: '',
    locationcode: '',
  },
};

const GOOGLE_MAPS_API_KEY = "AIzaSyDx1HwnCLjSSIm_gADqaYAZhSBh7hgcwTQ";

const locationInLatLan = {};

export default async function decorate(block) {
  const props = Array.from(block.children, (row) => row.firstElementChild);
  const [title, desktopdes, mobiledes, openingtime, info, image, imagealt, linkURL] = props;

  const url = linkURL.textContent.trim();
  const urlResponse = await CFApiCall(url);
  const jsonResponseData = urlResponse?.data;

  setLocationObj.getExcelData = sessionStorage.getItem('data')
    ? JSON.parse(sessionStorage.getItem('data'))
    : dropDownStateCity(jsonResponseData);

  if (!sessionStorage.getItem('data')) {
    sessionStorage.setItem('data', JSON.stringify(setLocationObj.getExcelData));
  }

  image?.querySelector('picture > img')?.setAttribute('alt', imagealt?.textContent?.trim() || '');

  const html = `
    <div class="address-wrapper">
      <div class="address-title">${title.innerHTML}</div>
      <div class="address-desktop">${desktopdes.innerHTML}</div>
      <div class="address-mobile">${mobiledes.innerHTML}</div>
      <div class="address-timing">${openingtime.innerHTML}</div>
      <div class="address-info">${info.innerHTML}</div>
      <div class="address-img">${image.innerHTML}</div>
    </div>
  `;

  block.innerHTML = html;

  await onbranchDetails();
  nearBLBreadCrumb();
}


async function onbranchDetails() {
  const searchBranchURL = location.href;
  const splitSearch = searchBranchURL.split('/').pop();

  if (splitSearch.includes('loans-in')) {
    const currentLocation = searchBranchURL.split('/').pop().split('-').pop();
    const flatLocationData = Object.values(setLocationObj.getExcelData).flat();
    const foundLocation = flatLocationData.find((location) => location['Location Code'] == currentLocation);

    if (foundLocation) {
      Object.assign(setLocationObj.geoInfo, {
        state: firstLetterCap(foundLocation.State),
        city: firstLetterCap(foundLocation.City),
        locationcode: foundLocation['Location Code'],
        location: foundLocation.Location,
      });
      Object.assign(setLocationObj, {
        lat: foundLocation.Latitude,
        lng: foundLocation.Longitude,
        address: foundLocation.Address,
        pincode: foundLocation.Pincode,
        pagecontent: foundLocation['On Page Content'],
      });
    }
  }

  // await getStateCity(setLocationObj.lat, setLocationObj.lng);

  renderData();

  const userLocation = await returnLatLan();
  if (userLocation) {
    setLocationObj.distance = calculateDistance(setLocationObj.lat, setLocationObj.lng, userLocation.lat, userLocation.lng);
    const distanceElement = document.createElement('li');
    const addressUl = document.querySelector('.address-info ul');
    if (setLocationObj.distance <= 40) {
      distanceElement.innerText = `${setLocationObj.distance.toFixed()} Km away from your location`;
      addressUl.appendChild(distanceElement);
    } else {
      distanceElement.remove();
    }
  }

  setLocationObj.storedata = sortByCityandState(setLocationObj.getExcelData[setLocationObj.geoInfo.state]);
}

function nearBLBreadCrumb() {
  const { city, location, locationcode, state } = setLocationObj.geoInfo;

  const formatString = (str, capitalize = false) => {
    const formatted = str.toLowerCase().replace(/\s+/g, '-');
    return capitalize ? formatted.charAt(0).toUpperCase() + formatted.slice(1) : formatted;
  };

  const newState = formatString(state);
  const newCity = formatString(city);
  const newLocation = formatString(location.replace(/[()/]/g, '').trim());
  const newSetState = formatString(state, true);
  const newSetCity = formatString(city, true);
  const newSetLocation = location.charAt(0).toUpperCase() + location.slice(1);

  const separatorSVG = '<svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9.00195L4.29293 5.70902C4.68182 5.32013 4.68182 4.68377 4.29293 4.29488L1 1.00195" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  const separator = `<span class="breadcrumb-separator">${separatorSVG}</span>`;

  const breadcrumbItems = [
    `<a href="${getMetadata('lang-path')}/branch-locator/${newState}">${newSetState}</a>`,
  ];

  if (newCity == newLocation) {
    breadcrumbItems.push(`<a href="${getMetadata('lang-path')}/branch-locator/${newState}/${newCity}">${newSetCity}</a>`);
  } else if (newCity !== newLocation) {
    breadcrumbItems.push(`<a href="${getMetadata('lang-path')}/branch-locator/${newState}/${newCity}">${newSetCity}</a>`);
    breadcrumbItems.push(`<a href="${getMetadata('lang-path')}/branch-locator/loans-in-${newLocation}-${newCity}-${newState}-${locationcode}">${newSetLocation}</a>`);
  }

  const breadCrumb = breadcrumbItems.join(separator);

  document.querySelector('body .breadcrumb nav').insertAdjacentHTML('beforeend', separator + breadCrumb);
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function dropDownStateCity(response) {
  return response.reduce((acc, location) => {
    const state = location.State.charAt(0).toUpperCase() + location.State.slice(1).toLowerCase();
    if (!acc[state]) {
      acc[state] = [];
    }
    acc[state].push(location);
    return acc;
  }, {});
}

function firstLetterCap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function sortByCityandState(data) {
  var fliterLocation = data.filter(function (location) {
    return location.City.toLowerCase() === setLocationObj.geoInfo.city.toLowerCase();
  });
  return fliterLocation;
}
