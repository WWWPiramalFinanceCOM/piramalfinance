import { fetchAPI, getProps, renderHelper } from '../../scripts/common.js';
import { customerTemplateCopy, customerCardCopy } from './template.js';

export default async function decorate(block) {
  const props = getProps(block);
  const [url, time, ribbononeimg, ribbontwoimg, ribbonthreeimg, ribbonfourimg, classess] = props;
  block.classList.add(classess);
  block.innerHTML = '';
  let customerTemplate = customerTemplateCopy;
  const customerCard = customerCardCopy;
  try {
    const resp = await fetchAPI('GET', url);
    const data = await resp.json();

    const cards = renderHelper(
      data.data,
      customerCard,
    );

    customerTemplate = customerTemplate.replace('{ribbononeimg}', ribbononeimg).replace('{ribbontwoimg}', ribbontwoimg).replace('{ribbonthreeimg}', ribbonthreeimg).replace('{ribbonfourimg}', ribbonfourimg);
    block.innerHTML = renderHelper([
      {
        cards,
      },
    ], customerTemplate);
  } catch (error) {
    console.warn(error);
  }

  function rotateData() {
    const customerDivs = document.querySelectorAll('.customer-info');
    const customerDataArray = [];

    customerDivs.forEach((div) => {
      const customerData = {
        imageSrc: div.querySelector('.personimg').src,
        description: div.querySelector('.comments .custinfo').textContent,
        name: div.querySelector('.comments .custname').textContent,
        custprofession: div.querySelector('.comments .custprofession').textContent,
      };
      customerDataArray.push(customerData);
    });
    rotateCustomerDataArray(customerDataArray);
  }
  if (time) {
    // var timevalue = time;
    if (typeof time === 'number') {
      time = parseInt(time);
    }
    setInterval(() => {
      rotateData();
    }, time);
  }

  function rotateCustomerDataArray(customerDataArray) {
    const lastItem = customerDataArray.pop();

    for (let i = customerDataArray.length - 1; i >= 0; i--) {
      customerDataArray[i + 1] = customerDataArray[i];
    }

    customerDataArray[0] = lastItem;

    renderData(customerDataArray);
  }

  function renderData(array) {
    const customerDivs = document.querySelectorAll('.customer-info');
    customerDivs.forEach((e, i) => {
      e.querySelector('.personimg').src = array[i].imageSrc;
      e.querySelector('.comments .custinfo').textContent = array[i].description;
      e.querySelector('.comments .custname').textContent = array[i].name;
      e.querySelector('.comments .custprofession').textContent = array[i].custprofession;
    });
  }
}
