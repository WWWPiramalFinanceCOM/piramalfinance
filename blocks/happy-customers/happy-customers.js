import { getProps, renderHelper } from '../../scripts/common.js';
import { happyCustomersTemplate, customerCardTemplate } from './template.js';

export default async function decorate(block) {
  const props = getProps(block);
  
  // Debug: Log all props to see the data structure
  console.log('Happy Customers Props:', props);
  
  // Extract all props - multifield container will be one of the props
  const title = props[0];
  const rotationTime = props[1];
  const ribbonImg1 = props[2];
  const ribbonImg2 = props[3];
  const ribbonImg3 = props[4];
  const ribbonImg4 = props[5];
  const customer1Image = props[6];
  const customer1Testimonial = props[7];
  const additionalCustomersContainer = props[8]; // This will be the container object or array
  
  console.log('Additional Customers Container:', additionalCustomersContainer);
  console.log('All props length:', props.length);
  
  block.innerHTML = '';
  
  let mainTemplate = happyCustomersTemplate;
  const cardTemplate = customerCardTemplate;
  
  // Start with mandatory first customer
  const customersData = [];
  
  if (customer1Image && customer1Testimonial) {
    customersData.push({
      customerImage: customer1Image,
      customerTestimonial: customer1Testimonial,
      customerId: 'customer1',
      customerClass: 'customer-one'
    });
  }
  
  // Process additional customers from multifield container
  // The container might be an array of objects or a string that needs parsing
  if (additionalCustomersContainer) {
    const customerClasses = ['customer-two', 'customer-three', 'customer-four', 'customer-five'];
    let additionalCustomers = [];
    
    // Handle if it's already an array
    if (Array.isArray(additionalCustomersContainer)) {
      additionalCustomers = additionalCustomersContainer;
    } 
    // Handle if it's an object with array property
    else if (typeof additionalCustomersContainer === 'object' && additionalCustomersContainer.items) {
      additionalCustomers = additionalCustomersContainer.items;
    }
    // Handle if remaining props are the additional customers (fallback)
    else {
      // Collect remaining props as pairs
      for (let i = 8; i < props.length; i += 2) {
        if (props[i] && props[i + 1]) {
          additionalCustomers.push({
            customerImage: props[i],
            customerTestimonial: props[i + 1]
          });
        }
      }
    }
    
    // Add each additional customer
    additionalCustomers.forEach((customer, index) => {
      if (index < 4 && customer.customerImage && customer.customerTestimonial) {
        customersData.push({
          customerImage: customer.customerImage,
          customerTestimonial: customer.customerTestimonial,
          customerId: `customer${index + 2}`,
          customerClass: customerClasses[index]
        });
      }
    });
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
