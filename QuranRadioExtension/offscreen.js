const audio = document.getElementById('audioPlayer');

chrome.runtime.onMessage.addListener((message) => {
  if (message.target !== 'offscreen') return;

  switch (message.action) {
    case 'play':
      if (audio.src !== message.url) {
        audio.src = message.url;
      }
      audio.volume = message.volume !== undefined ? message.volume : 0.8;
      audio.play().catch(e => console.error("Offscreen audio play failed:", e));
      break;
    case 'pause':
      audio.pause();
      break;
    case 'setVolume':
      audio.volume = message.volume;
      break;
  }
});
