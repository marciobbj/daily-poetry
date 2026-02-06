import {
  getCurrentPoem,
  saveCurrentPoem,
  selectRandomPoem,
  getCurrentBackground,
  saveCurrentBackground,
  clearCurrentBackground,
  getLanguage,
  saveLanguage
} from './storage.js';

const TRANSLATIONS = {
  pt: {
    searchPlaceholder: 'Pesquisar no Google...',
    newImage: 'Nova imagem',
    newPoem: 'Novo poema',
    changeLanguage: 'Change to English',
    readMore: 'ler mais'
  },
  en: {
    searchPlaceholder: 'Search on Google...',
    newImage: 'New image',
    newPoem: 'New poem',
    changeLanguage: 'Mudar para Português',
    readMore: 'read more'
  }
};

let currentLanguage = 'pt';

const DOM = {
  clock: document.getElementById('clock'),
  date: document.getElementById('date'),
  poemText: document.getElementById('poem-text'),
  poemAuthor: document.getElementById('poem-author'),
  poemTitle: document.getElementById('poem-title'),
  imageCredit: document.getElementById('image-credit'),
  refreshBackground: document.getElementById('refresh-background'),
  refreshPoem: document.getElementById('refresh-poem'),
  searchInput: document.getElementById('search-input'),
  langToggle: document.getElementById('lang-toggle'),
  langLabel: document.getElementById('lang-label')
};

let localPoems = [];

function updateClock() {
  const now = new Date();
  const locale = currentLanguage === 'pt' ? 'pt-BR' : 'en-US';
  
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  
  DOM.clock.textContent = timeFormatter.format(now);
  DOM.date.textContent = dateFormatter.format(now);
}

function displayPoem(poem) {
  const MAX_LINES = 5;
  const lines = poem.text.split('\n');
  const isTruncated = lines.length > MAX_LINES;
  const t = TRANSLATIONS[currentLanguage];
  
  if (isTruncated) {
    const truncatedText = lines.slice(0, MAX_LINES).join('\n');
    const searchQuery = encodeURIComponent(`${poem.title || ''} ${poem.author} poem`.trim());
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
    
    DOM.poemText.innerHTML = `${escapeHtml(truncatedText)}<span class="poem-ellipsis">...</span><a href="${searchUrl}" target="_blank" rel="noopener" class="poem-read-more">${t.readMore}</a>`;
  } else {
    DOM.poemText.textContent = poem.text;
  }
  
  DOM.poemAuthor.textContent = poem.author;
  DOM.poemTitle.textContent = poem.title || '';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/\n/g, '<br>');
}

function updateUI() {
  const t = TRANSLATIONS[currentLanguage];
  DOM.searchInput.placeholder = t.searchPlaceholder;
  DOM.refreshBackground.title = t.newImage;
  DOM.refreshPoem.title = t.newPoem;
  DOM.langToggle.title = t.changeLanguage;
  DOM.langLabel.textContent = currentLanguage.toUpperCase();
  document.documentElement.lang = currentLanguage === 'pt' ? 'pt-BR' : 'en';
}

async function toggleLanguage() {
  currentLanguage = currentLanguage === 'pt' ? 'en' : 'pt';
  await saveLanguage(currentLanguage);
  updateUI();
  updateClock();
}

function displayBackground(background) {
  if (background && background.url) {
    document.body.style.backgroundImage = `url('${background.url}')`;
    
    if (background.creditUrl) {
      DOM.imageCredit.innerHTML = `<a href="${background.creditUrl}" target="_blank" rel="noopener">${background.credit}</a>`;
    } else {
      DOM.imageCredit.textContent = background.credit || '';
    }
  }
}

async function loadLocalPoems() {
  try {
    const response = await fetch(chrome.runtime.getURL('data/poems.json'));
    const data = await response.json();
    localPoems = data.poems;
  } catch {
    localPoems = [
      {
        id: 'fallback-1',
        text: 'Tenho em mim todos os sonhos do mundo.',
        author: 'Fernando Pessoa',
        title: 'Livro do Desassossego',
        language: 'pt',
        lastUsed: null
      }
    ];
  }
}

async function fetchExternalPoem() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'fetchExternalPoem' }, (response) => {
      resolve(response);
    });
  });
}

async function getPoem(forceNew = false) {
  if (!forceNew) {
    const currentPoem = await getCurrentPoem();
    if (currentPoem) return currentPoem;
  }
  
  const useExternal = Math.random() < 0.3;
  
  if (useExternal) {
    try {
      const externalPoem = await fetchExternalPoem();
      if (externalPoem) {
        await saveCurrentPoem(externalPoem);
        return externalPoem;
      }
    } catch {
      // intentionally empty
    }
  }
  
  await loadLocalPoems();
  const languages = ['pt', 'en'];
  const randomLang = languages[Math.floor(Math.random() * languages.length)];
  const poem = await selectRandomPoem(localPoems, randomLang);
  await saveCurrentPoem(poem);
  return poem;
}

async function fetchBackground() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'fetchBackground' }, (response) => {
      resolve(response);
    });
  });
}

async function getBackground(forceNew = false) {
  if (!forceNew) {
    const current = await getCurrentBackground();
    if (current && current.url) return current;
  }
  
  try {
    const background = await fetchBackground();
    if (background && background.url) {
      await saveCurrentBackground(background);
      return background;
    }
  } catch {
    // intentionally empty
  }
  
  return null;
}

async function refreshPoem() {
  DOM.refreshPoem.classList.add('loading');
  try {
    const poem = await getPoem(true);
    displayPoem(poem);
  } finally {
    DOM.refreshPoem.classList.remove('loading');
  }
}

async function refreshBackground() {
  DOM.refreshBackground.classList.add('loading');
  try {
    await clearCurrentBackground();
    const background = await getBackground(true);
    if (background) displayBackground(background);
  } finally {
    DOM.refreshBackground.classList.remove('loading');
  }
}

function setupEventListeners() {
  DOM.refreshBackground.addEventListener('click', refreshBackground);
  DOM.refreshPoem.addEventListener('click', refreshPoem);
  DOM.langToggle.addEventListener('click', toggleLanguage);
  
  DOM.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && DOM.searchInput.value.trim()) {
      document.getElementById('search-form').submit();
    }
  });
}

async function init() {
  currentLanguage = await getLanguage();
  updateUI();
  updateClock();
  setInterval(updateClock, 1000);
  
  setupEventListeners();
  
  await loadLocalPoems();
  
  const [poem, background] = await Promise.all([
    getPoem(),
    getBackground()
  ]);
  
  displayPoem(poem);
  if (background) displayBackground(background);
  
  DOM.searchInput.focus();
}

init();
