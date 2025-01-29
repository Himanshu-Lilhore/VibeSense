// This file is injected into the YouTube page
// You can use it to interact with the page if needed
console.log('YouTube Sentiment Analyzer loaded');


let button = null, resultsContainer = null;

// Function to inject button next to title
function injectAnalyzeButton() {
  const isShorts = window.location.pathname.includes('/shorts/');
  
  if (isShorts) {
    // Get the currently visible/active Shorts container
    const currentShortContainer = document.querySelector('ytd-reel-video-renderer[is-active]');
    if (!currentShortContainer) return;

    // Get the actions container within the active Short
    const actionsContainer = currentShortContainer.querySelector('#actions');
    if (!actionsContainer || actionsContainer.querySelector('#sentiment-analyze-btn')) return;

    button = document.createElement('button');
    button.id = 'sentiment-analyze-btn';
    button.className = 'sentiment-btn';
    button.innerHTML = '✨';
    button.style.cssText = `
      margin: 3px;
      width: 48px;
      height: 48px;
      border-radius: 24px;
      border: none;
      background: #065f46;
      color: white;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create a hidden results container that will update the button text
    resultsContainer = document.createElement('div');
    resultsContainer.id = 'sentiment-result-bar';
    resultsContainer.style.display = 'none';

    // Insert as first element
    actionsContainer.prepend(button, resultsContainer);
  } else {
    // Original code for regular videos
    const titleContainer = document.querySelector('#above-the-fold #title');
    if (!titleContainer || document.querySelector('#sentiment-analyze-btn')) return;

    button = document.createElement('button');
    button.id = 'sentiment-analyze-btn';
    button.className = 'sentiment-btn';
    button.innerHTML = 'Analyze Sentiment ✨';
    button.style.cssText = `
      margin: 8px 0px;
      padding: 8px 16px;
      border-radius: 18px;
      border: none;
      background: #065f46;
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    `;

    button.addEventListener('mouseover', () => {
      button.style.background = '#047857';
    });

    button.addEventListener('mouseout', () => {
      button.style.background = '#065f46';
    });

    // Add result bar container
    resultsContainer = document.createElement('div');
    resultsContainer.id = 'sentiment-result-bar';
    resultsContainer.style.cssText = `
      margin: 8px 0px;
      border-radius: 12px;
      display: none;
      position: relative;
      align-items: center;
    `;

    titleContainer.appendChild(button);
    titleContainer.appendChild(resultsContainer);
  }

  return { button, resultsContainer };
}

// Function to update result bar
function updateResultsContainer(sentiment) {
  const isShorts = window.location.pathname.includes('/shorts/');
  const resultsContainer = document.querySelector('#sentiment-result-bar');
  if (!resultsContainer) return;

  if (isShorts) {
    // For Shorts, update the button text with the percentage
    const button = document.querySelector('#sentiment-analyze-btn');
    if (button) {
      const positivePercentage = Math.round(sentiment.positive * 100);
      button.innerHTML = `${positivePercentage}%`;
      button.style.background = positivePercentage > 50 ? '#065f46' : '#991b1b';
    }
  } else {
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      flex-direction: row;
      gap: 20px;
      align-items: center;
    `;

    // Sentiment bar
    const barContainer = document.createElement('div');
    barContainer.style.cssText = `
      display: flex;
      height: 24px;
      width: 200px;
      border-radius: 12px;
      overflow: hidden;
      align-items: center;
    `;

    barContainer.innerHTML = `
      <div style="
        width: ${sentiment.positive * 100}%;
        height: 100%;
        background: forestgreen;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        position: relative;
      " class="sentiment-section">${Math.round(sentiment.positive * 100)}%</div>
      <div style="
        width: ${sentiment.negative * 100}%;
        height: 100%;
        background: darkred;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        position: relative;
      " class="sentiment-section">${Math.round(sentiment.negative * 100)}%</div>
    `;

    container.appendChild(barContainer);

    // Add tablet functionality
    const tabletContainer = document.createElement('div');
    tabletContainer.style.cssText = `
    padding: 8px;
    z-index: 1000;
    font-size: 13px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    border: 2px solid darkgrey;
    border-radius: 5px;
    background: #ffffff17;
    align-items: top;
    `;
    const tabletContainerTitle = document.createElement('div');
    tabletContainerTitle.textContent = 'Most discussed:';
    tabletContainerTitle.style.cssText = `
      padding: 1px 2px;
      color: white;
    `;
    tabletContainer.appendChild(tabletContainerTitle);

    if (sentiment.topics && sentiment.topics?.length > 0) {
      sentiment.topics.forEach(topic => {
        const tablet = document.createElement('div');
        tablet.textContent = topic;
        tablet.style.cssText = `
      background: gray;
        padding: 0px 8px;
        border-radius: 5px;
        color: black;
        background: darkgrey;
    `;
        tabletContainer.appendChild(tablet);
      });

      container.appendChild(tabletContainer);
    }

    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = '';
    resultsContainer.appendChild(container);
  }
}

function getVideoId() {
  const isShorts = window.location.pathname.includes('/shorts/');

  if (isShorts) {
    // For Shorts URLs: /shorts/CHbbpMvW01s
    return window.location.pathname.split('/shorts/')[1];
  } else {
    // For regular videos: ?v=CHbbpMvW01s
    return new URLSearchParams(window.location.search).get('v');
  }
}

// Initialize and handle analysis
async function init() {
  if (button) button.remove();
  if (resultsContainer) resultsContainer.remove();
  const isShorts = window.location.pathname.includes('/shorts/');

  const res = injectAnalyzeButton() || {};
  if (res.button) button = res.button; else return
  if (res.resultsContainer) resultsContainer = res.resultsContainer;

  // Check if we have cached results
  const videoId = getVideoId();

  const cachedResult = await chrome.storage.local.get(videoId);
  if (cachedResult[videoId]) {
    if ('error' in cachedResult[videoId]) {
      button.style.cursor = 'not-allowed';
      button.innerHTML = isShorts ? '🙊' : 'No comments 🙊';
      resultsContainer.style.display = 'none';
      button.style.display = 'block';
      return
    }
    if (!isShorts) button.style.display = 'none';
    else button.disabled = true;
    updateResultsContainer(cachedResult[videoId]);
  }

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.innerHTML = isShorts ? '...' : 'Analyzing...';

    try {
      // Check if chrome.runtime is available
      if (!chrome?.runtime?.sendMessage) {
        throw new Error('Chrome extension API not available');
      }

      // Send message to background script to handle API calls
      const sentiment = await chrome.runtime.sendMessage({
        type: 'ANALYZE_SENTIMENT',
        videoId
      });

      // Check if chrome.storage is available
      if (chrome?.storage?.local) {
        // Cache the results
        await chrome.storage.local.set({ [videoId]: sentiment });
      }

      // Update UI
      if (!isShorts) button.style.display = 'none';
      else button.disabled = true;

      if ('error' in sentiment) {
        button.style.cursor = 'not-allowed';
        button.innerHTML = isShorts ? '🙊' : 'No comments 🙊';
        resultsContainer.style.display = 'none';
        button.style.display = 'block';
      } else {
        updateResultsContainer(sentiment);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      button.innerHTML = 'Error: ' + (error.message || 'Try Again');
    } finally {
      if (!isShorts) button.disabled = false;
    }
  });
}

let lastUrl = null;
function observeUrlChange() {
  
  // Create an observer instance to watch for both URL changes and new Shorts containers
  const urlObserver = new MutationObserver((mutations) => {
    // Check for URL changes
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (location.pathname.includes('/shorts/')) {
        init();
      }
    }

    // Check for new Shorts containers being added
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Element node
          // Look for the actions container in the added node
          const actionsContainer = node.querySelector('#actions');
          if (actionsContainer && !actionsContainer.querySelector('#sentiment-analyze-btn')) {
            init();
          }
        }
      });
    });
  });

  // Start observing with a configuration that watches for DOM changes
  urlObserver.observe(document, { 
    subtree: true, 
    childList: true,
    attributes: false
  });
}

// Modify the initialization at the bottom of the file
init();
if (window.location.pathname.includes('/shorts/')) {
  observeUrlChange();
} else {
  // Original observer for regular videos
  const observer = new MutationObserver(() => {
    init();
  });
  observer.observe(document.querySelector('head > title'), { 
    subtree: true, 
    childList: true 
  });
} 