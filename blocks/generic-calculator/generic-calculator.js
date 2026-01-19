/**
 * Generic Calculator Block
 * 
 * A flexible, configurable calculator block that supports:
 * - Multiple calculator types (EMI, Eligibility, etc.)
 * - Dynamic input fields with sliders
 * - Real-time calculations
 * - Employment type selection
 * - Results display with images and breakdowns
 */

class GenericCalculator {
  constructor(blockElement) {
    this.block = blockElement;
    this.config = this.loadConfig();
    this.init();
  }

  loadConfig() {
    const config = {
      maindivbackground: this.block.dataset.maindivbackground || 'calculator',
      title: this.block.dataset.title || '',
      subheading: this.block.dataset.subheading || '',
      employmentTypes: {
        salaried: {
          enabled: this.block.dataset.salariedEnabled === 'true',
          label: this.block.dataset.salariedLabel || 'I\'m Salaried',
          icon: this.block.dataset.salariedIcon || '',
          iconAlt: this.block.dataset.salariedIconAlt || ''
        },
        business: {
          enabled: this.block.dataset.businessEnabled === 'true',
          label: this.block.dataset.businessLabel || 'I\'m doing Business',
          icon: this.block.dataset.businessIcon || '',
          iconAlt: this.block.dataset.businessIconAlt || ''
        }
      },
      calculators: {
        emi: {
          enabled: this.block.dataset.emiEnabled === 'true',
          label: this.block.dataset.emiLabel || 'EMI Calculator',
          fields: this.parseEMIConfig()
        },
        eligibility: {
          enabled: this.block.dataset.eligibilityEnabled === 'true',
          label: this.block.dataset.eligibilityLabel || 'Eligibility Calculator',
          fields: this.parseEligibilityConfig()
        }
      },
      results: {
        emiImage: this.block.dataset.emiResultImage || '',
        emiImageMobile: this.block.dataset.emiResultImageMobile || '',
        eligImage: this.block.dataset.eligResultImage || '',
        eligImageMobile: this.block.dataset.eligResultImageMobile || ''
      },
      buttons: {
        button1: {
          text: this.block.dataset.button1Text || 'Talk to loan expert',
          link: this.block.dataset.button1Link || ''
        },
        button2: {
          text: this.block.dataset.button2Text || 'Apply loan now',
          link: this.block.dataset.button2Link || ''
        }
      }
    };
    return config;
  }

  parseEMIConfig() {
    return {
      loanAmount: {
        min: parseInt(this.block.dataset.emiLoanMin) || 500000,
        max: parseInt(this.block.dataset.emiLoanMax) || 50000000,
        step: parseInt(this.block.dataset.emiLoanStep) || 10000,
        default: parseInt(this.block.dataset.emiLoanDefault) || 2500000,
        label: 'Loan amount (Rs.)',
        suffix: '₹'
      },
      tenure: {
        min: parseInt(this.block.dataset.emiTenureMin) || 5,
        max: parseInt(this.block.dataset.emiTenureMax) || 30,
        step: parseInt(this.block.dataset.emiTenureStep) || 1,
        default: parseInt(this.block.dataset.emiTenureDefault) || 10,
        label: 'Loan Tenure (Years)',
        suffix: 'Years'
      },
      rate: {
        min: parseFloat(this.block.dataset.emiRateMin) || 10.5,
        max: parseFloat(this.block.dataset.emiRateMax) || 20,
        step: parseFloat(this.block.dataset.emiRateStep) || 0.1,
        default: parseFloat(this.block.dataset.emiRateDefault) || 11,
        label: 'Interest Rate (% p.a)',
        suffix: '%'
      }
    };
  }

  parseEligibilityConfig() {
    return {
      income: {
        min: parseInt(this.block.dataset.eligIncomeMin) || 20000,
        max: parseInt(this.block.dataset.eligIncomeMax) || 1000000,
        step: parseInt(this.block.dataset.eligIncomeStep) || 10000,
        default: parseInt(this.block.dataset.eligIncomeDefault) || 100000,
        label: 'Gross Monthly Income (Rs.)',
        suffix: '₹'
      },
      otherLoanEMI: {
        min: parseInt(this.block.dataset.eligOtherEMIMin) || 0,
        max: parseInt(this.block.dataset.eligOtherEMIMax) || 500000,
        step: parseInt(this.block.dataset.eligOtherEMIStep) || 5000,
        default: parseInt(this.block.dataset.eligOtherEMIDefault) || 0,
        label: 'Other Loan EMIs (Rs.)',
        suffix: '₹'
      },
      rate: {
        min: parseFloat(this.block.dataset.eligRateMin) || 10.5,
        max: parseFloat(this.block.dataset.eligRateMax) || 20,
        step: parseFloat(this.block.dataset.eligRateStep) || 0.1,
        default: parseFloat(this.block.dataset.eligRateDefault) || 10.5,
        label: 'Interest Rate (% p.a)',
        suffix: '%'
      },
      tenure: {
        min: parseInt(this.block.dataset.eligTenureMin) || 5,
        max: parseInt(this.block.dataset.eligTenureMax) || 30,
        step: parseInt(this.block.dataset.eligTenureStep) || 1,
        default: parseInt(this.block.dataset.eligTenureDefault) || 10,
        label: 'Loan Tenure (Years)',
        suffix: 'Years'
      }
    };
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.block.classList.add('generic-calculator', this.config.maindivbackground);
    
    const html = `
      <div class="calculator-wrapper">
        ${this.renderHeader()}
        ${this.renderEmploymentSelection()}
        ${this.renderCalculatorTabs()}
      </div>
    `;
    
    this.block.innerHTML = html;
  }

  renderHeader() {
    if (!this.config.title && !this.config.subheading) return '';
    
    return `
      <div class="calculator-header">
        ${this.config.title ? `<h2 class="calculator-title">${this.config.title}</h2>` : ''}
        ${this.config.subheading ? `<p class="calculator-subheading">${this.config.subheading}</p>` : ''}
      </div>
    `;
  }

  renderEmploymentSelection() {
    const { salaried, business } = this.config.employmentTypes;
    if (!salaried.enabled && !business.enabled) return '';

    let html = '<div class="employment-selection">';
    
    if (salaried.enabled) {
      html += `
        <button class="employment-tab salaried-tab" data-type="salaried">
          ${salaried.icon ? `<img src="${salaried.icon}" alt="${salaried.iconAlt}" class="employment-icon">` : ''}
          <span>${salaried.label}</span>
        </button>
      `;
    }
    
    if (business.enabled) {
      html += `
        <button class="employment-tab business-tab" data-type="business">
          ${business.icon ? `<img src="${business.icon}" alt="${business.iconAlt}" class="employment-icon">` : ''}
          <span>${business.label}</span>
        </button>
      `;
    }
    
    html += '</div>';
    return html;
  }

  renderCalculatorTabs() {
    const { emi, eligibility } = this.config.calculators;
    if (!emi.enabled && !eligibility.enabled) return '';

    let tabLabels = '';
    let tabContent = '';

    if (emi.enabled) {
      tabLabels += `<button class="tab-button active" data-tab="emi">${emi.label}</button>`;
      tabContent += `
        <div class="tab-content active" id="emi">
          ${this.renderCalculatorFields('emi', emi.fields)}
          <div class="calculator-result" id="emi-result"></div>
        </div>
      `;
    }

    if (eligibility.enabled) {
      tabLabels += `<button class="tab-button" data-tab="eligibility">${eligibility.label}</button>`;
      tabContent += `
        <div class="tab-content" id="eligibility">
          ${this.renderCalculatorFields('eligibility', eligibility.fields)}
          <div class="calculator-result" id="eligibility-result"></div>
        </div>
      `;
    }

    return `
      <div class="calculator-tabs">
        <div class="tab-buttons">${tabLabels}</div>
        <div class="tab-contents">${tabContent}</div>
      </div>
      ${this.renderActionButtons()}
    `;
  }

  renderCalculatorFields(type, fields) {
    let html = '<div class="calculator-fields">';
    
    Object.keys(fields).forEach(fieldKey => {
      const field = fields[fieldKey];
      html += `
        <div class="field-group">
          <label class="field-label">${field.label}</label>
          <div class="field-slider-wrapper">
            <span class="min-value">${this.formatValue(field.min, field.suffix)}</span>
            <input 
              type="range" 
              class="field-slider ${type}-${fieldKey}" 
              data-type="${type}"
              data-field="${fieldKey}"
              min="${field.min}" 
              max="${field.max}" 
              step="${field.step}" 
              value="${field.default}"
            >
            <span class="max-value">${this.formatValue(field.max, field.suffix)}</span>
          </div>
          <div class="field-display">
            <span class="field-value ${type}-${fieldKey}-value">${this.formatValue(field.default, field.suffix)}</span>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }

  renderActionButtons() {
    if (!this.config.buttons.button1.text && !this.config.buttons.button2.text) return '';

    let html = '<div class="calculator-actions">';
    
    if (this.config.buttons.button1.text) {
      html += `
        <a href="${this.config.buttons.button1.link}" class="btn btn-primary" target="_blank">
          ${this.config.buttons.button1.text}
        </a>
      `;
    }
    
    if (this.config.buttons.button2.text) {
      html += `
        <a href="${this.config.buttons.button2.link}" class="btn btn-secondary" target="_blank">
          ${this.config.buttons.button2.text}
        </a>
      `;
    }
    
    html += '</div>';
    return html;
  }

  attachEventListeners() {
    // Tab switching
    this.block.querySelectorAll('.tab-button').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Employment type selection
    this.block.querySelectorAll('.employment-tab').forEach(btn => {
      btn.addEventListener('click', (e) => this.selectEmployment(e.currentTarget.dataset.type));
    });

    // Slider changes
    this.block.querySelectorAll('.field-slider').forEach(slider => {
      slider.addEventListener('input', (e) => this.onSliderChange(e.target));
    });
  }

  switchTab(tabName) {
    // Update button active state
    this.block.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update content visibility
    this.block.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === tabName);
    });

    // Trigger calculation
    this.calculate(tabName);
  }

  selectEmployment(type) {
    this.block.querySelectorAll('.employment-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });
  }

  onSliderChange(slider) {
    const type = slider.dataset.type;
    const field = slider.dataset.field;
    const value = slider.value;

    // Update display value
    const displayElement = this.block.querySelector(`.${type}-${field}-value`);
    if (displayElement) {
      const config = type === 'emi' ? this.config.calculators.emi.fields : this.config.calculators.eligibility.fields;
      const fieldConfig = config[field];
      displayElement.textContent = this.formatValue(value, fieldConfig.suffix);
    }

    // Calculate on change
    this.calculate(type);
  }

  calculate(type) {
    if (type === 'emi') {
      this.calculateEMI();
    } else if (type === 'eligibility') {
      this.calculateEligibility();
    }
  }

  calculateEMI() {
    const loanAmount = parseInt(this.getSliderValue('emi', 'loanAmount'));
    const tenure = parseInt(this.getSliderValue('emi', 'tenure'));
    const rate = parseFloat(this.getSliderValue('emi', 'rate'));

    // EMI Calculation: EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
    const monthlyRate = rate / 100 / 12;
    const numberOfMonths = tenure * 12;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / 
                (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
    
    const totalAmount = emi * numberOfMonths;
    const totalInterest = totalAmount - loanAmount;

    this.displayEMIResult(emi, loanAmount, totalInterest, totalAmount);
  }

  calculateEligibility() {
    const income = parseInt(this.getSliderValue('eligibility', 'income'));
    const otherEMI = parseInt(this.getSliderValue('eligibility', 'otherLoanEMI'));
    const rate = parseFloat(this.getSliderValue('eligibility', 'rate'));
    const tenure = parseInt(this.getSliderValue('eligibility', 'tenure'));

    // Simplified eligibility calculation
    // Typical formula: (Income - Other EMI) * Eligible Ratio / Monthly Rate
    const eligibleRatio = 0.60; // 60% of available income
    const monthlyRate = rate / 100 / 12;
    const numberOfMonths = tenure * 12;
    
    const availableIncome = (income - otherEMI) * eligibleRatio;
    const eligibleAmount = (availableIncome * Math.pow(1 + monthlyRate, numberOfMonths)) / 
                           (monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths));

    this.displayEligibilityResult(Math.max(0, eligibleAmount));
  }

  displayEMIResult(emi, principal, interest, total) {
    const resultDiv = this.block.querySelector('#emi-result');
    if (!resultDiv) return;

    resultDiv.innerHTML = `
      <div class="result-display">
        <h3>Your monthly EMI is</h3>
        <div class="result-amount">₹${Math.round(emi).toLocaleString()}</div>
        <div class="result-breakdown">
          <div class="breakdown-item">
            <span class="breakdown-label">Principal amount</span>
            <span class="breakdown-value">₹${Math.round(principal).toLocaleString()}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Interest amount</span>
            <span class="breakdown-value">₹${Math.round(interest).toLocaleString()}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Total amount</span>
            <span class="breakdown-value">₹${Math.round(total).toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  }

  displayEligibilityResult(amount) {
    const resultDiv = this.block.querySelector('#eligibility-result');
    if (!resultDiv) return;

    resultDiv.innerHTML = `
      <div class="result-display">
        <h3>Your home loan eligibility is</h3>
        <div class="result-amount">₹${Math.round(amount).toLocaleString()}</div>
        <p class="result-note">Based on current income and obligations</p>
      </div>
    `;
  }

  getSliderValue(calculatorType, fieldName) {
    const slider = this.block.querySelector(`.${calculatorType}-${fieldName}`);
    return slider ? slider.value : 0;
  }

  formatValue(value, suffix) {
    const num = parseFloat(value);
    let formatted = '';

    if (suffix === '₹') {
      if (num >= 10000000) {
        formatted = (num / 10000000).toFixed(1) + ' Cr';
      } else if (num >= 100000) {
        formatted = (num / 100000).toFixed(1) + ' L';
      } else {
        formatted = num.toLocaleString();
      }
      return formatted;
    } else if (suffix === '%') {
      return num.toFixed(2) + '%';
    } else if (suffix === 'Years') {
      return num + ' ' + suffix;
    }
    return num.toString();
  }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.block.generic-calculator').forEach(block => {
      new GenericCalculator(block);
    });
  });
} else {
  document.querySelectorAll('.block.generic-calculator').forEach(block => {
    new GenericCalculator(block);
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GenericCalculator;
}
