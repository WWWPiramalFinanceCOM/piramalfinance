# Accessibility Issues Requiring CMS/Content Changes

**Page:** https://www.piramalfinance.com/piramal-alternatives  
**Standard:** WCAG 2.2  
**Date:** March 10, 2026

The following accessibility issues from the audit sheet require fixes in AEM authoring (content/design changes) rather than code changes.

---

## Heading Structure Issues

| Issue # | Problem | Action Required |
|---------|---------|-----------------|
| #4 | Missing or incorrect heading hierarchy | Ensure proper H1 → H2 → H3 heading order. Each page should have exactly one H1. Don't skip heading levels. |
| #8 | Heading level skipped | Review page content and ensure headings follow sequential order without gaps |
| #12 | Multiple H1 headings | Keep only one H1 per page (usually the page title) |
| #20 | Improper heading structure | Restructure content headings in AEM to follow logical hierarchy |

**How to fix:** In AEM content editor, select text and choose appropriate heading level from the formatting dropdown. Ensure H2 follows H1, H3 follows H2, etc.

---

## Link Text Issues

| Issue # | Problem | Action Required |
|---------|---------|-----------------|
| #5 | Non-descriptive link text | Replace generic text like "Click here", "Read more", "Learn more" with descriptive text that explains the link destination |
| #19 | Link purpose unclear | Update link text to describe where the link goes (e.g., "View our investment portfolio" instead of "Click here") |

**How to fix:** In AEM content editor, edit link text to be meaningful and descriptive. Screen reader users often navigate by links only, so each link should make sense out of context.

---

## Color Contrast Issues

| Issue # | Problem | Action Required |
|---------|---------|-----------------|
| #2 | Insufficient text contrast | Ensure text has at least 4.5:1 contrast ratio against background |
| #9 | Low contrast on interactive elements | Buttons/links need sufficient contrast |
| #13 | Text over images lacks contrast | Add solid background overlay or text shadow for text on images |
| #16 | Small text contrast insufficient | Small text (< 18pt) needs 4.5:1 ratio minimum |
| #17 | Large text contrast insufficient | Large text (≥ 18pt or 14pt bold) needs 3:1 ratio minimum |
| #18 | UI component contrast | Form fields, icons need 3:1 contrast |
| #22 | Contrast in specific component | Review and adjust colors in the flagged component |

**How to fix:** Work with design team to select colors meeting WCAG contrast requirements. Use tools like WebAIM Contrast Checker to verify.

---

## List Structure Issues

| Issue # | Problem | Action Required |
|---------|---------|-----------------|
| #3 | List items not properly structured | Use proper HTML list formatting (bulleted or numbered lists) in AEM editor instead of manual line breaks or dashes |

**How to fix:** In AEM Rich Text Editor, highlight list items and click the bulleted or numbered list button.

---

## Focus Order Issues

| Issue # | Problem | Action Required |
|---------|---------|-----------------|
| #11 | Focus order doesn't match visual order | Ensure content is authored in logical reading order. Tab order follows DOM order. |

**How to fix:** Review the content structure in AEM and ensure elements appear in the order users would naturally read/interact with them.

---

## Color-Only Information

| Issue # | Problem | Action Required |
|---------|---------|-----------------|
| #21 | Information conveyed by color alone | Add text labels, patterns, or icons in addition to color to convey meaning (e.g., required fields, status indicators) |

**How to fix:** Where color is used to convey information (charts, status indicators, required fields), add additional visual cues like text labels, icons, or patterns.

---

## Already Fixed in Code

The following issues have been resolved through code changes:

| Issue # | Description | Fix Location |
|---------|-------------|--------------|
| #1, #6, #23 | Empty alt on decorative icons | `scripts/aem.js` - decorateIcon function |
| #14 | Focus not visible | `styles/styles.css` - focus-visible styles |
| #7, #15 | Tab state/ARIA missing | `blocks/tabs/tabs.js` - keyboard navigation + ARIA |
| #10 | Improper role for buttons | `blocks/header/header.js` - already has role="button" on nav-drops |

---

## Testing Resources

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Web Accessibility Evaluation Tool](https://wave.webaim.org/)
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)

---

**Contact:** For questions about implementing these fixes, consult the development team.
