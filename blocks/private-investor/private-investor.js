export default function decorate(block) {
  if(window.location.href.includes("author")) return;

  const form = document.createElement('form');
  form.className = 'private-investor-form';

  let itemIndex = 1; 

  // --- 1. Generate Form Elements ---
  [...block.children].forEach((row) => {
    const container = row.firstElementChild;
    if (!container || container.children.length === 0) return; 

    const paragraphs = container.children;
    const elementType = paragraphs[0]?.textContent.trim();

    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = `form-field-wrapper type-${elementType} layout-item-${itemIndex}`;
    itemIndex++; 

    // Handle Text Inputs
    if (elementType === 'text_input') {
      const fieldName = paragraphs[1]?.textContent.trim();
      const labelText = paragraphs[2]?.textContent.trim();
      const placeholder = paragraphs[3]?.textContent.trim();

      if (labelText) {
        const labelEl = document.createElement('label');
        labelEl.textContent = labelText;
        if (fieldName) labelEl.setAttribute('for', fieldName);
        fieldWrapper.append(labelEl);
      }

      const inputEl = document.createElement('input');
      inputEl.type = 'text';
      inputEl.className = 'form-input';
      if (fieldName) {
        inputEl.id = fieldName;
        inputEl.name = fieldName; 
      }
      if (placeholder) inputEl.placeholder = placeholder;
      
      fieldWrapper.append(inputEl);
      form.append(fieldWrapper);
    } 
    // Handle Static Text (AND / OR)
    else if (elementType === 'static_text') {
      const labelText = paragraphs[1]?.textContent.trim();
      if (labelText.toUpperCase().includes('OR')) {
        fieldWrapper.classList.add('field-static-or');
      } else {
        fieldWrapper.classList.add('field-static-and');
      }

      const textEl = document.createElement('p');
      textEl.className = 'form-static-text';
      textEl.textContent = labelText; 
      
      fieldWrapper.append(textEl);
      form.append(fieldWrapper);
    }
    // Handle Submit Button
    else if (elementType === 'submit') {
      fieldWrapper.classList.add('field-submit');
      const labelText = paragraphs[1]?.textContent.trim() || 'Search';
      const linkEl = paragraphs[2]?.querySelector('a');
      const apiPath = linkEl ? linkEl.href : paragraphs[2]?.textContent.trim();

      if (apiPath) form.action = apiPath; 

      const submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.className = 'btn-submit';
      submitBtn.innerHTML = `${labelText} <span class="arrow-icon">↗</span>`; 

      fieldWrapper.append(submitBtn);
      form.append(fieldWrapper);
    }
  });

  // --- 2. Add General Error (for API) & Results Containers ---
  const generalErrorBox = document.createElement('div');
  generalErrorBox.className = 'form-error-box general-error';
  generalErrorBox.style.display = 'none'; 
  
  const submitWrapper = form.querySelector('.field-submit');
  if (submitWrapper) {
    form.insertBefore(generalErrorBox, submitWrapper);
  } else {
    form.append(generalErrorBox);
  }

  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'results-container';

  block.textContent = '';
  block.append(form);
  block.append(resultsContainer);

  // --- 3. Form Submission & Validation ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    // Clear all previous errors and results
    generalErrorBox.style.display = 'none';
    form.querySelectorAll('.inline-error-msg').forEach(el => el.remove());
    resultsContainer.innerHTML = ''; 

    const apiPath = form.action;
    if (!apiPath) {
      console.error('No API path configured in AEM.');
      return;
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const panVal = payload['pan'] ? payload['pan'].trim() : '';
    const nameVal = payload['name'] ? payload['name'].trim() : '';
    const dpIdVal = (payload['dematId'] || payload['dp-id'] || '').trim();

    let hasValidationErrors = false;

    // 1. PAN Validation (Appears inside PAN wrapper)
    if (!panVal) {
      const panWrapper = form.querySelector('.layout-item-1');
      const err = document.createElement('div');
      err.className = 'inline-error-msg';
      err.textContent = 'PAN is mandatory. Please enter your PAN number.';
      panWrapper.append(err);
      hasValidationErrors = true;
    }

    // 2. Name / DP ID Validation (Appears across the whole row below them)
    if (!nameVal && !dpIdVal) {
      const dpIdWrapper = form.querySelector('.layout-item-5');
      const err = document.createElement('div');
      err.className = 'inline-error-msg full-width-row';
      err.textContent = 'Please provide either the Holder Name OR the DP ID.';
      // Insert after layout-item-5 so it breaks to the next line in the flex container
      dpIdWrapper.insertAdjacentElement('afterend', err);
      hasValidationErrors = true;
    }

    // Stop submission if validation failed
    if (hasValidationErrors) return;

    const submitBtn = form.querySelector('.btn-submit');
    const originalBtnHTML = submitBtn.innerHTML;

    try {
      if (submitBtn) {
        submitBtn.innerHTML = 'Searching...';
        submitBtn.disabled = true;
      }

      const response = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseData = await response.json();
        
        if (responseData.status === true && responseData.data && responseData.data.length > 0) {
          renderTable(responseData.data, resultsContainer);
        } else {
          showGeneralError(responseData.message || 'No records found for the provided details.');
        }
      } else {
        showGeneralError('Failed to fetch data. Please try again later.');
      }
    } catch (error) {
      console.error('API Error:', error);
      showGeneralError('A network error occurred. Please check your connection.');
    } finally {
      if (submitBtn) {
        submitBtn.innerHTML = originalBtnHTML;
        submitBtn.disabled = false;
      }
    }
  });

  // --- 4. Helper Functions ---
  function showGeneralError(message) {
    generalErrorBox.textContent = message;
    generalErrorBox.style.display = 'block';
  }

  function renderTable(dataArray, container) {
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-responsive-wrapper';

    const table = document.createElement('table');
    table.className = 'dividend-results-table';

    const headers = Object.keys(dataArray[0]);

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText.toUpperCase();
      headerRow.append(th);
    });
    thead.append(headerRow);
    table.append(thead);

    const tbody = document.createElement('tbody');
    dataArray.forEach(row => {
      const tr = document.createElement('tr');
      headers.forEach(key => {
        const td = document.createElement('td');
        td.textContent = row[key] !== null && row[key] !== '' ? row[key] : '-'; 
        tr.append(td);
      });
      tbody.append(tr);
    });
    table.append(tbody);

    tableWrapper.append(table);
    container.append(tableWrapper);
  }
}