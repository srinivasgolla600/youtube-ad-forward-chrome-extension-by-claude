// Popup Script for YouTube Ad Skipper

const toggleSwitch = document.getElementById('toggleSwitch');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');

// Load current state
chrome.storage.sync.get(['enabled'], (result) => {
  const enabled = result.enabled !== false; // Default to true
  updateUI(enabled);
});

// Update UI based on enabled state
function updateUI(enabled) {
  if (enabled) {
    toggleSwitch.classList.add('active');
    statusIndicator.classList.add('active');
    statusIndicator.classList.remove('inactive');
    statusText.textContent = 'Active - Skipping ads';
  } else {
    toggleSwitch.classList.remove('active');
    statusIndicator.classList.remove('active');
    statusIndicator.classList.add('inactive');
    statusText.textContent = 'Inactive - Ads will play';
  }
}

// Toggle functionality
toggleSwitch.addEventListener('click', () => {
  chrome.storage.sync.get(['enabled'], (result) => {
    const currentState = result.enabled !== false;
    const newState = !currentState;
    
    chrome.storage.sync.set({ enabled: newState }, () => {
      updateUI(newState);
      console.log('YouTube Ad Skipper: State changed to', newState);
    });
  });
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.enabled) {
    updateUI(changes.enabled.newValue);
  }
});
