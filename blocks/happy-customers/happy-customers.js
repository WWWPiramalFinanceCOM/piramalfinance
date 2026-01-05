import { getProps, renderHelper } from '../../scripts/common.js';
import { happyCustomersTemplate, customerCardTemplate } from './template.js';

export default async function decorate(block) {
  const props = getProps(block);
  const [
    title, 
    rotationTime, 
    ribbonImg1, ribbonImg2, ribbonImg3, ribbonImg4,
    customer1Image, customer1Testimonial,
    ...additionalCustomersData
  ] = props;
  
  block.innerHTML = '';
  
  let mainTemplate = happyCustomersTemplate;
  const cardTemplate = customerCardTemplate;
  
  // Start with mandatory first customer
  const customersData = [
    {
      customerImage: customer1Image,
      customerTestimonial: customer1Testimonial,
      customerId: 'customer1',
      customerClass: 'customer-one'
    }
  ];
  
  // Process additional customers (multifield data)
  // additionalCustomersData comes as pairs: [image2, testimonial2, image3, testimonial3, ...]
  if (additionalCustomersData && additionalCustomersData.length > 0) {
    const customerClasses = ['customer-two', 'customer-three', 'customer-four', 'customer-five'];
    
    for (let i = 0; i < additionalCustomersData.length; i += 2) {
      const customerImage = additionalCustomersData[i];
      const customerTestimonial = additionalCustomersData[i + 1];
      
      if (customerImage && customerTestimonial) {
        const customerIndex = Math.floor(i / 2);
        if (customerIndex < 4) { // Max 4 additional customers (total 5)
          customersData.push({
            customerImage,
            customerTestimonial,
            customerId: `customer${customerIndex + 2}`,
            customerClass: customerClasses[customerIndex]
          });
        }
      }
    }
  }
  
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
