# EMI & Eligibility Calculator Block - Author Guide

This guide explains all the authorable fields available in the **EMI and Eligibility Calculator** block.

## Overview
The EMI & Eligibility Calculator block provides two separate calculators that allow users to:
1. **EMI Calculator** - Calculate monthly EMI based on loan amount, tenure, and interest rate
2. **Eligibility Calculator** - Check loan eligibility based on income, existing loans, and tenure

## Field Categories

### General Settings

#### Main Div Background Class
- **Field Name:** `maindivbackground`
- **Default Value:** `emi`
- **Description:** Sets the CSS class for the main calculator container. This controls styling and layout.
- **Example Values:** `emi`, `calculator`, `primary`

#### Calculator Title
- **Field Name:** `title`
- **Default Value:** (empty)
- **Description:** The main heading/title of the calculator block
- **Example:** "Home Loan Calculator"

#### Main Heading CSS Class
- **Field Name:** `mainheadingclass`
- **Default Value:** (empty)
- **Description:** Additional CSS classes to apply to the main heading for custom styling

#### Sub Heading
- **Field Name:** `subheading`
- **Default Value:** "Calculate EMI & Check eligibility"
- **Description:** Secondary text displayed below the main title
- **Example:** "Calculate your EMI and check loan eligibility instantly"

#### Sub Heading Two (Optional)
- **Field Name:** `subheadingtow`
- **Default Value:** (empty)
- **Description:** Optional additional subheading for extra context

---

## Employment Type Selection

### Salaried Employment Option

#### Show Salaried Option
- **Field Name:** `checkbox-employment-salaried`
- **Type:** Yes/No
- **Default Value:** Yes
- **Description:** Enable/disable the salaried employment tab

#### Salaried Tab Label
- **Field Name:** `salariedtabtext`
- **Default Value:** "I'm Salaried"
- **Description:** Text displayed on the salaried employment tab button

#### Salaried Tab Icon
- **Field Name:** `calculatorsalariedimg`
- **Default Value:** `/images/calculator-salaried.svg`
- **Description:** Image/icon path for the salaried tab. Upload your SVG or image file.
- **Recommended:** Use SVG format for better scalability

#### Salaried Tab Icon Alt Text
- **Field Name:** `calculatorsalariedimgalt`
- **Default Value:** `salaried`
- **Description:** Alt text for accessibility (screen readers)

### Business Employment Option

#### Show Business Option
- **Field Name:** `checkbox-employment-business`
- **Type:** Yes/No
- **Default Value:** Yes
- **Description:** Enable/disable the business employment tab

#### Business Tab Label
- **Field Name:** `businesstabtext`
- **Default Value:** "I'm doing Business"
- **Description:** Text displayed on the business employment tab button

#### Business Tab Icon
- **Field Name:** `calculatorbusinessimg`
- **Default Value:** `/images/calculator-business.svg`
- **Description:** Image/icon path for the business tab

#### Business Tab Icon Alt Text
- **Field Name:** `calculatorbusinessimgalt`
- **Default Value:** `business`
- **Description:** Alt text for accessibility

---

## Calculator Tab Configuration

#### First Tab Name (EMI)
- **Field Name:** `firsttabbname`
- **Default Value:** "EMI Calculator"
- **Description:** Label for the EMI calculator tab

#### Second Tab Name (Eligibility)
- **Field Name:** `secondtabbname`
- **Default Value:** "Eligibility Calculator"
- **Description:** Label for the eligibility calculator tab

#### Third Tab Name (Optional)
- **Field Name:** `thridtabname`
- **Default Value:** (empty)
- **Description:** Optional label for a third tab if needed

---

## EMI Calculator Configuration

### Enable EMI Calculator
- **Field Name:** `emi-calculator-enabled`
- **Type:** Yes/No
- **Default Value:** Yes
- **Description:** Enable/disable the EMI calculator tab

### Loan Amount Slider

#### Minimum Loan Amount
- **Field Name:** `emiloanamountmin`
- **Default Value:** `500000` (5 Lakhs)
- **Unit:** Rupees
- **Description:** Minimum selectable loan amount

#### Maximum Loan Amount
- **Field Name:** `emiloanamountmax`
- **Default Value:** `50000000` (5 Crores)
- **Unit:** Rupees
- **Description:** Maximum selectable loan amount

#### Loan Amount Step
- **Field Name:** `emiloanamountstep`
- **Default Value:** `10000`
- **Unit:** Rupees
- **Description:** Increment/decrement value when adjusting the slider

#### Default Loan Amount
- **Field Name:** `emiloanamountdefault`
- **Default Value:** `2500000` (25 Lakhs)
- **Unit:** Rupees
- **Description:** Initial value when calculator loads

### Tenure Slider (Years)

#### Minimum Tenure
- **Field Name:** `emitenuremin`
- **Default Value:** `5`
- **Unit:** Years
- **Description:** Minimum loan tenure

#### Maximum Tenure
- **Field Name:** `emitenuremax`
- **Default Value:** `30`
- **Unit:** Years
- **Description:** Maximum loan tenure

#### Tenure Step
- **Field Name:** `emitenurestep`
- **Default Value:** `1`
- **Unit:** Years
- **Description:** Year increment when adjusting slider

#### Default Tenure
- **Field Name:** `emitenuredefault`
- **Default Value:** `10`
- **Unit:** Years
- **Description:** Initial tenure value

### Interest Rate Slider

#### Minimum Interest Rate
- **Field Name:** `emiratemin`
- **Default Value:** `10.50`
- **Unit:** % per annum
- **Description:** Minimum selectable interest rate

#### Maximum Interest Rate
- **Field Name:** `emiratemax`
- **Default Value:** `20`
- **Unit:** % per annum
- **Description:** Maximum selectable interest rate

#### Interest Rate Step
- **Field Name:** `emiratestep`
- **Default Value:** `0.1`
- **Unit:** % per annum
- **Description:** Rate change increment

#### Default Interest Rate
- **Field Name:** `emiratedefault`
- **Default Value:** `11`
- **Unit:** % per annum
- **Description:** Initial interest rate value

---

## Eligibility Calculator Configuration

### Enable Eligibility Calculator
- **Field Name:** `eligibility-calculator-enabled`
- **Type:** Yes/No
- **Default Value:** Yes
- **Description:** Enable/disable the eligibility calculator tab

### Gross Monthly Income Slider

#### Minimum Income
- **Field Name:** `eligincomemin`
- **Default Value:** `20000`
- **Unit:** Rupees per month
- **Description:** Minimum selectable gross monthly income

#### Maximum Income
- **Field Name:** `eligincomemax`
- **Default Value:** `1000000` (10 Lakhs)
- **Unit:** Rupees per month
- **Description:** Maximum selectable gross monthly income

#### Income Step
- **Field Name:** `eligincomestep`
- **Default Value:** `10000`
- **Unit:** Rupees per month
- **Description:** Increment value for income slider

#### Default Income
- **Field Name:** `eligincomedefault`
- **Default Value:** `100000` (1 Lakh)
- **Unit:** Rupees per month
- **Description:** Initial income value

### Other Loan EMI Slider

#### Minimum Other Loan EMI
- **Field Name:** `eligotheremimin`
- **Default Value:** `0`
- **Unit:** Rupees per month
- **Description:** Minimum for existing loan obligations

#### Maximum Other Loan EMI
- **Field Name:** `eligotherloanmax`
- **Default Value:** `500000` (5 Lakhs)
- **Unit:** Rupees per month
- **Description:** Maximum for existing loan obligations

#### Other Loan EMI Step
- **Field Name:** `eligotherloanstep`
- **Default Value:** `5000`
- **Unit:** Rupees per month
- **Description:** Increment value for EMI slider

#### Default Other Loan EMI
- **Field Name:** `eligotherloandefault`
- **Default Value:** `0`
- **Unit:** Rupees per month
- **Description:** Initial existing loan EMI value

### Interest Rate Slider (Eligibility)

#### Minimum Interest Rate
- **Field Name:** `eligratemin`
- **Default Value:** `10.5`
- **Unit:** % per annum
- **Description:** Minimum interest rate for eligibility calculation

#### Maximum Interest Rate
- **Field Name:** `eligratemax`
- **Default Value:** `20`
- **Unit:** % per annum
- **Description:** Maximum interest rate for eligibility calculation

#### Interest Rate Step
- **Field Name:** `eligratestep`
- **Default Value:** `0.1`
- **Unit:** % per annum
- **Description:** Rate change increment

#### Default Interest Rate
- **Field Name:** `eligratedefault`
- **Default Value:** `10.5`
- **Unit:** % per annum
- **Description:** Initial interest rate value

### Tenure Slider (Eligibility)

#### Minimum Tenure
- **Field Name:** `eligtenuremin`
- **Default Value:** `5`
- **Unit:** Years
- **Description:** Minimum loan tenure for eligibility

#### Maximum Tenure
- **Field Name:** `eligtenuremax`
- **Default Value:** `30`
- **Unit:** Years
- **Description:** Maximum loan tenure for eligibility

#### Tenure Step
- **Field Name:** `eligtenurestep`
- **Default Value:** `1`
- **Unit:** Years
- **Description:** Year increment value

#### Default Tenure
- **Field Name:** `eligtenuredefault`
- **Default Value:** `10`
- **Unit:** Years
- **Description:** Initial tenure value

---

## Result Display Configuration

### EMI Result Images

#### EMI Result Image (Desktop)
- **Field Name:** `emiresultimage`
- **Default Value:** `/images/calculator-calendar.png`
- **Description:** Image displayed with EMI calculation results on desktop view
- **Recommended Size:** 300x300px or larger

#### EMI Result Image (Mobile)
- **Field Name:** `emiresultimageemimobile`
- **Default Value:** `/images/calc-calendar-mobile.png`
- **Description:** Image displayed with EMI results on mobile devices
- **Recommended Size:** Optimized for mobile (smaller dimensions)

### Eligibility Result Images

#### Eligibility Result Image (Desktop)
- **Field Name:** `eligresultimage`
- **Default Value:** `/images/calculator-tick.png`
- **Description:** Image displayed with eligibility results on desktop
- **Recommended Size:** 300x300px or larger

#### Eligibility Result Image (Mobile)
- **Field Name:** `eligresultimagemobile`
- **Default Value:** `/images/calc-tick-mobile.png`
- **Description:** Image displayed with eligibility results on mobile
- **Recommended Size:** Optimized for mobile

---

## Result Text Labels

#### EMI Output Text
- **Field Name:** `outputtext1`
- **Default Value:** "Your home loan EMI is"
- **Description:** Text displayed before showing EMI calculation result
- **Example:** "Your estimated monthly EMI is"

#### Eligibility Output Text
- **Field Name:** `outputtext2`
- **Default Value:** "Your home loan eligibility is"
- **Description:** Text displayed before showing eligibility amount
- **Example:** "Your maximum loan eligibility is"

#### Principal Amount Label
- **Field Name:** `principaltext`
- **Default Value:** "Principal amount"
- **Description:** Label for the principal portion in EMI breakdown
- **Example:** "Principal (P&L)"

#### Interest Amount Label
- **Field Name:** `interesttext`
- **Default Value:** "Interest amount"
- **Description:** Label for the interest portion in EMI breakdown
- **Example:** "Interest (I&L)"

---

## Call-to-Action Buttons

### Button 1 (Talk to Loan Expert)

#### Button 1 Text
- **Field Name:** `button1text`
- **Default Value:** "Talk to loan expert"
- **Description:** Label for the first CTA button

#### Button 1 Link
- **Field Name:** `button1link`
- **Default Value:** (empty)
- **Description:** URL/link for the first button
- **Example:** "tel:+918000123456" or "/contact"

### Button 2 (Apply Loan)

#### Button 2 Text
- **Field Name:** `button2text`
- **Default Value:** "Apply loan now"
- **Description:** Label for the second CTA button

#### Button 2 Link
- **Field Name:** `button2link`
- **Default Value:** "https://www.piramalfinance.com/loan/login?productId=HLSA&utm_source=Website&utm_campaign=Home-Page-banner"
- **Description:** URL/link for the second button (typically application portal)
- **Note:** Include UTM parameters for tracking

---

## Advanced Settings

### Page Properties
- **Field Name:** `pageproperties`
- **Default Value:** `hl`
- **Description:** Identifier for page tracking and analytics
- **Example Values:**
  - `hl` = Home Loan
  - `bl` = Business Loan
  - `pl` = Personal Loan
  - `ubl` = Unsecured Business Loan

---

## Usage Examples

### Example 1: Personal Loan Calculator
```
Title: "Personal Loan Calculator"
Subheading: "Calculate EMI & Check eligibility for Personal Loans"
Button 1 Text: "Speak to our experts"
Button 2 Text: "Apply Now"
PageProperties: "pl"
```

### Example 2: Business Loan Calculator
```
Title: "Business Loan Calculator"
Subheading: "Estimate your business loan EMI and eligibility"
Show Salaried Option: No
Button 1 Text: "Call us for quote"
Button 2 Text: "Start Application"
PageProperties: "bl"
```

### Example 3: Auto Loan Calculator
```
Title: "Car Loan Calculator"
Loan Amount Min: 100000
Loan Amount Max: 5000000
Button 1 Text: "Schedule a demo"
Button 2 Text: "Apply for Car Loan"
PageProperties: "auto"
```

---

## Best Practices

1. **Slider Ranges:** Ensure minimum values are less than maximum values
2. **Default Values:** Set defaults within the min-max range for optimal UX
3. **Step Values:** Use appropriate steps (e.g., 10000 for large amounts, 0.1 for percentages)
4. **Images:** Use optimized images and provide alt text for accessibility
5. **Links:** Always include `https://` or `http://` for external links
6. **Text:** Keep button labels concise and action-oriented
7. **Testing:** Test on both desktop and mobile devices

---

## Common Customizations

### Adjusting Loan Amount Range
For loans up to 1 Crore:
- Min: 100000 (1 Lakh)
- Max: 100000000 (1 Crore)
- Step: 50000

### Higher Interest Rates
- Min: 8.5
- Max: 25
- Default: 15

### Shorter Tenure Options (2-10 Years)
- Min: 2
- Max: 10
- Default: 5

---

## Troubleshooting

**Q: The slider won't move to certain values**
A: Check that your step value divides evenly into the range. Use smaller step values.

**Q: Images aren't showing**
A: Verify the image paths are correct and images exist in the specified location.

**Q: Buttons aren't clickable**
A: Ensure links are properly formatted with protocol (http:// or https://)

---

## Support
For additional help with configuring this calculator, contact your development team.
