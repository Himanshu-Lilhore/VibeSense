import { useState, useEffect } from 'react';

function App() {
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getCurrentVideoSentiment() {
      try {
        // Get current tab's YouTube video ID
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const videoId = new URLSearchParams(new URL(tab.url).search).get('v');
        
        if (videoId) {
          // Check cached results
          const result = await chrome.storage.local.get(videoId);
          if (result[videoId]) {
            setSentiment(result[videoId]);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    getCurrentVideoSentiment();
  }, []);

  if (loading) {
    return <div className="w-64 h-32 flex items-center justify-center">Loading...</div>;
  }

  if (!sentiment) {
    return (
      <div className="w-64 h-32 flex items-center justify-center text-center">
        Click the Analyze button next to the video title
      </div>
    );
  }

  return (
    <div className="w-64 p-4">
      <div className="flex h-8 rounded-full overflow-hidden">
        <div
          className="bg-green-600 flex items-center justify-center text-white text-sm"
          style={{ width: `${sentiment.positive * 100}%` }}
        >
          {Math.round(sentiment.positive * 100)}%
        </div>
        <div
          className="bg-red-600 flex items-center justify-center text-white text-sm"
          style={{ width: `${sentiment.negative * 100}%` }}
        >
          {Math.round(sentiment.negative * 100)}%
        </div>
      </div>
    </div>
  );
}

export default App; 