let radios = [];
let currentStation = null;
let isPlaying = false;
let activeTab = 'reciters';

const topReciters = [
  { id: 32, name: "🌟 عبدالباسط عبدالصمد (المرتل)", url: "https://backup.qurango.net/radio/abdulbasit_abdulsamad" },
  { id: 74, name: "🌟 محمود خليل الحصري (المرتل)", url: "https://backup.qurango.net/radio/mahmoud_khalil_alhussary" },
  { id: 69, name: "🌟 محمد صديق المنشاوي (المرتل)", url: "https://backup.qurango.net/radio/mohammed_siddiq_alminshawi" },
  { id: 77, name: "🌟 محمود علي البنا (المرتل)", url: "https://backup.qurango.net/radio/mahmoud_ali__albanna" },
  { id: 80, name: "🌟 مصطفى إسماعيل (المرتل)", url: "https://backup.qurango.net/radio/mustafa_ismail" }
];

document.addEventListener('DOMContentLoaded', async () => {
  // Restore state from background/storage
  chrome.runtime.sendMessage({ action: "getState" }, (state) => {
    if (state) {
      isPlaying = state.isPlaying;
      currentStation = state.currentStation;
      document.getElementById('volumeSlider').value = state.volume;
      updateUI();
    }
  });

  // Fetch radios
  try {
    const res = await fetch('https://mp3quran.net/api/v3/radios?language=ar');
    const data = await res.json();
    
    if (data.radios) {
      const nonReciters = data.radios.filter(r => {
        const n = r.name;
        return n.includes('ترجمة') || n.includes('تفسير') || n.includes('فتاوى') || n.includes('حديث') || n.includes('أذكار');
      });
      radios = [...topReciters, ...nonReciters];
      
      if (!currentStation) {
        currentStation = radios[0];
        updateUI();
      }
      renderList();
    }
  } catch (error) {
    document.getElementById('radiosList').innerHTML = '<div class="loading">خطأ في جلب البيانات</div>';
  }

  // Listeners
  document.getElementById('playBtn').addEventListener('click', () => {
    if (!currentStation) return;
    
    if (isPlaying) {
      chrome.runtime.sendMessage({ action: "pause" });
      isPlaying = false;
    } else {
      chrome.runtime.sendMessage({ action: "play", station: currentStation });
      isPlaying = true;
    }
    updateUI();
  });

  document.getElementById('volumeSlider').addEventListener('input', (e) => {
    chrome.runtime.sendMessage({ action: "setVolume", volume: e.target.value });
  });

  document.getElementById('searchInput').addEventListener('input', renderList);

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeTab = e.target.getAttribute('data-tab');
      renderList();
    });
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "stateUpdate") {
    isPlaying = message.isPlaying;
    updateUI();
  }
});

function updateUI() {
  const playBtn = document.getElementById('playBtn');
  const visualizer = document.getElementById('visualizer');
  const stationName = document.getElementById('currentStationName');

  playBtn.innerText = isPlaying ? '⏸' : '▶';
  if (isPlaying) {
    visualizer.classList.add('playing');
  } else {
    visualizer.classList.remove('playing');
  }

  if (currentStation) {
    stationName.innerText = currentStation.name;
  }
  
  // Update active item in list
  document.querySelectorAll('.radio-item').forEach(item => {
    item.classList.remove('active');
    if (currentStation && item.getAttribute('data-id') == currentStation.id) {
      item.classList.add('active');
    }
  });
}

function renderList() {
  const listEl = document.getElementById('radiosList');
  const query = document.getElementById('searchInput').value.toLowerCase();
  
  let filtered = radios;
  
  // Search
  if (query) {
    filtered = filtered.filter(r => r.name.toLowerCase().includes(query));
  } else {
    // Tabs
    if (activeTab === 'tafseer') {
      filtered = filtered.filter(r => r.name.includes('تفسير'));
    } else if (activeTab === 'hadith') {
      filtered = filtered.filter(r => r.name.includes('فتاوى') || r.name.includes('حديث'));
    } else if (activeTab === 'adhkar') {
      filtered = filtered.filter(r => r.name.includes('أذكار'));
    } else { // reciters
      filtered = filtered.filter(r => !r.name.includes('تفسير') && !r.name.includes('أذكار') && !r.name.includes('فتاوى') && !r.name.includes('حديث'));
    }
  }

  listEl.innerHTML = '';
  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="loading">لا توجد نتائج</div>';
    return;
  }

  filtered.forEach(radio => {
    const div = document.createElement('div');
    div.className = `radio-item ${currentStation && currentStation.id === radio.id ? 'active' : ''}`;
    div.setAttribute('data-id', radio.id);
    div.innerHTML = `
      <span class="radio-name">${radio.name}</span>
    `;
    div.addEventListener('click', () => {
      currentStation = radio;
      isPlaying = true;
      chrome.runtime.sendMessage({ action: "play", station: currentStation });
      updateUI();
    });
    listEl.appendChild(div);
  });
}
