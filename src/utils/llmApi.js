const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const model =
  'gemini-1.5-flash';
  // 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export async function analyzeSentiment(comments) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const commentsText = comments.join('\n').substring(0, 30000);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze these YouTube comments and return a JSON object with:
            1. Sentiment ratios ('positive' and 'negative' that sum to 1.0)
            2. Top 4 most mentioned topics/themes ('topics' array)
            
            Format: {
              "positive": 0.7,
              "negative": 0.3,
              "topics": ["topic1", "topic2", "topic3", "topic4"]
            }
            
            Comments:\n\n${commentsText}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze sentiment');
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    throw new Error('Error analyzing sentiment: ' + error.message);
  }
}