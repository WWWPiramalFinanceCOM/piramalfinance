import { fetchAPI, getProps, renderHelper } from '../../scripts/common.js';
import { happyCustomersTemplate, customerCardTemplate } from './template.js';

export default async function decorate(block) {
  const props = getProps(block);
  const [title, dataUrl, rotationTime, ribbonImg1, ribbonImg2, ribbonImg3, ribbonImg4, customClass] = props;
  
  if (customClass) {
    block.classList.add(customClass);
  }
  
  block.innerHTML = '';
  
  let mainTemplate = happyCustomersTemplate;
  const cardTemplate = customerCardTemplate;
  
  try {
    const resp = await fetchAPI('GET', dataUrl);
    const data = await resp.json();
    
    // Generate customer cards
    const cards = renderHelper(data.data, cardTemplate);
    
    // Replace placeholders in main template
    mainTemplate = mainTemplate
      .replace('{title}', title || 'Our Happy Customers')
      .replace('{ribbonImg1}', ribbonImg1 || '')
      .replace('{ribbonImg2}', ribbonImg2 || '')
      .replace('{ribbonImg3}', ribbonImg3 || '')
      .replace('{ribbonImg4}', ribbonImg4 || '')
      .replace('{rotationTime}', rotationTime || '5000');
    
    // Render the block
    block.innerHTML = renderHelper([{ cards }], mainTemplate);
    
    // Initialize rotation functionality
    initializeRotation(rotationTime || 5000);
    
  } catch (error) {
    console.warn('Error loading happy customers data:', error);
  }
}

function initializeRotation(time) {
  const timeValue = parseInt(time, 10);
  
  if (timeValue && timeValue > 0) {
    setInterval(() => {
      rotateCustomers();
    }, timeValue);
  }
}

function rotateCustomers() {
  const customerDivs = document.querySelectorAll('.happy-customer-card');
  const customerDataArray = [];
  
  customerDivs.forEach((div) => {
    const customerData = {
      imageSrc: div.querySelector('.customer-image').src,
      details: div.querySelector('.customer-details').textContent,
      name: div.querySelector('.customer-name').textContent,
      profession: div.querySelector('.customer-profession').textContent,
    };
    customerDataArray.push(customerData);
  });
  
  // Rotate array
  const lastItem = customerDataArray.pop();
  customerDataArray.unshift(lastItem);
  
  // Update DOM
  customerDivs.forEach((div, i) => {
    div.querySelector('.customer-image').src = customerDataArray[i].imageSrc;
    div.querySelector('.customer-details').textContent = customerDataArray[i].details;
    div.querySelector('.customer-name').textContent = customerDataArray[i].name;
    div.querySelector('.customer-profession').textContent = customerDataArray[i].profession;
  });
}
