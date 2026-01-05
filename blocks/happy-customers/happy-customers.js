import { getProps, renderHelper } from '../../scripts/common.js';
import { happyCustomersTemplate, customerCardTemplate } from './template.js';

export default async function decorate(block) {
  const props = getProps(block);
  const [
    title, 
    rotationTime, 
    ribbonImg1, ribbonImg2, ribbonImg3, ribbonImg4,
    customer1Image, customer1Details, customer1Name, customer1Profession,
    customer2Image, customer2Details, customer2Name, customer2Profession,
    customer3Image, customer3Details, customer3Name, customer3Profession,
    customer4Image, customer4Details, customer4Name, customer4Profession,
    customer5Image, customer5Details, customer5Name, customer5Profession
  ] = props;
  
  block.innerHTML = '';
  
  let mainTemplate = happyCustomersTemplate;
  const cardTemplate = customerCardTemplate;
  
  // Create customer data array from authorable fields
  const customersData = [
    {
      customerImage: customer1Image,
      customerDetails: customer1Details,
      customerName: customer1Name,
      customerProfession: customer1Profession,
      customerId: 'customer1',
      customerClass: 'customer-one'
    },
    {
      customerImage: customer2Image,
      customerDetails: customer2Details,
      customerName: customer2Name,
      customerProfession: customer2Profession,
      customerId: 'customer2',
      customerClass: 'customer-two'
    },
    {
      customerImage: customer3Image,
      customerDetails: customer3Details,
      customerName: customer3Name,
      customerProfession: customer3Profession,
      customerId: 'customer3',
      customerClass: 'customer-three'
    },
    {
      customerImage: customer4Image,
      customerDetails: customer4Details,
      customerName: customer4Name,
      customerProfession: customer4Profession,
      customerId: 'customer4',
      customerClass: 'customer-four'
    },
    {
      customerImage: customer5Image,
      customerDetails: customer5Details,
      customerName: customer5Name,
      customerProfession: customer5Profession,
      customerId: 'customer5',
      customerClass: 'customer-five'
    }
  ];
  
  // Generate customer cards
  const cards = renderHelper(customersData, cardTemplate);
  
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
