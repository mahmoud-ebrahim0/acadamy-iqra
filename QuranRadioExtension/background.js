let isPlaying = false;
let currentStation = null;
let volume = 0.8;

// Create offscreen document
async function setupOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
  });

  if (existingContexts.length > 0) {
    return;
  }

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Playing Quran Radio in the background',
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getState") {
    sendResponse({ isPlaying, currentStation, volume });
    return true;
  }

  if (message.action === "play") {
    setupOffscreenDocument().then(() => {
      currentStation = message.station;
      isPlaying = true;
      chrome.runtime.sendMessage({
        target: 'offscreen',
        action: 'play',
        url: currentStation.url,
        volume: volume
      });
      // Broadcast state to popup
      chrome.runtime.sendMessage({ action: "stateUpdate", isPlaying });
    });
  }

  if (message.action === "pause") {
    isPlaying = false;
    chrome.runtime.sendMessage({
      target: 'offscreen',
      action: 'pause'
    });
    // Broadcast state to popup
    chrome.runtime.sendMessage({ action: "stateUpdate", isPlaying });
  }

  if (message.action === "setVolume") {
    volume = parseFloat(message.volume);
    chrome.runtime.sendMessage({
      target: 'offscreen',
      action: 'setVolume',
      volume: volume
    });
  }
});
