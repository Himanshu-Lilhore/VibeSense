const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export async function fetchComments(videoId) {
  try {
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key is not configured');
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    const data = await response.json();
    return data.items.map(item => item.snippet.topLevelComment.snippet.textDisplay);
  } catch (error) {
    throw new Error('Error fetching comments: ' + error.message);
  }
} 