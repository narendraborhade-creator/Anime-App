const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

const JIKAN_BASE = 'https://api.jikan.moe/v4';

// Helper function to add delay to avoid rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// GET /trending - Fetch trending/top anime
app.get('/trending', async (req, res) => {
  try {
    const response = await axios.get(`${JIKAN_BASE}/top/anime`, {
      params: {
        limit: 20,
        filter: 'airing'
      },
      timeout: 10000
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching trending anime:', error.message);
    // Return fallback data if API fails
    res.status(500).json({
      error: 'Failed to fetch trending anime',
      message: error.message
    });
  }
});

// GET /search?q= - Search anime
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  try {
    const response = await axios.get(`${JIKAN_BASE}/anime`, {
      params: {
        q: query,
        limit: 20,
        sfw: true
      },
      timeout: 10000
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error searching anime:', error.message);
    res.status(500).json({
      error: 'Failed to search anime',
      message: error.message
    });
  }
});

// Security helper: Validate ID to prevent path traversal/SSRF into upstream API URL
const isValidId = (id) => typeof id === 'string' && /^\d+$/.test(id.trim());

// GET /episodes?id= - Fetch episodes for an anime
app.get('/episodes', async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ error: 'Query parameter id is required' });
  }

  // Security: Reject non-numeric input before interpolating into upstream URL
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid anime ID. ID must be a positive integer.' });
  }

  try {
    const response = await axios.get(`${JIKAN_BASE}/anime/${encodeURIComponent(id.trim())}/episodes`, {
      timeout: 10000
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching episodes:', error.message);
    // Return mock episodes if API fails or no episodes available
    const mockEpisodes = {
      data: Array.from({ length: 12 }, (_, i) => ({
        mal_id: i + 1,
        title: `Episode ${i + 1}`,
        title_romanji: `Episode ${i + 1}`,
        aired: null,
        score: null,
        filler: false,
        recap: false
      }))
    };
    res.json(mockEpisodes);
  }
});

// GET /anime/:id - Fetch anime details
app.get('/anime/:id', async (req, res) => {
  const id = req.params.id;

  // Security: Prevent path manipulation when requesting upstream third-party API
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid anime ID. ID must be a positive integer.' });
  }

  try {
    const response = await axios.get(`${JIKAN_BASE}/anime/${encodeURIComponent(id.trim())}`, {
      timeout: 10000
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching anime details:', error.message);
    res.status(500).json({
      error: 'Failed to fetch anime details',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Anime Stream Backend is running' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Anime Stream Backend running on http://localhost:${PORT}`);
    console.log(`📡 Endpoints available:`);
    console.log(`   GET /trending`);
    console.log(`   GET /search?q=<query>`);
    console.log(`   GET /episodes?id=<anime_id>`);
    console.log(`   GET /health`);
  });
}

module.exports = app;
