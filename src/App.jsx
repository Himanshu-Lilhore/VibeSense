import { useState, useEffect } from 'react';
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export default function App() {
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [thumbnailLoading, setThumbnailLoading] = useState(true);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [isShorts, setIsShorts] = useState(false);

  function getVideoId(url) {
    const urlObj = new URL(url);
    const isShorts = urlObj.pathname.includes('/shorts/');
    
    if (isShorts) {
      // For Shorts URLs: /shorts/CHbbpMvW01s
      return urlObj.pathname.split('/shorts/')[1];
    } else {
      // For regular videos: ?v=CHbbpMvW01s
      return new URLSearchParams(urlObj.search).get('v');
    }
  }

  useEffect(() => {
    async function getCurrentVideoSentiment() {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        setIsShorts(tab.url.includes('/shorts/'));
        const videoId = getVideoId(tab.url);
        if (videoId) {
          // Check cached results
          const result = await chrome.storage.local.get(videoId);
          if (result[videoId].error) {
            setSentiment('error');
          } else {
            setSentiment(result[videoId]);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    async function getThumbnail() {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const videoId = getVideoId(tab.url);
        if (videoId) {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails`
          );
          if (!response.ok) {
            throw new Error('Failed to fetch thumbnail');
          }
          const responseObj = await response.json();
          const thumbnailUrl = responseObj.items[0].snippet.thumbnails.high.url ||
            responseObj.items[0].snippet.thumbnails.default.url;
          setThumbnailUrl(thumbnailUrl);
        }
      } catch (error) {
        console.error('Error fetching thumbnail:', error);
      } finally {
        setThumbnailLoading(false);
        setThumbnailLoaded(true);
      }
    }

    getCurrentVideoSentiment();
    getThumbnail();
  }, []);

  if (loading) {
    return <div className="w-64 h-32 flex items-center justify-center">Loading...</div>;
  }

  if (!sentiment) {
    return (
      <div className="w-64 p-4 flex flex-col items-center justify-center gap-3 relative text-slate-200 font-sans">
        <Title />

        <div className='text-base flex flex-row gap-1.5 flex-wrap items-center pt-4'>
          {'Click the Analyze button next to a YouTube video title...'
            .split(' ')
            .map((word, idx) => {
              if (word === 'Analyze') {
                return <div key={idx} className='bg-green-700 text-white px-2 rounded-full'>{word}✨</div>
              } else {
                return <div key={idx} className='font-semibold text-slate-300'>{word}</div>
              }
            })}
          <GithubIcon />
        </div>

        <BackgroundSvg />
      </div>
    );
  }

  return (
    <div className="w-64 p-4 flex flex-col items-center justify-center gap-3 relative text-slate-200 font-sans">

      <Title />

      {/* Thumbnail with dynamic height */}
      <div className={`relative ${isShorts ? 'w-1/2 h-48' : 'w-full h-32'} rounded-md overflow-hidden border-2 border-slate-600 shadow-md shadow-slate-900`}>
        {/* skeleton */}
        {thumbnailLoaded ?
          <img
            className={`absolute z-10 top-0 left-0 h-full w-full object-cover transition-opacity delay-500 duration-[1.3s]
            ${thumbnailLoading ? 'opacity-100' : 'opacity-0'}`}
            src='/imageAnimation.gif'
          /> :
          <img
            className={`absolute top-0 left-0 h-full w-full object-cover`}
            src='/imageStillSkeleton.png'
          />
        }
        {/* actual thumbnail */}
        <img
          className={`h-full w-full object-cover z-10`}
          src={thumbnailUrl}
          alt="thumbnail"
        />
      </div>

      {sentiment === 'error' ?
        <div className='text-lg text-slate-200 font-semibold flex flex-row gap-1 items-center'>No comments 🙊
          <div className='size-5 bg-black/15 backdrop-blur-md rounded-md flex items-center justify-center'><GithubIcon /></div>
        </div>
        :
        <>
          <SentimentBar sentiment={sentiment} />
          <Topics sentiment={sentiment} />
        </>
      }

      <BackgroundSvg />

    </div>
  );
}

function Title() {
  return (
    <div className='text-3xl font-bold flex flex-row'>
      <div className='text-blue-500'>Vibe</div>
      <div className='text-orange-500'>Sense</div>
    </div>
  )
}
function SentimentBar({ sentiment }) {
  return (
    <div className="flex h-4 rounded-full overflow-hidden w-full text-black text-xs font-semibold">
      <div
        className="bg-green-600 flex items-center justify-center"
        style={{ width: `${sentiment.positive * 100}%` }}
      >
        {Math.round(sentiment.positive * 100)}%
      </div>
      <div
        className="bg-red-600 flex items-center justify-center"
        style={{ width: `${sentiment.negative * 100}%` }}
      >
        {Math.round(sentiment.negative * 100)}%
      </div>
    </div>
  )
}
function Topics({ sentiment }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs font-semibold w-full relative">Most discussed:
        <div className='absolute right-2 top-0 z-50 size-5 bg-black/15 backdrop-blur-md rounded-md flex items-center justify-center'>
          <GithubIcon />
        </div>
      </div>
      <div className="flex flex-row gap-1 flex-wrap">
        {sentiment.topics?.map((topic, index) => (
          <div key={index} className="text-sm text-white px-2 py-1 bg-gray-800/60 backdrop-blur-sm rounded-md">{topic}</div>
        )) || <div className="text-sm text-white">No topics found</div>}
      </div>
    </div>
  )
}


function BackgroundSvg() {
  return (
    <div className='w-full h-full overflow-hidden absolute top-0 left-0 -z-10'>
      <svg id="visual" viewBox="0 0 600 900" width="600" height="900" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
        <path d="M413 900L440 850C467 800 521 700 529 600C537 500 499 400 481 300C463 200 465 100 466 50L467 0L600 0L600 50C600 100 600 200 600 300C600 400 600 500 600 600C600 700 600 800 600 850L600 900Z" fill="#1c0136"></path>
        <path d="M365 900L399 850C433 800 501 700 517 600C533 500 497 400 477 300C457 200 453 100 451 50L449 0L468 0L467 50C466 100 464 200 482 300C500 400 538 500 530 600C522 700 468 800 441 850L414 900Z" fill="#520e4c"></path>
        <path d="M317 900L340 850C363 800 409 700 409 600C409 500 363 400 361 300C359 200 401 100 422 50L443 0L450 0L452 50C454 100 458 200 478 300C498 400 534 500 518 600C502 700 434 800 400 850L366 900Z" fill="#891f5b"></path>
        <path d="M269 900L296 850C323 800 377 700 383 600C389 500 347 400 349 300C351 200 397 100 420 50L443 0L444 0L423 50C402 100 360 200 362 300C364 400 410 500 410 600C410 700 364 800 341 850L318 900Z" fill="#be3a62"></path>
        <path d="M239 900L263 850C287 800 335 700 345 600C355 500 327 400 337 300C347 200 395 100 419 50L443 0L444 0L421 50C398 100 352 200 350 300C348 400 390 500 384 600C378 700 324 800 297 850L270 900Z" fill="#ee5e62"></path>
        <path d="M227 900L253 850C279 800 331 700 337 600C343 500 303 400 313 300C323 200 383 100 413 50L443 0L444 0L420 50C396 100 348 200 338 300C328 400 356 500 346 600C336 700 288 800 264 850L240 900Z" fill="#ff6f61"></path>
        <path d="M197 900L226 850C255 800 313 700 318 600C323 500 275 400 282 300C289 200 351 100 382 50L413 0L444 0L414 50C384 100 324 200 314 300C304 400 344 500 338 600C332 700 280 800 254 850L228 900Z" fill="#ff6f61"></path>
        <path d="M161 900L174 850C187 800 213 700 209 600C205 500 171 400 175 300C179 200 221 100 242 50L263 0L414 0L383 50C352 100 290 200 283 300C276 400 324 500 319 600C314 700 256 800 227 850L198 900Z" fill="#ee5e62"></path>
        <path d="M107 900L117 850C127 800 147 700 148 600C149 500 131 400 136 300C141 200 169 100 183 50L197 0L264 0L243 50C222 100 180 200 176 300C172 400 206 500 210 600C214 700 188 800 175 850L162 900Z" fill="#be3a62"></path>
        <path d="M23 900L29 850C35 800 47 700 48 600C49 500 39 400 46 300C53 200 77 100 89 50L101 0L198 0L184 50C170 100 142 200 137 300C132 400 150 500 149 600C148 700 128 800 118 850L108 900Z" fill="#891f5b"></path>
        <path d="M17 900L23 850C29 800 41 700 43 600C45 500 37 400 42 300C47 200 65 100 74 50L83 0L102 0L90 50C78 100 54 200 47 300C40 400 50 500 49 600C48 700 36 800 30 850L24 900Z" fill="#520e4c"></path>
        <path d="M0 900L0 850C0 800 0 700 0 600C0 500 0 400 0 300C0 200 0 100 0 50L0 0L84 0L75 50C66 100 48 200 43 300C38 400 46 500 44 600C42 700 30 800 24 850L18 900Z" fill="#1c0136"></path>
      </svg>
    </div>
  )
}

function GithubIcon() {
  return (
    <a href="https://github.com/Himanshu-Lilhore/yt-sentiment-ext" target="_blank" className='size-4'>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" id="github">
        <path d="M7.999 0C3.582 0 0 3.596 0 8.032a8.031 8.031 0 0 0 5.472 7.621c.4.074.546-.174.546-.387 0-.191-.007-.696-.011-1.366-2.225.485-2.695-1.077-2.695-1.077-.363-.928-.888-1.175-.888-1.175-.727-.498.054-.488.054-.488.803.057 1.225.828 1.225.828.714 1.227 1.873.873 2.329.667.072-.519.279-.873.508-1.074-1.776-.203-3.644-.892-3.644-3.969 0-.877.312-1.594.824-2.156-.083-.203-.357-1.02.078-2.125 0 0 .672-.216 2.2.823a7.633 7.633 0 0 1 2.003-.27 7.65 7.65 0 0 1 2.003.271c1.527-1.039 2.198-.823 2.198-.823.436 1.106.162 1.922.08 2.125.513.562.822 1.279.822 2.156 0 3.085-1.87 3.764-3.652 3.963.287.248.543.738.543 1.487 0 1.074-.01 1.94-.01 2.203 0 .215.144.465.55.386A8.032 8.032 0 0 0 16 8.032C16 3.596 12.418 0 7.999 0z"></path>
      </svg>
    </a>
  )
} 