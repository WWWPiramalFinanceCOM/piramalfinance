import { workFlowStatemaster, stateMasterProcessApiData, stateMasterProcessGraphqlData } from './statemasterbiz.js';
import { fetchAPI } from '../../scripts/common.js';
import { loanProduct } from './loanformdom.js';
import { statemasterDataMap } from './statemasterDataMapping.js';

export function stateMasterApi() {
  const loaninnerform = document.querySelector('.loan-form-sub-parent');
  let applyLaonFormOpenBtns = [];
  const buttonExpert = document.querySelectorAll('.expert');
  const productBannerButton = document.querySelector('#loan-banner .cmp-teaser__content .cmp-teaser__action-container .cmp-teaser__action-link');
  const documentWhatsAppBtn = document.querySelector('.cmp-container--documentrequired .cmp-container .extendedbutton');
  const stickyFooter = document.getElementById('sticky-btn-loan-form');
  const locationCardButton = document.querySelectorAll(
    '.cmp-container--branches .cmp-contentfragmentlist .cmp-contentfragment .cmp-contentfragment__elements .cmp-contentfragment__element--ctaName .cmp-contentfragment__element-value',
  );
  const neeyatBtn = document.querySelectorAll('.open-form-btn');

  applyLaonFormOpenBtns = [...buttonExpert, productBannerButton, documentWhatsAppBtn, stickyFooter, ...locationCardButton, ...neeyatBtn];

  const filterdBtns = applyLaonFormOpenBtns.filter((btn) => btn != null);

  filterdBtns.forEach((button) => {
    button.addEventListener('click', (e) => {
      if (loaninnerform.dataset.stateMaster != 'true') {
        const loanInput = loanProduct();
        let currentLoanType = loanInput?.dataset?.loanType;
        if (!currentLoanType && loanInput?.value) {
          const allOptions = document.querySelectorAll('.loan-form-drpdown .subpoints[data-loan-type]');
          allOptions.forEach((opt) => {
            if (opt.textContent.trim().toLowerCase() === loanInput.value.trim().toLowerCase()) {
              currentLoanType = opt.dataset.loanType;
              loanInput.dataset.loanType = opt.dataset.loanType;
              loanInput.dataset.loanName = opt.dataset.loanName;
            }
          });
        }
        statemasterGetStatesApi(currentLoanType)
          .catch((error) => {
            console.warn(error);
          });

        loaninnerform.dataset.stateMaster = true;
      }
    });
  });

  sessionStorage.removeItem('allowedType');
  sessionStorage.removeItem('goldLoanType');
}

export function statemasterGetStatesApi(loanType) {
  const allowedtype = ['pl', 'las', 'lamf'].includes(loanType);
  const isGoldLoan = loanType === 'gold-loan';
  const fetchUrl = isGoldLoan
    ? '/api/state-city-master/gold-loan-state-city-master.json'
    : '/api/state-city-master/personal-loan-state-city-master.json';

  const graphqlUrl = window.location.href.includes('localhost') 
  ? 'https://www.piramalfinance.com/graphql/execute.json/piramalfinance/State%20City%20Master'
  : '/graphql/execute.json/piramalfinance/State%20City%20Master';

  const url = (allowedtype || isGoldLoan) ? fetchUrl : graphqlUrl;

  return new Promise((resolve, reject) => {
    
    fetchAPI('GET', url)
      .then(async (response) => {
        const responseJson = await response.json();
        const statemaster = (allowedtype || isGoldLoan)
        ? stateMasterProcessApiData(responseJson.data) 
        : stateMasterProcessGraphqlData(responseJson.data.statemasterList.items);

        workFlowStatemaster(statemaster);
        resolve(statemaster);
      })
      .catch((error) => {
        console.warn(error);
        reject(error);
      });
  });
}
