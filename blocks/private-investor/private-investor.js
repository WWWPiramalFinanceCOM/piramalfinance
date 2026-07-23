export default function decorate(block) {
    if(window.location.href.includes("author")) return
  const form = document.createElement('form');
  form.className = 'private-investor-form';

  let itemIndex = 1; // Counter to generate exact structural classes for CSS

  // --- 1. Generate Form Elements ---
  [...block.children].forEach((row) => {
    const container = row.firstElementChild;
    if (!container || container.children.length === 0) return; 

    const paragraphs = container.children;
    const elementType = paragraphs[0]?.textContent.trim();

    const fieldWrapper = document.createElement('div');
    // Inject structural class (e.g., layout-item-1, layout-item-2)
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

  // --- 2. Add Error & Results Containers ---
  const errorBox = document.createElement('div');
  errorBox.className = 'form-error-box';
  errorBox.style.display = 'none'; // Hidden by default
  form.prepend(errorBox);

  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'results-container';

  block.textContent = '';
  block.append(form);
  block.append(resultsContainer);

  // --- 3. Form Submission & Validation ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    errorBox.style.display = 'none';
    resultsContainer.innerHTML = ''; 

    const apiPath = form.action;
    if (!apiPath) {
      console.error('No API path configured in AEM.');
      return;
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    // Validation Logic
    const panVal = payload['pan'] ? payload['pan'].trim() : '';
    const nameVal = payload['name'] ? payload['name'].trim() : '';
    const dpIdVal = payload['dematId'] ? payload['dematId'].trim() : '';

    if (!panVal) {
      showError('PAN is mandatory. Please enter your PAN number.');
      return;
    }
    if (!nameVal && !dpIdVal) {
      showError('Please provide either the Holder Name OR the DP ID.');
      return;
    }

    const submitBtn = form.querySelector('.btn-submit');
    const originalBtnHTML = submitBtn.innerHTML;

    try {
      if (submitBtn) {
        submitBtn.innerHTML = 'Searching...';
        submitBtn.disabled = true;
      }

      // API Call
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
          showError('No records found for the provided details.');
        }
      } else {
        showError('Failed to fetch data. Please try again later.');
      }
    } catch (error) {
      console.error('API Error:', error);
      showError('A network error occurred. Please check your connection.');
    } finally {
      if (submitBtn) {
        submitBtn.innerHTML = originalBtnHTML;
        submitBtn.disabled = false;
      }
    }
  });

  // --- 4. Helper Functions ---
  function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = 'block';
  }

  function renderTable(dataArray, container) {
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-responsive-wrapper';

    const table = document.createElement('table');
    table.className = 'dividend-results-table';

    const headers = Object.keys(dataArray[0]);

    // Build Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText.toUpperCase();
      headerRow.append(th);
    });
    thead.append(headerRow);
    table.append(thead);

    // Build Body
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