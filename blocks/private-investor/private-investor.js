export default function decorate(block) {
    if (window.location.href.includes("author")) return;

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

        // Capture form data directly
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        const panVal = payload['pan'] ? payload['pan'].trim() : '';
        const nameVal = payload['name'] ? payload['name'].trim() : '';
        const dpIdVal = (payload['dematId'] || payload['dematId'] || '').trim();

        let hasValidationErrors = false;

        // PAN Validation
        if (!panVal) {
            const panWrapper = form.querySelector('.layout-item-1');
            const err = document.createElement('div');
            err.className = 'inline-error-msg';
            err.textContent = 'PAN is mandatory. Please enter your PAN number.';
            panWrapper.append(err);
            hasValidationErrors = true;
        }

        // Name / DP ID Validation
        if (!nameVal && !dpIdVal) {
            const dpIdWrapper = form.querySelector('.layout-item-5');
            const err = document.createElement('div');
            err.className = 'inline-error-msg full-width-row';
            err.textContent = 'Please provide either the Holder Name OR the DP ID.';
            dpIdWrapper.insertAdjacentElement('afterend', err);
            hasValidationErrors = true;
        }

        if (hasValidationErrors) return;

        const submitBtn = form.querySelector('.btn-submit');
        const originalBtnHTML = submitBtn.innerHTML;

        try {
            if (submitBtn) {
                submitBtn.innerHTML = 'Searching...';
                submitBtn.disabled = true;
            }

            // Send raw formData object without Content-Type header (for multipart/form-data)
            const response = await fetch(apiPath, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const responseData = await response.json();

                if (responseData.status === true && responseData.data && responseData.data.length > 0) {
                    form.reset();
                    renderDivTable(responseData.data, resultsContainer);
                } else {
                    // Renders the grey box below the button for "Data Not Found"
                    renderEmptyState(responseData.message || 'Data Not Found', resultsContainer);
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

    function renderEmptyState(message, container) {
        const emptyBox = document.createElement('div');
        emptyBox.className = 'empty-data-box';
        emptyBox.textContent = message;
        container.append(emptyBox);
    }

    // --- DIV-BASED TABLE LAYOUT ---
    function renderDivTable(dataArray, container) {
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'table-responsive-wrapper';

        const divTable = document.createElement('div');
        divTable.className = 'div-table';

        const headers = Object.keys(dataArray[0]);

        // Build Header Row
        const headerRow = document.createElement('div');
        headerRow.className = 'div-table-row div-table-header';
        headers.forEach(headerText => {
            const cell = document.createElement('div');
            cell.className = 'div-table-cell header-cell';
            cell.textContent = headerText.toUpperCase();
            headerRow.append(cell);
        });
        divTable.append(headerRow);

        // Build Data Rows
        dataArray.forEach(row => {
            const dataRow = document.createElement('div');
            dataRow.className = 'div-table-row';
            headers.forEach(key => {
                const cell = document.createElement('div');
                cell.className = 'div-table-cell';
                cell.textContent = row[key] !== null && row[key] !== '' ? row[key] : '-';
                dataRow.append(cell);
            });
            divTable.append(dataRow);
        });

        tableWrapper.append(divTable);
        container.append(tableWrapper);
    }
}