import { getProps, renderHelper } from '../../scripts/common.js';
import { happyCustomersTemplate, customerCardTemplate } from './template.js';

export default async function decorate(block) {
  const props = getProps(block);
  const [
    title, 
    rotationTime, 
    ribbonImg1, ribbonImg2, ribbonImg3, ribbonImg4,
    customer1Image, customer1Testimonial,
    customer2Image, customer2Testimonial,
    customer3Image, customer3Testimonial,
    customer4Image, customer4Testimonial,
    customer5Image, customer5Testimonial
  ] = props;
  
  block.innerHTML = '';
  
  let mainTemplate = happyCustomersTemplate;
  const cardTemplate = customerCardTemplate;
  
  // Create customer data array from authorable fields
  const customersData = [
    {
      customerImage: customer1Image,
      customerTestimonial: customer1Testimonial,
      customerId: 'customer1',
      customerClass: 'customer-one'
    },
    {
      customerImage: customer2Image,
      customerTestimonial: customer2Testimonial,
      customerId: 'customer2',
      customerClass: 'customer-two'
    },
    {
      customerImage: customer3Image,
      customerTestimonial: customer3Testimonial,
      customerId: 'customer3',
      customerClass: 'customer-three'
    },
    {
      customerImage: customer4Image,
      customerTestimonial: customer4Testimonial,
      customerId: 'customer4',
      customerClass: 'customer-four'
    },
    {
      customerImage: customer5Image,
      customerTestimonial: customer5Testimonial,
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
      testimonialHTML: div.querySelector('.testimonial-content').innerHTML,
    };
    customerDataArray.push(customerData);
  });
  
  // Rotate array
  const lastItem = customerDataArray.pop();
  customerDataArray.unshift(lastItem);
  
  // Update DOM
  customerDivs.forEach((div, i) => {
    div.querySelector('.customer-image').src = customerDataArray[i].imageSrc;
    div.querySelector('.testimonial-content').innerHTML = customerDataArray[i].testimonialHTML;
  });
}
