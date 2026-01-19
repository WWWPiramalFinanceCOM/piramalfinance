# EMI & Eligibility Calculator - Quick Reference

## All Authorable Fields

| Field Name | Type | Default | Description |
|------------|------|---------|-------------|
| `maindivbackground` | Text | emi | Main container CSS class |
| `title` | Text | - | Calculator main title |
| `mainheadingclass` | Text | - | Additional heading CSS classes |
| `subheading` | Text | Calculate EMI & Check eligibility | Secondary title |
| `subheadingtow` | Text | - | Optional third-level heading |
| `checkbox-employment-salaried` | Yes/No | Yes | Show salaried employment option |
| `salariedtabtext` | Text | I'm Salaried | Salaried tab label |
| `calculatorsalariedimg` | Image | /images/calculator-salaried.svg | Salaried icon |
| `calculatorsalariedimgalt` | Text | salaried | Salaried icon alt text |
| `checkbox-employment-business` | Yes/No | Yes | Show business employment option |
| `businesstabtext` | Text | I'm doing Business | Business tab label |
| `calculatorbusinessimg` | Image | /images/calculator-business.svg | Business icon |
| `calculatorbusinessimgalt` | Text | business | Business icon alt text |
| `firsttabbname` | Text | EMI Calculator | EMI tab label |
| `secondtabbname` | Text | Eligibility Calculator | Eligibility tab label |
| `thridtabname` | Text | - | Optional third tab label |

### EMI Calculator Fields

| Field Name | Default | Description |
|------------|---------|-------------|
| `emi-calculator-enabled` | Yes | Enable EMI calculator |
| `emiloanamountmin` | 500000 | Min loan amount (Rs) |
| `emiloanamountmax` | 50000000 | Max loan amount (Rs) |
| `emiloanamountstep` | 10000 | Loan amount step (Rs) |
| `emiloanamountdefault` | 2500000 | Default loan amount (Rs) |
| `emitenuremin` | 5 | Min tenure (years) |
| `emitenuremax` | 30 | Max tenure (years) |
| `emitenurestep` | 1 | Tenure step (years) |
| `emitenuredefault` | 10 | Default tenure (years) |
| `emiratemin` | 10.50 | Min interest rate (%) |
| `emiratemax` | 20 | Max interest rate (%) |
| `emiratestep` | 0.1 | Interest rate step (%) |
| `emiratedefault` | 11 | Default interest rate (%) |

### Eligibility Calculator Fields

| Field Name | Default | Description |
|------------|---------|-------------|
| `eligibility-calculator-enabled` | Yes | Enable eligibility calculator |
| `eligincomemin` | 20000 | Min monthly income (Rs) |
| `eligincomemax` | 1000000 | Max monthly income (Rs) |
| `eligincomestep` | 10000 | Income step (Rs) |
| `eligincomedefault` | 100000 | Default income (Rs) |
| `eligotheremimin` | 0 | Min other loan EMI (Rs) |
| `eligotherloanmax` | 500000 | Max other loan EMI (Rs) |
| `eligotherloanstep` | 5000 | Other loan EMI step (Rs) |
| `eligotherloandefault` | 0 | Default other loan EMI (Rs) |
| `eligratemin` | 10.5 | Min interest rate (%) |
| `eligratemax` | 20 | Max interest rate (%) |
| `eligratestep` | 0.1 | Interest rate step (%) |
| `eligratedefault` | 10.5 | Default interest rate (%) |
| `eligtenuremin` | 5 | Min tenure (years) |
| `eligtenuremax` | 30 | Max tenure (years) |
| `eligtenurestep` | 1 | Tenure step (years) |
| `eligtenuredefault` | 10 | Default tenure (years) |

### Results & Display Fields

| Field Name | Default | Description |
|------------|---------|-------------|
| `emiresultimage` | /images/calculator-calendar.png | EMI result image (desktop) |
| `emiresultimageemimobile` | /images/calc-calendar-mobile.png | EMI result image (mobile) |
| `eligresultimage` | /images/calculator-tick.png | Eligibility result image (desktop) |
| `eligresultimagemobile` | /images/calc-tick-mobile.png | Eligibility result image (mobile) |
| `outputtext1` | Your home loan EMI is | EMI result prefix text |
| `outputtext2` | Your home loan eligibility is | Eligibility result prefix text |
| `principaltext` | Principal amount | Principal label in EMI breakdown |
| `interesttext` | Interest amount | Interest label in EMI breakdown |

### Button Fields

| Field Name | Default | Description |
|------------|---------|-------------|
| `button1text` | Talk to loan expert | Button 1 label |
| `button1link` | - | Button 1 URL/link |
| `button2text` | Apply loan now | Button 2 label |
| `button2link` | https://www.piramalfinance.com/loan/login?productId=HLSA&utm_source=Website&utm_campaign=Home-Page-banner | Button 2 URL/link |
| `pageproperties` | hl | Page identifier (hl, bl, pl, etc) |

---

## Quick Tips

- **Range Validation:** Min value should always be less than Max value
- **Step Values:** Should divide evenly into the range
- **Images:** Use SVG for icons, JPEG/PNG for screenshots
- **Links:** Include full URL (http:// or https://) for external links
- **Accessibility:** Always fill in alt text for images
- **Testing:** Verify calculations on both desktop and mobile browsers

