<div align="center">
  <img src="icons/icon128.png" alt="Daily Poetry Icon" width="128" height="128">
  
  # Daily Poetry
  
  **A beautiful new tab extension with daily poems and HD nature backgrounds**
</div>

![Daily Poetry Screenshot](imgs/screenshot_1.png)

---

## Features

- **Live Clock** — Real-time display with date in your locale
- **Daily Poems** — Curated collection in Portuguese and English, with external API support (PoetryDB)
- **HD Backgrounds** — Stunning nature images from Picsum and Wallhaven
- **Smart Rotation** — Poems automatically change every day; used poems won't repeat for 30 days
- **Google Search** — Integrated search bar
- **Minimalist Design** — Clean, distraction-free interface with elegant typography

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open `brave://extensions/` (or `chrome://extensions/`)
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `daily-poetry-extension` folder

## Project Structure

```
daily-poetry-extension/
├── manifest.json          # Extension configuration
├── newtab.html            # Main page structure
├── css/
│   └── styles.css         # Styling
├── js/
│   ├── background.js      # Service worker (API calls)
│   ├── newtab.js          # Main logic
│   └── storage.js         # Poem rotation & storage
├── data/
│   └── poems.json         # Local poems database
├── imgs/
│   └── screenshot_1.png   # Extension screenshot
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Configuration

### Poem Sources

- **Local**: 40 curated poems in `data/poems.json` (Portuguese & English)
- **External**: [PoetryDB](https://poetrydb.org/) API (30% chance per refresh)

### Image Sources

- [Lorem Picsum](https://picsum.photos/) — Random HD photos
- [Wallhaven](https://wallhaven.cc/) — Nature, landscape, minimalist wallpapers

## Browser Compatibility

- Brave Browser
- Google Chrome
- Microsoft Edge
- Any Chromium-based browser

## Contributing

Contributions are welcome! Here's how you can help:

### Adding Poems

**Pull requests adding more poems are always welcome!**

To add poems, edit `data/poems.json` following this structure:

```json
{
  "id": "pt-021",
  "text": "Your poem text here.\nUse \\n for line breaks.",
  "author": "Author Name",
  "title": "Poem Title",
  "language": "pt",
  "lastUsed": null
}
```

- Use `pt` for Portuguese, `en` for English
- Keep poems concise (ideally under 6 lines for best display)
- Ensure proper attribution

### Other Contributions

- Bug fixes
- New features
- UI/UX improvements
- Translations

## License

MIT License — feel free to use, modify, and distribute.

---

<div align="center">
  <sub>Made with poetry and code</sub>
</div>
