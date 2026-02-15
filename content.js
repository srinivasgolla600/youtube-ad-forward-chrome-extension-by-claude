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
    // Only skip if we're actually in an ad
    if (!isAdPlaying()) {
      return false;
    }
    
    const video = document.querySelector('video.html5-main-video');
    if (video) {
      const duration = video.duration;
      
      // Only skip if it's a short video (likely an ad, not the main content)
      // Main videos are usually longer than 60 seconds
      if (isFinite(duration) && duration > 0 && duration < 60) {
        // Skip to extremely close to the end (0.01 seconds = 10 milliseconds)
        // This makes the ad end almost instantly after skip button appears
        video.currentTime = Math.max(0, duration - 0.01);
        console.log(`YouTube Ad Skipper: ⏭️ Fast-forwarded ${duration}s ad to ${video.currentTime}s`);
        return true;
      }
    }
  } catch (e) {
    console.log('YouTube Ad Skipper: Video skip failed:', e.message);
  }
  return false;
}

// Function to find and check if skip button exists
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

  // Try to fast-forward the ad video
  if (skipAdViaPlayerAPI()) {
    skipAttempts++;
    lastSkipTime = now;
    console.log(`YouTube Ad Skipper: ✅ Ad fast-forwarded! You can now click Skip manually. (Total: ${skipAttempts})`);
    return true;
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