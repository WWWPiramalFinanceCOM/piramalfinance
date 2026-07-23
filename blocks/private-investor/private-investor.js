export default function decorate(block) {
    // 1. Set default button texts (in case the author leaves them blank)
    let submitText = 'Submit';
    let clearText = 'Clear';

    // 2. Create the form wrapper
    const form = document.createElement('form');
    form.className = 'private-investor-form';

    // 3. Iterate through all the rows rendered by AEM
    [...block.children].forEach((row) => {
        const columns = row.children;

        // --- HANDLE PARENT FIELDS (Button Texts) ---
        // In AEM EDS, parent configurations often render as 2-column key/value rows
        if (columns.length === 2) {
            const key = columns[0].textContent.trim().toLowerCase();
            const value = columns[1].textContent.trim();

            if (key === 'submit button text' && value !== '') submitText = value;
            if (key === 'clear button text' && value !== '') clearText = value;
            return; // Move to the next row
        }

        // --- HANDLE CHILD FIELDS (Form Inputs/Text) ---
        // Your child model has 4 fields, so it will render with at least 3-4 columns
        if (columns.length >= 3) {
            const elementType = columns[0].textContent.trim();
            const fieldName = columns[1].textContent.trim();
            const labelText = columns[2].textContent.trim();
            const placeholder = columns[3] ? columns[3].textContent.trim() : '';

            const fieldWrapper = document.createElement('div');
            fieldWrapper.className = 'form-field-wrapper';

            if (elementType === 'text_input') {
                // Create Label
                if (labelText) {
                    const labelEl = document.createElement('label');
                    labelEl.textContent = labelText;
                    labelEl.setAttribute('for', fieldName);
                    fieldWrapper.append(labelEl);
                }

                // Create Input
                const inputEl = document.createElement('input');
                inputEl.type = 'text';
                inputEl.id = fieldName;
                inputEl.name = fieldName; // Dynamically assigns the authored name attribute
                if (placeholder) inputEl.placeholder = placeholder;

                fieldWrapper.append(inputEl);
                form.append(fieldWrapper);
            }
            else if (elementType === 'static_text') {
                // Create Static Text
                const textEl = document.createElement('p');
                textEl.className = 'form-static-text';
                textEl.textContent = labelText;

                fieldWrapper.append(textEl);
                form.append(fieldWrapper);
            }
        }
    });

    // 4. Create and append the dynamic Submit and Clear buttons
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'form-button-group';

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn-submit';
    submitBtn.textContent = submitText;

    const clearBtn = document.createElement('button');
    clearBtn.type = 'reset';
    clearBtn.className = 'btn-clear';
    clearBtn.textContent = clearText;

    buttonGroup.append(submitBtn, clearBtn);
    form.append(buttonGroup);

    // 5. Clear the raw authored block and append the constructed form
    block.textContent = '';
    block.append(form);
}