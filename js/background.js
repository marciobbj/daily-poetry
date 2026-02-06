async function fetchPicsumImage() {
  const width = 1920;
  const height = 1080;
  const randomId = Math.floor(Math.random() * 1000);
  const url = `https://picsum.photos/id/${randomId}/${width}/${height}`;
  
  const response = await fetch(url, { method: 'HEAD' });
  if (!response.ok) {
    const fallbackUrl = `https://picsum.photos/${width}/${height}?random=${Date.now()}`;
    return {
      url: fallbackUrl,
      source: 'Picsum',
      credit: 'Photo from Lorem Picsum',
      creditUrl: 'https://picsum.photos'
    };
  }
  
  return {
    url: response.url || url,
    source: 'Picsum',
    credit: 'Photo from Lorem Picsum',
    creditUrl: 'https://picsum.photos'
  };
}

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
  const sources = [fetchPicsumImage, fetchWallhavenImage];
  const shuffled = sources.sort(() => Math.random() - 0.5);
  
  for (const fetchFn of shuffled) {
    try {
      const result = await fetchFn();
      if (result && result.url) return result;
    } catch (e) {
      console.log('Image source failed:', e.message);
      continue;
    }
  }
  
  return {
    url: `https://picsum.photos/1920/1080?random=${Date.now()}`,
    source: 'Picsum',
    credit: 'Photo from Lorem Picsum',
    creditUrl: 'https://picsum.photos'
  };
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
    fetchRandomBackground().then(sendResponse);
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
