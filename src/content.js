// This file is injected into the YouTube page
// You can use it to interact with the page if needed
console.log('YouTube Sentiment Analyzer loaded');


let button = null, resultsContainer = null;

// Function to inject button next to title
function injectAnalyzeButton() {
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
    font-weight: 500;
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

  return { button, resultsContainer };
}

// Function to update result bar
function updateResultsContainer(sentiment) {
  const resultsContainer = document.querySelector('#sentiment-result-bar');
  if (!resultsContainer) return;

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

// Initialize and handle analysis
async function init() {
  if(button) button.remove();
  if(resultsContainer) resultsContainer.remove();

  const res = injectAnalyzeButton() || {};
  if(res.button)button = res.button; else return
  if(res.resultsContainer) resultsContainer = res.resultsContainer;

  // Check if we have cached results
  const videoId = new URLSearchParams(window.location.search).get('v');

  const cachedResult = await chrome.storage.local.get(videoId);
  if (cachedResult[videoId]) {
    button.style.display = 'none';
    updateResultsContainer(cachedResult[videoId]);
    return
  }

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.innerHTML = 'Analyzing...';

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
      button.style.display = 'none';
      updateResultsContainer(sentiment);
    } catch (error) {
      console.error('Analysis failed:', error);
      button.innerHTML = 'Error: ' + (error.message || 'Try Again');
    } finally {
      button.disabled = false;
    }
  });
}

// Run on page load and URL changes
init();
const observer = new MutationObserver(() => {
  init();

});

observer.observe(document.querySelector('head > title'), { subtree: true, childList: true }); 