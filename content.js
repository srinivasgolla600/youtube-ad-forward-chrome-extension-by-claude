// YouTube Ad Skipper Content Script
console.log('YouTube Ad Skipper: Extension loaded');

let isEnabled = true;
let skipAttempts = 0;
let lastSkipTime = 0;

// Load enabled state from storage
chrome.storage.sync.get(['enabled'], (result) => {
  isEnabled = result.enabled !== false;
  console.log('YouTube Ad Skipper: Enabled =', isEnabled);
});

// Listen for changes to enabled state
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.enabled) {
    isEnabled = changes.enabled.newValue;
    console.log('YouTube Ad Skipper: Enabled changed to', isEnabled);
  }
});

// Function to check if an ad is actually playing
function isAdPlaying() {
  const adContainer = document.querySelector('.ad-showing');
  const adText = document.querySelector('.ytp-ad-text');
  const adPlayerOverlay = document.querySelector('.ytp-ad-player-overlay');
  const previewAdText = document.querySelector('.ytp-ad-preview-text');
  
  return !!(adContainer || 
           (adText && adText.offsetParent !== null) || 
           (adPlayerOverlay && adPlayerOverlay.offsetParent !== null) ||
           (previewAdText && previewAdText.offsetParent !== null));
}

// Function to skip ad using YouTube player API
function skipAdViaPlayerAPI() {
  try {
    // Try to access YouTube's video player object
    const video = document.querySelector('video.html5-main-video');
    if (video) {
      // Check if duration is valid
      const duration = video.duration;
      console.log(`YouTube Ad Skipper: Video duration: ${duration}`);
      
      if (isFinite(duration) && duration > 0) {
        // Skip to the end of the ad
        video.currentTime = duration - 0.1; // Go to near the end
        console.log('YouTube Ad Skipper: ⏭️ Skipped ad via video API');
      } else {
        // If duration is infinite or invalid, try to skip ahead by a large amount
        video.currentTime = video.currentTime + 999999;
        console.log('YouTube Ad Skipper: ⏭️ Attempted to skip ad with large time jump');
      }
      
      // Also try to remove the ad overlay
      const adOverlay = document.querySelector('.ytp-ad-player-overlay');
      const adContainer = document.querySelector('.ytp-ad-overlay-container');
      const adModule = document.querySelector('.ytp-ad-module');
      
      if (adOverlay) {
        adOverlay.style.display = 'none';
        console.log('YouTube Ad Skipper: 🚫 Hid ad overlay');
      }
      if (adContainer) {
        adContainer.style.display = 'none';
        console.log('YouTube Ad Skipper: 🚫 Hid ad container');
      }
      if (adModule) {
        adModule.style.display = 'none';
        console.log('YouTube Ad Skipper: 🚫 Hid ad module');
      }
      
      return true;
    }
  } catch (e) {
    console.log('YouTube Ad Skipper: Video API method failed:', e.message);
  }
  return false;
}

// Function to simulate real user click with mouse movement
function clickElement(element) {
  if (!element) return false;
  
  console.log('YouTube Ad Skipper: 🖱️ Attempting to click element...');
  
  try {
    // Check if element is actually in the DOM
    if (!document.body.contains(element)) {
      console.log('YouTube Ad Skipper: ❌ Element not in DOM');
      return false;
    }
    
    // Check for pointer-events
    const style = window.getComputedStyle(element);
    console.log(`  - pointer-events: ${style.pointerEvents}`);
    console.log(`  - z-index: ${style.zIndex}`);
    
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Try clicking child elements too (sometimes the button has clickable children)
    const clickableChildren = element.querySelectorAll('div, span');
    console.log(`  - Found ${clickableChildren.length} child elements`);
    
    // Method 1: Simulate mouse movement first (anti-bot measure)
    try {
      const mouseMoveEvent = new MouseEvent('mousemove', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x - 10,
        clientY: y - 10,
        buttons: 0
      });
      document.dispatchEvent(mouseMoveEvent);
      
      const mouseEnter = new MouseEvent('mouseenter', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y
      });
      element.dispatchEvent(mouseEnter);
      console.log('YouTube Ad Skipper: ✓ Simulated mouse movement');
    } catch (e) {
      console.log('YouTube Ad Skipper: ✗ Mouse movement failed:', e.message);
    }
    
    // Small delay to simulate human reaction time
    setTimeout(() => {
      // Method 2: Complete click sequence with all events
      try {
        const mouseOver = new MouseEvent('mouseover', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y
        });
        
        const mouseDown = new MouseEvent('mousedown', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          button: 0,
          buttons: 1
        });
        
        const mouseUp = new MouseEvent('mouseup', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          button: 0,
          buttons: 1
        });
        
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          button: 0,
          buttons: 1
        });
        
        element.dispatchEvent(mouseOver);
        element.dispatchEvent(mouseDown);
        element.dispatchEvent(mouseUp);
        element.dispatchEvent(clickEvent);
        
        // Also try clicking child elements
        clickableChildren.forEach(child => {
          child.dispatchEvent(mouseDown);
          child.dispatchEvent(mouseUp);
          child.dispatchEvent(clickEvent);
        });
        
        console.log('YouTube Ad Skipper: ✓ Sent complete click sequence');
      } catch (e) {
        console.log('YouTube Ad Skipper: ✗ Click sequence failed:', e.message);
      }
      
      // Method 3: Regular click on element and children
      try {
        element.click();
        clickableChildren.forEach(child => child.click());
        console.log('YouTube Ad Skipper: ✓ Called click() on element and children');
      } catch (e) {
        console.log('YouTube Ad Skipper: ✗ element.click() failed:', e.message);
      }
    }, 50);
    
    return true;
  } catch (e) {
    console.error('YouTube Ad Skipper: ❌ All click methods failed:', e);
    return false;
  }
}

// Function to find and click skip button
function trySkipAd() {
  if (!isEnabled) return false;
  
  // Debounce - don't try to skip more than once every 2 seconds
  const now = Date.now();
  if (now - lastSkipTime < 2000) {
    return false;
  }

  // Only try to skip if an ad is actually playing
  if (!isAdPlaying()) {
    return false;
  }

  // Method 1: Try to skip via video API first (fastest method)
  if (skipAdViaPlayerAPI()) {
    skipAttempts++;
    lastSkipTime = now;
    console.log(`YouTube Ad Skipper: ✅ Ad skipped via video API! (Total skips: ${skipAttempts})`);
    return true;
  }

  // Method 2: Try to find and click skip button
  const skipButtonSelectors = [
    '.ytp-ad-skip-button-modern',
    '.ytp-ad-skip-button',
    '.ytp-skip-ad-button',
    'button.ytp-ad-skip-button-modern',
    'button.ytp-ad-skip-button',
    '.videoAdUiSkipButton',
    '.ytp-ad-skip-button-container button',
    'button[class*="skip"][class*="button"]'
  ];

  for (const selector of skipButtonSelectors) {
    const buttons = document.querySelectorAll(selector);
    
    for (const button of buttons) {
      if (!button || button.offsetParent === null) continue;
      
      const style = window.getComputedStyle(button);
      const rect = button.getBoundingClientRect();
      
      // Check if button is actually visible
      if (style.display === 'none' || 
          style.visibility === 'hidden' || 
          parseFloat(style.opacity) === 0 ||
          rect.width === 0 || 
          rect.height === 0) {
        continue;
      }
      
      // Check if button text contains "skip"
      const buttonText = button.textContent.toLowerCase();
      if (buttonText.includes('skip')) {
        console.log(`YouTube Ad Skipper: 🔍 Found skip button!`);
        console.log(`  - Selector: ${selector}`);
        console.log(`  - Text: "${buttonText}"`);
        console.log(`  - Classes: ${button.className}`);
        console.log(`  - Opacity: ${style.opacity}`);
        console.log(`  - Position:`, rect);
        console.log(`  - Element:`, button);
        
        if (clickElement(button)) {
          skipAttempts++;
          lastSkipTime = now;
          console.log(`YouTube Ad Skipper: ✅ Successfully clicked skip button! (Total skips: ${skipAttempts})`);
          return true;
        } else {
          console.log(`YouTube Ad Skipper: ❌ Click failed on element`);
        }
      }
    }
  }

  // Fallback: Search all buttons for skip text
  console.log('YouTube Ad Skipper: 🔍 Trying fallback search...');
  const allButtons = document.querySelectorAll('button');
  let skipButtonsFound = 0;
  
  for (const button of allButtons) {
    if (!button || button.offsetParent === null) continue;
    
    const text = button.textContent.toLowerCase();
    if (text === 'skip ad' || text === 'skip ads' || 
        (text.includes('skip') && text.includes('ad'))) {
      
      skipButtonsFound++;
      const rect = button.getBoundingClientRect();
      
      console.log(`YouTube Ad Skipper: 🔍 Fallback found button #${skipButtonsFound}`);
      console.log(`  - Text: "${text}"`);
      console.log(`  - Classes: ${button.className}`);
      console.log(`  - Size: ${rect.width}x${rect.height}`);
      console.log(`  - Element:`, button);
      
      if (rect.width > 0 && rect.height > 0) {
        if (clickElement(button)) {
          skipAttempts++;
          lastSkipTime = now;
          console.log(`YouTube Ad Skipper: ✅ Successfully clicked skip button! (Total skips: ${skipAttempts})`);
          return true;
        } else {
          console.log(`YouTube Ad Skipper: ❌ Click failed on element`);
        }
      }
    }
  }

  if (skipButtonsFound === 0) {
    console.log('YouTube Ad Skipper: ⚠️ No skip buttons found at all');
  }

  return false;
}

// Function to check for video ads
function checkForAds() {
  if (!isEnabled) return;
  
  if (isAdPlaying()) {
    trySkipAd();
  }
}

// Observe DOM changes for skip button appearance
const observer = new MutationObserver((mutations) => {
  if (!isEnabled || !isAdPlaying()) return;
  
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      // Small delay to let button fully render
      setTimeout(trySkipAd, 100);
      break;
    }
  }
});

// Start observing the video player container
function startObserving() {
  const playerContainer = document.querySelector('.html5-video-player') || document.body;
  
  if (playerContainer) {
    observer.observe(playerContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
    console.log('YouTube Ad Skipper: Observing DOM changes');
  }
}

// Initialize
setTimeout(() => {
  startObserving();
  checkForAds();
}, 2000);

// Periodic check for ads (backup method)
setInterval(checkForAds, 1000);

console.log('YouTube Ad Skipper: Initialization complete');