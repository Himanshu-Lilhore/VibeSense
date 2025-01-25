import { fetchComments } from './utils/youtubeApi';
import { analyzeSentiment } from './utils/llmApi';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYZE_SENTIMENT') {
    handleAnalysis(message.videoId)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // Will respond asynchronously
  }
});

async function handleAnalysis(videoId) {
  const comments = await fetchComments(videoId);
  const sentiment = await analyzeSentiment(comments);
  return sentiment;
} 