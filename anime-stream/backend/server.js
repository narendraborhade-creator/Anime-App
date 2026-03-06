const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;
const JIKAN_BASE = 'https://api.jikan.moe/v4';

app.use(cors());
app.use(express.json());

const FALLBACK_ANIME = [
  {
    mal_id: 1,
    title: 'Fullmetal Alchemist: Brotherhood',
    score: 9.1,
    type: 'TV',
    episodes: 64,
    status: 'Finished Airing',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1208/94745.jpg' } }
  },
  {
    mal_id: 2,
    title: 'Attack on Titan',
    score: 8.9,
    type: 'TV',
    episodes: 25,
    status: 'Finished Airing',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg' } }
  },
  {
    mal_id: 3,
    title: 'Demon Slayer',
    score: 8.5,
    type: 'TV',
    episodes: 26,
    status: 'Finished Airing',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg' } }
  },
  {
    mal_id: 4,
    title: 'Jujutsu Kaisen',
    score: 8.6,
    type: 'TV',
    episodes: 24,
    status: 'Finished Airing',
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg' } }
  }
];

const FALLBACK_EPISODES = Array.from({ length: 12 }, (_, i) => ({
  mal_id: i + 1,
  title: `Episode ${i + 1}`,
  title_romanji: `Episode ${i + 1}`,
  aired: null,
  score: null,
  filler: false,
  recap: false
}));

const jikanClient = axios.create({
  baseURL: JIKAN_BASE,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'User-Agent': 'anime-stream-app/1.0'
  }
});

app.get('/trending', async (req, res) => {
  const filter = req.query.filter || undefined;

  try {
    const response = await jikanClient.get('/top/anime', {
      params: { limit: 20, ...(filter ? { filter } : {}) }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching trending anime:', error.message);
    res.json({ data: FALLBACK_ANIME, fallback: true });
  }
});

app.get('/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) return res.status(400).json({ error: 'Query parameter q is required' });

  try {
    const response = await jikanClient.get('/anime', {
      params: { q: query, limit: 20, sfw: true }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error searching anime:', error.message);
    const filtered = FALLBACK_ANIME.filter((anime) => anime.title.toLowerCase().includes(query.toLowerCase()));
    res.json({ data: filtered, fallback: true });
  }
});

app.get('/episodes', async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'Query parameter id is required' });

  try {
    const response = await jikanClient.get(`/anime/${id}/episodes`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching episodes:', error.message);
    res.json({ data: FALLBACK_EPISODES, fallback: true });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Anime Stream Backend is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Anime Stream Backend running on http://localhost:${PORT}`);
});
