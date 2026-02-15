# YouTube Ad Skipper Chrome Extension

Automatically skips YouTube ads by clicking the "Skip Ad" button as soon as it appears.

## Features

- 🚀 Automatically detects and clicks skip buttons on YouTube ads
- ⚡ Works in real-time with DOM monitoring
- 🎯 Multiple detection methods for reliability
- 🎛️ Easy on/off toggle via popup
- 🎨 Beautiful gradient UI
- 💾 Remembers your preference

## Installation

### Method 1: Load Unpacked Extension (For Testing)

1. **Download or Clone this repository**
   ```bash
   git clone <https://github.com/srinivasgolla600/youtube-ad-forward-chrome-extension-by-claude.git>
   ```

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or click Menu (⋮) → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `youtube-ad-skipper` folder
   - The extension should now appear in your extensions list

5. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "YouTube Ad Skipper"
   - Click the pin icon to keep it visible

## Usage

1. **Open YouTube** and play any video with ads
2. **The extension works automatically** - when the skip button appears, it will be clicked instantly
3. **Toggle on/off** by clicking the extension icon and using the switch
4. **Check console** (F12 → Console) to see skip attempts logged

## File Structure

```
youtube-ad-skipper/
├── manifest.json       # Extension configuration
├── content.js          # Main script that detects and skips ads
├── popup.html          # Extension popup UI
├── popup.js            # Popup functionality
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # This file
```

## How It Works

1. **Content Script Injection**: The extension injects `content.js` into all YouTube pages
2. **DOM Monitoring**: Uses MutationObserver to watch for changes in the page
3. **Button Detection**: Checks for skip buttons using multiple selectors and text matching
4. **Auto-Click**: Automatically clicks the button when detected and visible
5. **Periodic Checks**: Backup polling every 500ms to ensure no ads are missed

## Troubleshooting

**Extension not working?**
- Make sure the extension is enabled in `chrome://extensions/`
- Check that the toggle in the popup is ON (green)
- Try refreshing the YouTube page
- Check browser console (F12) for any errors

**Skip button not being clicked?**
- YouTube might have changed their HTML structure
- Check console logs to see if buttons are being detected
- Report the issue so selectors can be updated

## Development

To modify the extension:

1. Edit the files as needed
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test on YouTube

## Privacy

- This extension only runs on YouTube.com
- No data is collected or transmitted
- All processing happens locally in your browser
- Source code is open and available for review

## Contributing

Feel free to submit issues or pull requests to improve the extension!

## License

MIT License - feel free to use and modify as needed.

## Disclaimer

This extension is for educational purposes. Use responsibly and in accordance with YouTube's Terms of Service.
