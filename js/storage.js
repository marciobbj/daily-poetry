const STORAGE_KEYS = {
  POEMS_USAGE: 'poemsUsage',
  CURRENT_POEM: 'currentPoem',
  CURRENT_BACKGROUND: 'currentBackground',
  LAST_POEM_DATE: 'lastPoemDate',
  LANGUAGE: 'language'
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function getPoemsUsage() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.POEMS_USAGE);
  return result[STORAGE_KEYS.POEMS_USAGE] || {};
}

export async function markPoemAsUsed(poemId) {
  const usage = await getPoemsUsage();
  usage[poemId] = Date.now();
  await chrome.storage.local.set({ [STORAGE_KEYS.POEMS_USAGE]: usage });
}

export async function getAvailablePoems(allPoems) {
  const usage = await getPoemsUsage();
  const now = Date.now();
  
  const available = allPoems.filter(poem => {
    const lastUsed = usage[poem.id];
    if (!lastUsed) return true;
    return (now - lastUsed) > THIRTY_DAYS_MS;
  });
  
  if (available.length === 0) {
    await chrome.storage.local.remove(STORAGE_KEYS.POEMS_USAGE);
    return allPoems;
  }
  
  return available;
}

export async function selectRandomPoem(allPoems, preferredLanguage = null) {
  let available = await getAvailablePoems(allPoems);
  
  if (preferredLanguage) {
    const languageFiltered = available.filter(p => p.language === preferredLanguage);
    if (languageFiltered.length > 0) {
      available = languageFiltered;
    }
  }
  
  const randomIndex = Math.floor(Math.random() * available.length);
  const selectedPoem = available[randomIndex];
  
  await markPoemAsUsed(selectedPoem.id);
  
  return selectedPoem;
}

export async function getCurrentPoem() {
  const result = await chrome.storage.local.get([
    STORAGE_KEYS.CURRENT_POEM,
    STORAGE_KEYS.LAST_POEM_DATE
  ]);
  
  const today = new Date().toDateString();
  const lastDate = result[STORAGE_KEYS.LAST_POEM_DATE];
  
  if (lastDate === today && result[STORAGE_KEYS.CURRENT_POEM]) {
    return result[STORAGE_KEYS.CURRENT_POEM];
  }
  
  return null;
}

export async function saveCurrentPoem(poem) {
  await chrome.storage.local.set({
    [STORAGE_KEYS.CURRENT_POEM]: poem,
    [STORAGE_KEYS.LAST_POEM_DATE]: new Date().toDateString()
  });
}

export async function getCurrentBackground() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.CURRENT_BACKGROUND);
  return result[STORAGE_KEYS.CURRENT_BACKGROUND] || null;
}

export async function saveCurrentBackground(background) {
  await chrome.storage.local.set({
    [STORAGE_KEYS.CURRENT_BACKGROUND]: background
  });
}

export async function clearCurrentBackground() {
  await chrome.storage.local.remove(STORAGE_KEYS.CURRENT_BACKGROUND);
}

export async function getLanguage() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.LANGUAGE);
  return result[STORAGE_KEYS.LANGUAGE] || 'pt';
}

export async function saveLanguage(language) {
  await chrome.storage.local.set({ [STORAGE_KEYS.LANGUAGE]: language });
}
