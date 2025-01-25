const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

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
            text: `Analyze the sentiment of these YouTube comments. Return only a JSON object with 'positive' and 'negative' ratios that sum to 1.0. For example: {"positive": 0.7, "negative": 0.3}. Here are the comments:\n\n${commentsText}`
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

// curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyA364F3qTE_PZwa421R1H1yFoZ2_H5E_CQ" -H "Content-Type: application/json" -X POST -d "{ \"contents\": [{ \"parts\":[{\"text\": \"Explain how AI works\"}] }] }"