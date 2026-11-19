/*
 * Loan Against Securities (LAS) page template.
 * Runs only on pages whose "template" metadata is "las" (see loadPage in scripts/scripts.js).
 */
export default function decorate(doc) {
  // CSS in las.css is scoped to this class
  doc.body.classList.add('las');
}
