import { useState, useEffect } from 'react';
import { fetchComments } from './utils/youtubeApi';
import { analyzeSentiment } from './utils/llmApi';

function App() {
  const [videoId, setVideoId] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get current tab's YouTube video ID
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const url = tabs[0].url;
      const videoId = url.match(/(?<=v=)[^&]*/)?.[0];
      setVideoId(videoId);
    });
  }, []);

  const analyzeComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch top 100 comments
      const comments = await fetchComments(videoId);
      
      // Analyze sentiment using LLM
      const result = await analyzeSentiment(comments);
      setSentiment(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 p-4 bg-gray-100">
      <h1 className="text-xl font-bold mb-4">YouTube Sentiment Analyzer</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {error}
        </div>
      )}

      {videoId ? (
        <button
          onClick={analyzeComments}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Sentiment'}
        </button>
      ) : (
        <p className="text-gray-600">Please open a YouTube video</p>
      )}

      {sentiment && (
        <div className="mt-4">
          <div className="flex justify-between mb-2">
            <span>Positive</span>
            <span>{(sentiment.positive * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full"
              style={{ width: `${sentiment.positive * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mb-2 mt-4">
            <span>Negative</span>
            <span>{(sentiment.negative * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-red-600 h-2.5 rounded-full"
              style={{ width: `${sentiment.negative * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 