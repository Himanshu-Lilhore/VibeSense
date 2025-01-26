# ![image](https://github.com/user-attachments/assets/832c715c-69a3-4093-a230-ed55cf2a8858) 

A browser extension built with **React** and tailwind that analyzes the sentiment of YouTube video comments using a Large Language Model.


## 🛠️ Tech Stack
- **React**
- **YouTube API**: To fetch video comments.
- **LLM API** (Gemini here): For analyzing the sentiment of comments.
- **JavaScript**
- **HTML & CSS**


## 🚀 How to setup locally
1. Clone this repository:
   ```bash
   git clone https://github.com/Himanshu-Lilhore/yt-sentiment-ext.git
   cd yt-sentiment-ext
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Get your API keys for:
   - **YouTube API Key**: [Get it here](https://console.cloud.google.com/apis).
   - **LLM API Key**: From the LLM you're using ([Google Gemini](https://aistudio.google.com/apikey)).

4. Create a `.env` file and add your API keys:
   ```
   VITE_YOUTUBE_API_KEY=your-youtube-api-key
   VITE_GEMINI_API_KEY=your-llm-api-key
   ```

5. Start the development server:
   ```bash
   npm start
   ```

6. Build the extension:
   ```bash
   npm run build
   ```

7. Load the extension in your browser:
   - Open your browser's extensions page.
   - Enable "Developer Mode."
   - Click "Load unpacked" and select the `build` folder.


## 🧪 How to use
1. Go to any YouTube video.
2. Click on the extension icon in your browser.
3. Watch the magic as the comments are analyzed and the sentiment is displayed! ✨


## 📚 How It Works
1. The extension fetches the **top 100 comments** of a video using the **YouTube API**.
2. These comments are sent to an **LLM API** for sentiment analysis.
3. The result is given as a ratio (Positive : Negative) and displayed in the UI.


## 🖼️Visuals
![image](https://github.com/user-attachments/assets/18f37bac-3f38-437e-8620-467ab5d7e862)


![Screenshot 2025-01-25 155851](https://github.com/user-attachments/assets/cb1dd585-2260-42ae-8c2f-21b8608b4e26)


## 📃 License
This project is licensed under the [MIT License](LICENSE).
