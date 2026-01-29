/**
 * SEO Panel UI Component
 * Modern interface for displaying SEO audit results
 */

import { downloadSEOReport, performSEOAudit } from "./seo-audit.js";

// Transform function to map SEO audit results to the panel format

export function transformSEOResults(seoResults) {
  return {
    audit: {
      // Title and meta data
      title: seoResults.categories.titleTag?.title || 'Not found',
      metaDescription: seoResults.categories.metaDescription?.description || null,
      
      // Heading structure
      h1Count: seoResults.categories.headings?.h1Count || 0,
      totalHeadings: seoResults.categories.headings?.totalHeadings || 0,
      
      // Images
      totalImages: seoResults.categories.images?.totalImages || 0,
      imagesWithAlt: seoResults.categories.images?.imagesWithAlt || 0,
      imagesWithoutAlt: seoResults.categories.images?.imagesWithoutAlt || 0,
      
      // Links
      internalLinks: seoResults.categories.links?.internalLinks || 0,
      externalLinks: seoResults.categories.links?.externalLinks || 0,
      totalLinks: seoResults.categories.links?.totalLinks || 0,
      
      // Content
      wordCount: seoResults.categories.content?.wordCount || 0,
      readingTime: seoResults.categories.content?.readingTime || 0,
      
      // Technical SEO
      hasViewport: seoResults.categories.technical?.techData?.hasViewport || false,
      hasCharset: seoResults.categories.technical?.techData?.hasCharset || false,
      hasLang: seoResults.categories.technical?.techData?.hasLang || false,
      hasCanonical: seoResults.categories.technical?.techData?.hasCanonical || false,
      hasOpenGraph: seoResults.categories.technical?.techData?.openGraph?.hasTitle && 
                    seoResults.categories.technical?.techData?.openGraph?.hasDescription || false,
      
      // Performance
      loadTime: seoResults.categories.performance?.perfData?.loadTime || null,
      domElements: seoResults.categories.performance?.perfData?.domElements || 0,
      totalScripts: seoResults.categories.performance?.perfData?.totalScripts || 0,
      cssFiles: seoResults.categories.performance?.perfData?.cssFiles || 0,
      
      // Issues and recommendations
      criticalIssues: seoResults.summary?.critical || [],
      warnings: seoResults.summary?.warnings || [],
      passed: seoResults.summary?.passed || [],
      
      // Category scores for detailed view
      categoryScores: {
        titleTag: seoResults.categories.titleTag?.score || 0,
        metaDescription: seoResults.categories.metaDescription?.score || 0,
        headings: seoResults.categories.headings?.score || 0,
        content: seoResults.categories.content?.score || 0,
        images: seoResults.categories.images?.score || 0,
        links: seoResults.categories.links?.score || 0,
        technical: seoResults.categories.technical?.score || 0,
        performance: seoResults.categories.performance?.score || 0
      }
    },
    score: seoResults.overallScore,
    scoreInterpretation: seoResults.scoreInterpretation
  };
}

// Main panel creation function
export async function showSeoPanel({ audit, score, scoreInterpretation }) {
  const { createElement } = await import(`${window.hlx.codeBasePath}/scripts/scripts.js`);
  const scorePercentage = typeof score === 'number' ? score : Math.round((score.score / score.maxScore) * 100);

  // Remove existing panel if present
  const existingPanel = document.getElementById('seo-checker-panel');
  if (existingPanel) {
    existingPanel.remove();
    document.body.classList.remove('seo-panel-active');
  }

  // Create main panel container
  const panel = createElement('div', {
    id: 'seo-checker-panel',
    class: 'seo-panel'
  });

  // Pass audit to header for modal popup
  const header = createPanelHeader(createElement, scorePercentage, panel, audit);

  // Create score visualization
  const scoreSection = createScoreSection(createElement, scorePercentage, scoreInterpretation);

  // Create content sections with actual audit data
  const content = createContentSections(createElement, audit, scoreInterpretation);

  // Assemble panel
  panel.append(header, scoreSection, content);
  document.body.append(panel);

  // Add animation class after DOM insertion
  requestAnimationFrame(() => {
    document.body.classList.add('seo-panel-active');
  });
}

export function createPanelHeader(createElement, scorePercentage, panel, audit) {
  const header = createElement('div', { class: 'seo-header' });
  
  const headerContent = createElement('div', { class: 'seo-header-content' });
  
  const titleSection = createElement('div', { class: 'seo-title-section' });
  const icon = createElement('div', { class: 'seo-icon' }, createElement('img', {src:'/icons/dept-logo.svg'}));
  const title = createElement('h2', { class: 'seo-title' }, 'SEO Audit');
  const subtitle = createElement('p', { class: 'seo-subtitle' }, 'Page Performance Analysis');
  
  titleSection.append(icon, title, subtitle);
  
  const actions = createElement('div', { class: 'seo-header-actions' });
  
  const refreshBtn = createElement('button', { 
    class: 'seo-action-btn seo-refresh-btn',
    title: 'Refresh Audit'
  }, '↻');
  
  const exportBtn = createElement('button', { 
    class: 'seo-action-btn seo-export-btn',
    title: 'View Report'
  }, '📄');
  
  const closeBtn = createElement('button', { 
    class: 'seo-action-btn seo-close-btn',
    title: 'Close Panel'
  }, '✕');
  
  // Button event handlers
  refreshBtn.onclick = async () => {
    // Show loading state
    showLoadingState(panel);
    // Re-run the audit and refresh the panel
    try {
      const newResults = await performSEOAudit();
      const newPanelData = transformSEOResults(newResults);
      
      // Remove current panel and show new one
      panel.remove();
      document.body.classList.remove('seo-panel-active');
      await showSeoPanel(newPanelData);
    } catch (error) {
      console.error('Error refreshing SEO audit:', error);
      hideLoadingState(panel);
    }
  };
  
  exportBtn.onclick = () => {
    // Show the current audit results in a modal popup
    showReportModal(createElement, audit);
  };

  // Helper to show a modal with the full audit data as JSON
  function showReportModal(createElement, audit) {
    // Remove any existing modal
    const existing = document.querySelector('.seo-modal-overlay');
    if (existing) existing.remove();
    const modalOverlay = createElement('div', { class: 'seo-modal-overlay' });
    const modalContent = createElement('div', { class: 'seo-modal-content' });
    const closeBtn = createElement('button', { class: 'seo-modal-close' }, '✕');
    closeBtn.onclick = () => modalOverlay.remove();
    const title = createElement('h3', { class: 'seo-modal-title' }, 'Full SEO Audit Data');
    const pre = createElement('pre', { class: 'seo-modal-code' });
    pre.textContent = JSON.stringify(audit, null, 2);
    modalContent.append(closeBtn, title, pre);
    modalOverlay.append(modalContent);
    document.body.append(modalOverlay);
  }
  
  closeBtn.onclick = () => {
    document.body.classList.remove('seo-panel-active');
    setTimeout(() => panel.remove(), 300);
  };
  
  actions.append(refreshBtn, exportBtn, closeBtn);
  headerContent.append(titleSection, actions);
  header.append(headerContent);
  
  return header;
}

function createScoreSection(createElement, scorePercentage, scoreInterpretation) {
  const scoreSection = createElement('div', { class: 'seo-score-section' });
  
  // Main score display
  const scoreDisplay = createElement('div', { class: 'seo-score-display' });
  const scoreNumber = createElement('div', { class: 'seo-score-number' }, scorePercentage);
  const scoreLabel = createElement('div', { class: 'seo-score-label' }, 'SEO Score');
  const scoreSubtext = createElement('div', { class: 'seo-score-subtext' }, 'out of 100');
  
  scoreDisplay.append(scoreNumber, scoreLabel, scoreSubtext);
  
  // Progress ring (using CSS conic gradient)
  const progressRing = createElement('div', { class: 'seo-progress-ring' });
  const progressCircle = createElement('div', { class: 'seo-progress-circle' });
  
  // Calculate the rotation for the progress
  const rotation = (scorePercentage / 100) * 360;
  progressCircle.style.background = `conic-gradient(
    #4ade80 0deg ${rotation}deg,
    rgba(255, 255, 255, 0.2) ${rotation}deg 360deg
  )`;
  
  progressRing.append(progressCircle, scoreDisplay);
  
  // Score interpretation - use provided interpretation or fallback to calculated
  const interpretation = createElement('div', { class: 'seo-interpretation' });
  const grade = scoreInterpretation ? scoreInterpretation.grade : getScoreGrade(scorePercentage);
  const status = scoreInterpretation ? scoreInterpretation.status : getScoreStatus(scorePercentage);
  
  const gradeElement = createElement('span', { 
    class: `seo-grade seo-grade-${grade.toLowerCase()}` 
  }, grade);
  const statusElement = createElement('span', { class: 'seo-status' }, status);
  
  interpretation.append(gradeElement, statusElement);
  scoreSection.append(progressRing, interpretation);
  
  return scoreSection;
}

function createContentSections(createElement, audit, scoreInterpretation) {
  const content = createElement('div', { class: 'seo-content' });
  
  // Create tabs
  const tabs = createElement('div', { class: 'seo-tabs' });
  const tabButtons = createElement('div', { class: 'seo-tab-buttons' });
  const tabContents = createElement('div', { class: 'seo-tab-contents' });
  
  // Tab data
  const tabData = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'issues', label: 'Issues', icon: '⚠️' },
    { id: 'technical', label: 'Technical', icon: '⚙️' },
    { id: 'content', label: 'Content', icon: '📝' }
  ];
  
  tabData.forEach((tab, index) => {
    // Create tab button
    const tabBtn = createElement('button', { 
      class: `seo-tab-btn ${index === 0 ? 'active' : ''}`,
      'data-tab': tab.id
    });
    const tabIcon = createElement('span', { class: 'seo-tab-icon' }, tab.icon);
    const tabLabel = createElement('span', { class: 'seo-tab-label' }, tab.label);
    tabBtn.append(tabIcon, tabLabel);
    
    // Create tab content
    const tabContent = createElement('div', { 
      class: `seo-tab-content ${index === 0 ? 'active' : ''}`,
      'data-tab-content': tab.id
    });
    
    // Populate tab content based on type
    switch (tab.id) {
      case 'overview':
        tabContent.append(createOverviewContent(createElement, audit));
        break;
      case 'issues':
        tabContent.append(createIssuesContent(createElement, audit));
        break;
      case 'technical':
        tabContent.append(createTechnicalContent(createElement, audit));
        break;
      case 'content':
        tabContent.append(createContentAnalysis(createElement, audit));
        break;
    }
    
    // Tab click handler
    tabBtn.onclick = () => {
      // Remove active class from all tabs
      tabButtons.querySelectorAll('.seo-tab-btn').forEach(btn => btn.classList.remove('active'));
      tabContents.querySelectorAll('.seo-tab-content').forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab
      tabBtn.classList.add('active');
      tabContent.classList.add('active');
    };
    
    tabButtons.append(tabBtn);
    tabContents.append(tabContent);
  });
  
  tabs.append(tabButtons, tabContents);
  content.append(tabs);
  
  return content;
}

function createOverviewContent(createElement, audit) {
  const overview = createElement('div', { class: 'seo-overview' });
  
  // Key metrics grid using actual audit data
  const metricsGrid = createElement('div', { class: 'seo-metrics-grid' });
  
  const metrics = [
    { 
      label: 'Page Title', 
      value: audit.title && audit.title !== 'Not found' ? '✓ Present' : 'Missing', 
      status: audit.title && audit.title !== 'Not found' ? 'good' : 'error' 
    },
    { 
      label: 'Meta Description', 
      value: audit.metaDescription ? '✓ Present' : 'Missing', 
      status: audit.metaDescription ? 'good' : 'error' 
    },
    { 
      label: 'H1 Tags', 
      value: `${audit.h1Count || 0}`, 
      status: audit.h1Count === 1 ? 'good' : audit.h1Count === 0 ? 'error' : 'warning' 
    },
    { 
      label: 'Images', 
      value: `${audit.totalImages || 0} total`, 
      status: audit.imagesWithoutAlt > 0 ? 'warning' : 'good' 
    },
    { 
      label: 'Internal Links', 
      value: `${audit.internalLinks || 0}`, 
      status: audit.internalLinks > 0 ? 'good' : 'warning' 
    },
    { 
      label: 'Load Time', 
      value: audit.loadTime ? `${Math.round(audit.loadTime/1000)}s` : 'Unknown', 
      status: audit.loadTime ? (audit.loadTime > 3000 ? 'error' : 'good') : 'info' 
    }
  ];
  
  metrics.forEach(metric => {
    const metricCard = createElement('div', { class: `seo-metric-card seo-${metric.status}` });
    const metricLabel = createElement('div', { class: 'seo-metric-label' }, metric.label);
    const metricValue = createElement('div', { class: 'seo-metric-value' }, metric.value);
    metricCard.append(metricLabel, metricValue);
    metricsGrid.append(metricCard);
  });
  
  overview.append(metricsGrid);
  return overview;
}

function createIssuesContent(createElement, audit) {
  const issuesContainer = createElement('div', { class: 'seo-issues' });

  // This helper function does the scrolling and highlighting
  const highlightElement = (element) => {
    document.querySelectorAll('.seo-highlight').forEach(el => el.classList.remove('seo-highlight'));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('seo-highlight');
      setTimeout(() => {
        element.classList.remove('seo-highlight');
      }, 3000);
    }
  };

  // --- Critical Issues Section ---
  const criticalIssues = audit.criticalIssues || [];
  if (criticalIssues.length > 0) {
    const section = createElement('div', { class: 'seo-issue-section' });
    section.append(createElement('h3', { class: 'seo-issue-title critical' }, '🚨 Critical Issues'));
    const list = createElement('div', { class: 'seo-issue-list' });
    
    criticalIssues.forEach(issue => {
      const issueItem = createElement('div', { class: 'seo-issue-item critical' });
      
      // --- THIS IS THE FIX ---
      // Check if the issue is a link object or a simple string
      if (typeof issue === 'object' && issue.element) {
        // It's a link object - use its message and make it clickable
        issueItem.textContent = issue.message;
        issueItem.classList.add('clickable');
        issueItem.onclick = () => highlightElement(issue.element);
      } else {
        // It's a simple string - just display it
        issueItem.textContent = issue;
      }
      
      list.append(issueItem);
    });
    section.append(list);
    issuesContainer.append(section);
  }
  
  // --- Recommendations Section ---
  const warnings = audit.warnings || [];
   if (warnings.length > 0) {
    const section = createElement('div', { class: 'seo-issue-section' });
    section.append(createElement('h3', { class: 'seo-issue-title warning' }, '⚠️ Recommendations'));
    const list = createElement('div', { class: 'seo-issue-list' });

    warnings.forEach(warning => {
      const issueItem = createElement('div', { class: 'seo-issue-item warning' });

      // Apply the same fix here for recommendations
      if (typeof warning === 'object' && warning.element) {
        issueItem.textContent = warning.message;
        issueItem.classList.add('clickable');
        issueItem.onclick = () => highlightElement(warning.element);
      } else {
        issueItem.textContent = warning;
      }

      list.append(issueItem);
    });
    section.append(list);
    issuesContainer.append(section);
  }
  
  // No issues message
  if (criticalIssues.length === 0 && warnings.length === 0) {
    const noIssues = createElement('div', { class: 'seo-no-issues' });
    noIssues.innerHTML = '✅ No critical issues or major recommendations!';
    issuesContainer.append(noIssues);
  }

  return issuesContainer;
}
function createTechnicalContent(createElement, audit) {
  const technical = createElement('div', { class: 'seo-technical' });
  
  const techItems = [
    { label: 'Viewport Meta Tag', status: audit.hasViewport ? 'good' : 'error' },
    { label: 'Charset Declaration', status: audit.hasCharset ? 'good' : 'error' },
    { label: 'Language Attribute', status: audit.hasLang ? 'good' : 'warning' },
    { label: 'Canonical URL', status: audit.hasCanonical ? 'good' : 'warning' },
    { label: 'Open Graph Tags', status: audit.hasOpenGraph ? 'good' : 'warning' }
  ];
  
  techItems.forEach(item => {
    const techItem = createElement('div', { class: `seo-tech-item seo-${item.status}` });
    const statusIcon = createElement('span', { class: 'seo-status-icon' }, 
      item.status === 'good' ? '✓' : item.status === 'error' ? '✗' : '⚠');
    const label = createElement('span', { class: 'seo-tech-label' }, item.label);
    techItem.append(statusIcon, label);
    technical.append(techItem);
  });
  
  return technical;
}

function createContentAnalysis(createElement, audit) {
  const content = createElement('div', { class: 'seo-content-analysis' });
  
  const contentMetrics = [
    { label: 'Word Count', value: audit.wordCount || 'Unknown' },
    { label: 'Reading Time', value: audit.readingTime ? `${audit.readingTime} min` : 'Unknown' },
    { label: 'Total Headings', value: `${audit.totalHeadings || 0}` },
    { label: 'Internal Links', value: `${audit.internalLinks || 0}` },
    { label: 'External Links', value: `${audit.externalLinks || 0}` },
    { label: 'Images with Alt', value: `${audit.imagesWithAlt || 0}/${audit.totalImages || 0}` }
  ];
  
  contentMetrics.forEach(metric => {
    const metricRow = createElement('div', { class: 'seo-content-metric' });
    const metricLabel = createElement('span', { class: 'seo-content-metric-label' }, metric.label);
    const metricValue = createElement('span', { class: 'seo-content-metric-value' }, metric.value);
    metricRow.append(metricLabel, metricValue);
    content.append(metricRow);
  });
  
  return content;
}

// Utility functions
function getScoreGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function getScoreStatus(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Improvement';
}

// Loading state functions
function showLoadingState(panel) {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'seo-loading';
  loadingDiv.innerHTML = `
    <div class="seo-loading-spinner"></div>
    <div>Refreshing audit...</div>
  `;
  
  const content = panel.querySelector('.seo-content');
  if (content) {
    content.style.display = 'none';
    content.parentNode.insertBefore(loadingDiv, content.nextSibling);
  }
}

function hideLoadingState(panel) {
  const loading = panel.querySelector('.seo-loading');
  const content = panel.querySelector('.seo-content');
  
  if (loading) loading.remove();
  if (content) content.style.display = 'flex';
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showSeoPanel,
    transformSEOResults
  };
}