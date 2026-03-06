// ===== CONFIGURATION =====
const API_BASE = 'http://localhost:5000';
const SAMPLE_VIDEO_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
// Fallback MP4 for browsers that don't support HLS
const FALLBACK_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

// ===== STATE =====
let currentAnime = null;
let currentEpisode = null;
let currentFilter = 'airing';
let isSearchMode = false;

// ===== DOM ELEMENTS =====
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const animeGrid = document.getElementById('animeGrid');
const loadingContainer = document.getElementById('loadingContainer');
const noResults = document.getElementById('noResults');
const sectionTitle = document.getElementById('sectionTitle');
const playerSection = document.getElementById('playerSection');
const contentSection = document.getElementById('contentSection');
const heroSection = document.getElementById('heroSection');
const videoPlayer = document.getElementById('videoPlayer');
const videoSource = document.getElementById('videoSource');
const videoOverlay = document.getElementById('videoOverlay');
const episodeList = document.getElementById('episodeList');
const episodeAnimeTitle = document.getElementById('episodeAnimeTitle');
const episodeCount = document.getElementById('episodeCount');
const nowPlayingTitle = document.getElementById('nowPlayingTitle');
const backBtn = document.getElementById('backBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const toast = document.getElementById('toast');

// ===== TOAST NOTIFICATIONS =====
let toastTimeout;
function showToast(message, type = 'info') {
  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  toastTimeout = setTimeout(() => {
    toast.className = 'toast';
  }, 3500);
}

// ===== API FUNCTIONS =====
async function fetchTrending(filter = 'airing') {
  try {
    const response = await fetch(`${API_BASE}/trending?filter=${filter}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch trending:', error);
    showToast('Failed to load trending anime. Retrying...', 'error');
    return [];
  }
}

async function searchAnime(query) {
  try {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to search:', error);
    showToast('Search failed. Please try again.', 'error');
    return [];
  }
}

async function fetchEpisodes(animeId) {
  try {
    const response = await fetch(`${API_BASE}/episodes?id=${animeId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch episodes:', error);
    // Return mock episodes as fallback
    return Array.from({ length: 12 }, (_, i) => ({
      mal_id: i + 1,
      title: `Episode ${i + 1}`,
      title_romanji: null,
      aired: null,
      score: null,
      filler: false,
      recap: false
    }));
  }
}

// ===== RENDER FUNCTIONS =====
function renderAnimeCard(anime) {
  const card = document.createElement('div');
  card.className = 'anime-card';
  card.dataset.id = anime.mal_id;

  const imageUrl = anime.images?.jpg?.large_image_url ||
                   anime.images?.jpg?.image_url ||
                   `https://via.placeholder.com/300x450/1a1a1a/ff6b00?text=${encodeURIComponent(anime.title || 'Anime')}`;

  const score = anime.score ? `⭐ ${anime.score}` : 'N/A';
  const type = anime.type || 'TV';
  const episodes = anime.episodes ? `${anime.episodes} eps` : '? eps';
  const status = anime.status || '';
  const statusClass = status.toLowerCase().includes('airing') ? 'airing' : 'finished';
  const statusText = status.toLowerCase().includes('airing') ? 'Airing' :
                     status.toLowerCase().includes('finished') ? 'Finished' : '';

  card.innerHTML = `
    <div class="card-poster">
      <img
        src="${imageUrl}"
        alt="${escapeHtml(anime.title || 'Anime')}"
        loading="lazy"
        onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/ff6b00?text=No+Image'"
      />
      <div class="card-overlay">
        <div class="play-btn-overlay">▶</div>
      </div>
      <div class="card-badge">${type}</div>
      <div class="card-score">${score}</div>
    </div>
    <div class="card-info">
      <h3 class="card-title">${escapeHtml(anime.title || 'Unknown Title')}</h3>
      <div class="card-meta">
        <span class="card-type">${type}</span>
        <span class="card-episodes">${episodes}</span>
        ${statusText ? `<span class="card-status ${statusClass}">${statusText}</span>` : ''}
      </div>
    </div>
  `;

  card.addEventListener('click', () => handleAnimeClick(anime));
  return card;
}

function renderAnimeGrid(animeList) {
  animeGrid.innerHTML = '';

  if (!animeList || animeList.length === 0) {
    noResults.style.display = 'block';
    return;
  }

  noResults.style.display = 'none';
  animeList.forEach(anime => {
    animeGrid.appendChild(renderAnimeCard(anime));
  });
}

function renderEpisodes(episodes, animeTitle) {
  episodeAnimeTitle.textContent = animeTitle || 'Episodes';
  episodeCount.textContent = `${episodes.length} episode${episodes.length !== 1 ? 's' : ''}`;

  if (episodes.length === 0) {
    episodeList.innerHTML = `
      <div class="loading-episodes">
        <p>No episodes available</p>
      </div>
    `;
    return;
  }

  episodeList.innerHTML = '';
  episodes.forEach((episode, index) => {
    const item = document.createElement('div');
    item.className = 'episode-item';
    item.dataset.episodeNum = episode.mal_id || (index + 1);

    const epTitle = episode.title || episode.title_romanji || `Episode ${episode.mal_id || (index + 1)}`;

    item.innerHTML = `
      <div class="episode-number">${episode.mal_id || (index + 1)}</div>
      <div class="episode-info">
        <div class="episode-title">${escapeHtml(epTitle)}</div>
      </div>
      <span class="episode-play-icon">▶</span>
    `;

    item.addEventListener('click', () => handleEpisodeClick(episode, index, animeTitle));
    episodeList.appendChild(item);
  });
}

// ===== EVENT HANDLERS =====
async function handleAnimeClick(anime) {
  currentAnime = anime;
  showToast(`Loading ${anime.title}...`, 'info');

  // Show player section, hide hero
  heroSection.style.display = 'none';
  playerSection.style.display = 'block';
  contentSection.style.display = 'none';

  // Show loading state in episode list
  episodeList.innerHTML = `
    <div class="loading-episodes">
      <div class="spinner"></div>
      <p>Loading episodes...</p>
    </div>
  `;
  episodeAnimeTitle.textContent = anime.title || 'Loading...';
  episodeCount.textContent = '';
  nowPlayingTitle.textContent = anime.title || '-';

  // Reset video
  videoOverlay.style.display = 'flex';
  videoPlayer.pause();
  videoPlayer.src = '';

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Fetch episodes
  const episodes = await fetchEpisodes(anime.mal_id);
  renderEpisodes(episodes, anime.title);

  showToast(`${anime.title} loaded! Select an episode to watch.`, 'success');
}

function handleEpisodeClick(episode, index, animeTitle) {
  currentEpisode = episode;

  // Update active state
  document.querySelectorAll('.episode-item').forEach(item => {
    item.classList.remove('active');
  });
  const epNum = episode.mal_id || (index + 1);
  const activeItem = document.querySelector(`[data-episode-num="${epNum}"]`);
  if (activeItem) activeItem.classList.add('active');

  // Update now playing title
  const epTitle = episode.title || episode.title_romanji || `Episode ${epNum}`;
  nowPlayingTitle.textContent = `${animeTitle} - ${epTitle}`;

  // Load video
  loadVideo(epTitle);
}

function loadVideo(episodeTitle) {
  // Hide overlay
  videoOverlay.style.display = 'none';

  // Try HLS stream first, fallback to MP4
  const isHLSSupported = videoPlayer.canPlayType('application/vnd.apple.mpegurl') !== '';

  if (isHLSSupported) {
    videoPlayer.src = SAMPLE_VIDEO_URL;
  } else {
    // Use fallback MP4 for browsers without native HLS support
    videoPlayer.src = FALLBACK_VIDEO_URL;
  }

  videoPlayer.load();
  videoPlayer.play().catch(err => {
    console.log('Autoplay prevented:', err);
    showToast('Click play to start the video', 'info');
  });

  showToast(`Now playing: ${episodeTitle}`, 'success');
}

async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    showToast('Please enter a search term', 'info');
    return;
  }

  isSearchMode = true;
  sectionTitle.textContent = `🔍 Search: "${query}"`;

  // Show content section
  playerSection.style.display = 'none';
  heroSection.style.display = 'none';
  contentSection.style.display = 'block';

  // Show loading
  loadingContainer.style.display = 'flex';
  animeGrid.innerHTML = '';
  noResults.style.display = 'none';

  showToast(`Searching for "${query}"...`, 'info');

  const results = await searchAnime(query);

  loadingContainer.style.display = 'none';

  if (results.length === 0) {
    showToast('No results found', 'error');
  } else {
    showToast(`Found ${results.length} results`, 'success');
  }

  renderAnimeGrid(results);
}

async function loadTrending(filter = 'airing') {
  currentFilter = filter;
  isSearchMode = false;

  const filterLabels = {
    airing: '🔥 Trending Now',
    upcoming: '📅 Upcoming Anime',
    bypopularity: '⭐ Most Popular'
  };

  sectionTitle.textContent = filterLabels[filter] || '🔥 Trending Now';

  // Show loading
  loadingContainer.style.display = 'flex';
  animeGrid.innerHTML = '';
  noResults.style.display = 'none';

  const animeList = await fetchTrending(filter);

  loadingContainer.style.display = 'none';
  renderAnimeGrid(animeList);

  if (animeList.length > 0) {
    showToast(`Loaded ${animeList.length} anime`, 'success');
  }
}

// ===== BACK BUTTON =====
backBtn.addEventListener('click', () => {
  playerSection.style.display = 'none';
  heroSection.style.display = 'block';
  contentSection.style.display = 'block';
  videoPlayer.pause();
  videoPlayer.src = '';
  currentAnime = null;
  currentEpisode = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== SEARCH EVENTS =====
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});

// Clear search on input clear
searchInput.addEventListener('input', (e) => {
  if (e.target.value === '' && isSearchMode) {
    isSearchMode = false;
    sectionTitle.textContent = '🔥 Trending Now';
    loadTrending(currentFilter);
  }
});

// ===== FILTER BUTTONS =====
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    loadTrending(filter);
  });
});

// ===== UTILITY =====
function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ===== INITIALIZE =====
async function init() {
  console.log('🎌 Anime Stream initializing...');

  // Check backend health
  try {
    const healthCheck = await fetch(`${API_BASE}/health`);
    if (healthCheck.ok) {
      console.log('✅ Backend connected');
    }
  } catch (error) {
    console.warn('⚠️ Backend not reachable, will retry on API calls');
    showToast('Connecting to server...', 'info');
  }

  // Load trending anime
  await loadTrending('airing');

  console.log('✅ Anime Stream ready!');
}

// Start the app
init();
