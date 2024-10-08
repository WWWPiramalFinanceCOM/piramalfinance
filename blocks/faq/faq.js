import { faqInteraction } from '../../dl.js';
import { decorateAnchorTag } from '../../scripts/scripts.js';

export default function decorate(block) {
  // decorateAnchorTag(block);
  let count = 0;
  let className = '';
  block.id = 'faq';
  const parents = Array.from(block.querySelector('h2').parentElement.children);
  let wrapper;
  parents.forEach((eachEl, index) => {
    if (eachEl instanceof HTMLHeadingElement) {
      wrapper && block.append(wrapper);
      wrapper = document.createElement('div');
      wrapper.id = `accordian${index}`;
      // wrapper.classList.add('');
      wrapper.append(eachEl);
      className = `accordian-${count++}`;
      eachEl.classList.add(className);
      eachEl.classList.add('faq-head');
      eachEl.addEventListener('click', (e) => {
        block.querySelectorAll('.faq-head').forEach((el) => {
          if (el !== eachEl) {
            el.classList.remove('accord-active');
          }
        });
        eachEl.classList.toggle('accord-active');
        block.querySelectorAll('.accordian,[aria-hidden="false"]').forEach((eachLi) => {
          if (eachLi.classList[1] !== e.target.classList[0]) {
            eachLi.setAttribute('aria-hidden', 'true');
          }
        });
        block.querySelectorAll(`.${e.target.classList[0]}`).forEach((eachLi) => {
          if (eachEl !== eachLi) {
            toggleHidden(eachLi);
          }
        });
        block.querySelectorAll('h6').forEach((ele) => {
          ele.classList.remove('active');
        });

        try {
          const dataAnalytics = {};
          dataAnalytics.click_text = e.target.textContent.trim();
          faqInteraction(dataAnalytics);
        } catch (error) {
          console.warn(error);
        }
      });
    } else {
      wrapper.append(eachEl);
      eachEl.classList.add('accordian', className);
      toggleHidden(eachEl);
      toggleList(eachEl);
    }
  });
  wrapper && block.append(wrapper);
}

function toggleList(el) {
  el.querySelectorAll('li').forEach((eachLi) => {
    eachLi.querySelectorAll('ul').forEach((eachUl) => {
      toggleHidden(eachUl);
      eachLi.querySelector('ul') && eachLi.addEventListener('click', (e) => {
        if (!(e.target instanceof HTMLLIElement)) {
          eachLi.closest('ul').querySelectorAll('ul').forEach((li) => {
            if (e.target.nextElementSibling !== li) {
              li.previousElementSibling.classList.remove('active');
              li.setAttribute('aria-hidden', 'true');
            }
          });
          e.target.classList.toggle('active');
          toggleHidden(eachUl);

          try {
            const dataAnalytics = {};
            dataAnalytics.click_text = e.target.textContent.trim();
            faqInteraction(dataAnalytics);
          } catch (error) {
            console.warn(error);
          }
        }
      });
    });
  });
}

function toggleHidden(el) {
  const val = el.getAttribute('aria-hidden') != 'true' ? 'true' : 'false';
  el.setAttribute('aria-hidden', val);
}
