import { getBackgroundState, saveCurrentBackground } from './storage.js';

async function fetchWallhavenImage() {
  const queries = ['nature', 'landscape', 'flowers', 'minimalist', 'calm', 'mountain', 'ocean', 'forest'];
  const query = queries[Math.floor(Math.random() * queries.length)];
  
  const params = new URLSearchParams({
    q: query,
    categories: '100',
    purity: '100',
    sorting: 'random',
    atleast: '1920x1080'
  });
  
  const response = await fetch(`https://wallhaven.cc/api/v1/search?${params}`);
  if (!response.ok) throw new Error('Wallhaven fetch failed');
  
  const data = await response.json();
  if (!data.data || data.data.length === 0) throw new Error('No Wallhaven images found');
  
  const image = data.data[Math.floor(Math.random() * Math.min(data.data.length, 10))];
  
  return {
    url: image.path,
    source: 'Wallhaven',
    credit: 'Photo from Wallhaven',
    creditUrl: image.url
  };
}

async function fetchRandomBackground() {
  try {
    return await fetchWallhavenImage();
  } catch (e) {
    console.log('Image source failed:', e.message);
  }

  return null;
}

function getTodayKey() {
  return new Date().toDateString();
}

function getNextMidnight() {
  const next = new Date();
  next.setHours(24, 0, 0, 0);
  return next.getTime();
}

async function ensureDailyBackground(forceNew = false) {
  const { background, lastBackgroundDate } = await getBackgroundState();
  const today = getTodayKey();

  if (!forceNew && background && lastBackgroundDate === today) {
    return background;
  }

  const nextBackground = await fetchRandomBackground();
  if (nextBackground && nextBackground.url) {
    await saveCurrentBackground(nextBackground);
    return nextBackground;
  }

  return background;
}

const POETRYDB_URL = 'https://poetrydb.org/random/1';

async function fetchExternalPoem() {
  const response = await fetch(POETRYDB_URL);
  if (!response.ok) throw new Error('PoetryDB fetch failed');
  
  const data = await response.json();
  if (!data || data.length === 0) throw new Error('No poem returned');
  
  const poem = data[0];
  const lines = poem.lines.slice(0, 6).join('\n');
  
  return {
    id: `external-${Date.now()}`,
    text: lines,
    author: poem.author,
    title: poem.title,
    language: 'en',
    source: 'poetrydb',
    lastUsed: null
  };
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'fetchBackground') {
    ensureDailyBackground(Boolean(request.forceNew)).then(sendResponse);
    return true;
  }
  
  if (request.action === 'fetchExternalPoem') {
    fetchExternalPoem()
      .then(sendResponse)
      .catch(() => sendResponse(null));
    return true;
  }
  
  return false;
});

chrome.runtime.onInstalled.addListener(() => {
  ensureDailyBackground().catch(() => {});
  chrome.alarms.create('refresh-daily-background', {
    when: getNextMidnight()
  });
});

chrome.runtime.onStartup?.addListener(() => {
  ensureDailyBackground().catch(() => {});
  chrome.alarms.create('refresh-daily-background', {
    when: getNextMidnight()
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refresh-daily-background') {
    ensureDailyBackground(true)
      .catch(() => {})
      .finally(() => {
        chrome.alarms.create('refresh-daily-background', {
          when: getNextMidnight()
        });
      });
  }
});
