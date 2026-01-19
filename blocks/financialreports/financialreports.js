import { ctaClickInteraction } from '../../dl.js';
import { fetchAPI, getProps, renderHelper } from '../../scripts/common.js';

export default async function decorate(block) {
  const props = getProps(block);
  const [url, type, sortType] = props;
  const isAscending = sortType === 'ascending';
  block.innerHTML = '';
  
  if (!url) {
    console.error('API URL is required for financialreports block');
    return;
  }
  
  try {
    // const resp = await fetchAPI('GET', '/mocks/datathree.json');
    const resp = await fetchAPI('GET', url);
    const data = await resp.json();
    const years = data.result && Array.isArray(data.result) ? data.result[0] : data;
    
    // Sort years based on sortType
    const sortedYears = Object.keys(years).sort((a, b) => {
      // Extract numeric year from formats like "2024-2025" or "2024"
      const yearA = parseInt(a.split('-')[0]);
      const yearB = parseInt(b.split('-')[0]);
      return isAscending ? yearA - yearB : yearB - yearA;
    });
    
    const monthOrder = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    
  sortedYears.forEach((year) => {
    const months = Array.isArray(years[year]) ? years[year][0] : years[year];
    
    // Sort months/quarters based on sortType
    const sortedMonths = Object.keys(months).sort((a, b) => {
      let comparison = 0;
      
      // Extract quarter numbers dynamically (e.g., "Quarter 1", "Quarter2", "Quarter 10")
      const quarterRegex = /^Quarter\s*(\d+)/i;
      const quarterMatchA = a.match(quarterRegex);
      const quarterMatchB = b.match(quarterRegex);

      if (quarterMatchA && quarterMatchB) {
        // Both are quarters - compare numerically
        const quarterNumA = parseInt(quarterMatchA[1]);
        const quarterNumB = parseInt(quarterMatchB[1]);
        comparison = quarterNumA - quarterNumB;
      } else if (quarterMatchA || quarterMatchB) {
        // One is quarter, one is not - quarters come first
        comparison = quarterMatchA ? -1 : 1;
      } else {
        // Check if it's a month format (case-insensitive)
        const monthA = monthOrder.findIndex((m) => m.toLowerCase() === a.toLowerCase());
        const monthB = monthOrder.findIndex((m) => m.toLowerCase() === b.toLowerCase());
        if (monthA !== -1 && monthB !== -1) {
          comparison = monthA - monthB;
        } else {
          // Fallback to string comparison
          comparison = a.localeCompare(b);
        }
      }

      return isAscending ? comparison : -comparison;
    });
      
      let monthsli = '';
      sortedMonths.forEach((month) => {
        const listData = months[month].sort((a, b) => new Date(b.pdfDate) - new Date(a.pdfDate));

        monthsli += `  
                                <div class="subAccordianContent" style="display: nona;">
                                    <div class="publicDisclosuresWrap">
                                        <div class="innersubAccordianContent">
                                            <a href="javascript:;" class="innersubAccordianTitle">${month}</a>
                                            <div class="publicDisclosuresWrap innerSubAccordianData" style="display: none;" >
                                                <ul> ${renderHelper(listData, `
                                                    <div class="forName">    
                                                        <li data-date="{pdfDate}">
                                                            <a href="{PdfPath}" data-category="{Pdf_Category}" target="_blank">
                                                                <span class="created-date">{Created_Date}</span>
                                                                {Title}</a>
                                                        </li>
                                                    </div>
                                                    `)} 
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
      });
      block.innerHTML += `
                        <section class="accordianpdf-section">
                            <div class="container boxContainer">
                                <div class="accordianContent">
                                    <div class="accordianBox">
                                        <div class="subAccordianWrap">
                                            <div class="subAccordianBox">
                                                <a href="javascript:;" class="subAccordianTitle"
                                                    data-accordianpdf-folderpath="/content/dam/piramalfinance/pdf/stakeholder/financial-reports/2024"
                                                    data-accordianpdf-folderdepth="2">${year}</a>
                                                    <div class="grey-border" style="display: none;">
                                                ${monthsli}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    `;
    });

    // Set initial display to none for all subAccordianContent elements
    const subAccordianContents = block.querySelectorAll('.subAccordianContent');
    subAccordianContents.forEach((content) => {
      content.style.display = 'none';
    });

    // Function to handle click on main accordion titles
    function handleMainAccordionClick(event) {
      block.querySelectorAll('.subAccordianBox').forEach((el) => {
        if (!event.target.parentElement.classList.contains('active')) {
          el.classList.remove('active');
          el.querySelectorAll('.subAccordianContent,.grey-border').forEach((ele) => {
            ele.style.display = 'none';
          });
        }
      });
      const parent = event.target.parentNode;
      const siblings = getSiblings(parent);

      parent.classList.toggle('active');
      siblings.forEach((sibling) => {
        sibling.classList.remove('active');
      });

      const content = parent.querySelectorAll('.subAccordianContent');
      content.forEach((el) => {
        const computedStyle = window.getComputedStyle(el);
        el.parentElement.style.display = computedStyle.getPropertyValue('display') === 'none' ? 'block' : 'none';
        el.style.display = computedStyle.getPropertyValue('display') === 'none' ? 'block' : 'none';
      });

      siblings.forEach((sibling) => {
        const siblingContent = sibling.querySelector('.subAccordianContent');
        const siblingComputedStyle = window.getComputedStyle(siblingContent);
        if (siblingComputedStyle.getPropertyValue('display') === 'block') {
          siblingContent.style.display = 'none';
        }
      });

      try {
        const data = {};
        data.click_text = event.target.textContent.trim();
        data.cta_position = event.target.closest('.section').querySelector('.default-content-wrapper').querySelector('h1, h2, h3, h4, h5, h6').textContent.trim();
        ctaClickInteraction(data);
      } catch (error) {
        console.warn(error);
      }
    }

    // Event listeners for main accordion titles
    const mainAccordionTitles = block.querySelectorAll('.subAccordianTitle');
    mainAccordionTitles.forEach((title) => {
      title.addEventListener('click', handleMainAccordionClick);
    });

    // Event listeners for inner accordion titles
    const innerAccordionTitles = block.querySelectorAll('.innersubAccordianTitle');
    innerAccordionTitles.forEach((title) => {
      title.addEventListener('click', handleInnerAccordionClick);
    });
  } catch (error) {
    console.error(error);
  }
  // renderHelper()
}

// import { getSiblings, handleInnerAccordionClick } from "./accordianclick";
// Function to handle click on inner accordion titles
export function handleInnerAccordionClick(event) {
  const parent = event.target.parentNode;
  parent.closest('.grey-border').querySelectorAll('.subAccordianContent').forEach((el) => {
    // console.log(event.target);
    if (event.target.closest('.subAccordianContent') === el) {

    } else {
      el.querySelectorAll('.innersubAccordianContent').forEach((each) => {
        each.classList.remove('active');
      });
      el.querySelectorAll('.innerSubAccordianData').forEach((each) => {
        each.style.display = 'none';
      });
    }
  });
  const siblings = getSiblings(parent);

  parent.classList.toggle('active');
  siblings.forEach((sibling) => {
    sibling.classList.remove('active');
  });

  const content = parent.querySelector('.innerSubAccordianData');
  const computedStyle = window.getComputedStyle(content);
  content.style.display = computedStyle.getPropertyValue('display') === 'none' ? 'block' : 'none';

  siblings.forEach((sibling) => {
    const siblingContent = sibling.querySelector('.innerSubAccordianData');
    const siblingComputedStyle = window.getComputedStyle(siblingContent);
    if (siblingComputedStyle.getPropertyValue('display') === 'block') {
      siblingContent.style.display = 'none';
    }
  });

  try {
    const data = {};
    data.click_text = event.target.textContent.trim();
    data.cta_position = event.target.closest('.section').querySelector('.default-content-wrapper').querySelector('h1, h2, h3, h4, h5, h6').textContent.trim();
    ctaClickInteraction(data);
  } catch (error) {
    console.warn(error);
  }
}

// Function to get siblings of an element
export function getSiblings(elem) {
  const siblings = [];
  let sibling = elem.parentNode.firstChild;
  for (; sibling; sibling = sibling.nextSibling) {
    if (sibling.nodeType === 1 && sibling !== elem) {
      siblings.push(sibling);
    }
  }
  return siblings;
}
