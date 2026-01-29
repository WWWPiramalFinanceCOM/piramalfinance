/**
 * SEO Checker Initialization
 * Main entry point for the SEO audit tool
 */

// Import dependencies (adjust paths as needed)
// import './seo-audit.js';
// import './seo-panel.js';

/**
 * Main initialization function
 * Handles toggle functionality and launches SEO audit
 */
import {quickSEOCheck,downloadSEOReport,performSEOAudit} from './seo-audit.js';
import {transformSEOResults, showSeoPanel} from './seo-panel.js';

export default async function init() {
  // Import required functions
  const { loadCSS } = await import(`${window.hlx.codeBasePath}/scripts/aem.js`);
  
  // Load external CSS file (optional since we can inject styles)
  await loadCSS(`${window.hlx.codeBasePath}/tools/sidekick/plugins/seo-checker/seo-checker.css`);
  
  // Check if panel already exists and toggle it
  const existingPanel = document.getElementById('seo-checker-panel');
  if (existingPanel) {
    document.body.classList.remove('seo-panel-active');
    existingPanel.remove();
    return;
  }
  
  try {
    // Show loading indicator (optional)
    showInitialLoading();
    
    // Run the comprehensive SEO audit
    const seoResults = await performSEOAudit();
    
    // Transform the results to match the panel's expected format
    const panelData = transformSEOResults(seoResults);
    
    // Hide loading indicator
    hideInitialLoading();
    
    // Show the modern SEO panel
    await showSeoPanel(panelData);
    
    // Log success to console for debugging
    console.log('SEO Audit completed successfully', {
      score: seoResults.overallScore,
      grade: seoResults.scoreInterpretation.grade,
      issues: seoResults.summary.critical.length
    });
    
    // const seocheckercss = import('../seo-checker/seo-checker.css');
    // loadCSS(seocheckercss)
  } catch (error) {
    console.error('SEO Audit failed:', error);
    hideInitialLoading();
    showErrorMessage(error);
  }
}

/**
 * Show initial loading state
 */
function showInitialLoading() {
  // Create a simple loading overlay
  const loading = document.createElement('div');
  loading.id = 'seo-loading-overlay';
  loading.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
  `;
  
  loading.innerHTML = `
    <div style="
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    "></div>
    Running SEO Audit...
  `;
  
  // Add spinning animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(loading);
  
}

/**
 * Hide initial loading state
 */
function hideInitialLoading() {
  const loading = document.getElementById('seo-loading-overlay');
  if (loading) {
    loading.remove();
  }
}

/**
 * Show error message if audit fails
 */
function showErrorMessage(error) {
  const errorDiv = document.createElement('div');
  errorDiv.id = 'seo-error-overlay';
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: #ef4444;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
  `;
  
  errorDiv.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 8px;">
      ⚠️ SEO Audit Failed
    </div>
    <div style="font-size: 12px; opacity: 0.9;">
      ${error.message || 'An unknown error occurred'}
    </div>
    <button onclick="this.parentElement.remove()" style="
      margin-top: 12px;
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    ">
      Dismiss
    </button>
  `;
  
  document.body.appendChild(errorDiv);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
}

/**
 * Helper function for manual triggering
 */
async function runSeoAudit() {
  return await performSEOAudit();
}

/**
 * Quick access function for developers
 */
window.hlx.seoChecker = {
  init,
  runAudit: runSeoAudit,
  quickCheck: quickSEOCheck,
  downloadReport: downloadSEOReport
};

// Export for module usage
export { 
  init, 
  runSeoAudit, 
  showInitialLoading, 
  hideInitialLoading, 
  showErrorMessage 
};