// This file is injected into the YouTube page
// You can use it to interact with the page if needed
console.log('YouTube Sentiment Analyzer loaded');

// Function to inject button next to title
function injectAnalyzeButton() {
  const titleContainer = document.querySelector('#title h1');
  if (!titleContainer || document.querySelector('#sentiment-analyze-btn')) return;

  const button = document.createElement('button');
  button.id = 'sentiment-analyze-btn';
  button.className = 'sentiment-btn';
  button.innerHTML = 'Analyze Sentiment';
  button.style.cssText = `
    margin-left: 10px;
    padding: 8px 16px;
    border-radius: 18px;
    border: none;
    background: #065f46;
    color: white;
    font-size: 14px;
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
  const resultBar = document.createElement('div');
  resultBar.id = 'sentiment-result-bar';
  resultBar.style.cssText = `
    margin-left: 10px;
    height: 24px;
    width: 200px;
    border-radius: 12px;
    overflow: hidden;
    display: none;
    position: relative;
  `;

  titleContainer.appendChild(button);
  titleContainer.appendChild(resultBar);

  return { button, resultBar };
}

// Function to update result bar
function updateResultBar(sentiment) {
  const resultBar = document.querySelector('#sentiment-result-bar');
  if (!resultBar) return;

  resultBar.style.display = 'flex';
  resultBar.innerHTML = `
    <div style="
      width: ${sentiment.positive * 100}%;
      height: 100%;
      background: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
    ">${Math.round(sentiment.positive * 100)}%</div>
    <div style="
      width: ${sentiment.negative * 100}%;
      height: 100%;
      background: #dc2626;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
    ">${Math.round(sentiment.negative * 100)}%</div>
  `;
}

// Initialize and handle analysis
async function init() {
  const { button, resultBar } = injectAnalyzeButton() || {};
  if (!button) return;

  // Check if we have cached results
  const videoId = new URLSearchParams(window.location.search).get('v');
  const cachedResult = await chrome.storage.local.get(videoId);
  
  if (cachedResult[videoId]) {
    button.style.display = 'none';
    updateResultBar(cachedResult[videoId]);
  }

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.innerHTML = 'Analyzing...';

    try {
      // Send message to background script to handle API calls
      const sentiment = await chrome.runtime.sendMessage({
        type: 'ANALYZE_SENTIMENT',
        videoId
      });

      // Cache the results
      await chrome.storage.local.set({ [videoId]: sentiment });

      // Update UI
      button.style.display = 'none';
      updateResultBar(sentiment);
    } catch (error) {
      button.innerHTML = 'Error: Try Again';
      console.error('Analysis failed:', error);
    } finally {
      button.disabled = false;
    }
  });
}

// Run on page load and URL changes
init();
const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    init();
  }
});

let lastUrl = window.location.href;
observer.observe(document.querySelector('head > title'), { subtree: true, childList: true }); 