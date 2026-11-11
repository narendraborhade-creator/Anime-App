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

// Security helpers: Validate positive numeric IDs to prevent path traversal/SSRF, and bound queries
const isValidId = (id) => typeof id === 'string' && /^\d+$/.test(id);
const MAX_SEARCH_LENGTH = 100;

// GET /search?q= - Search anime
app.get('/search', async (req, res) => {
  const query = req.query.q;
  // Validate input type and length to mitigate DoS and malformed requests
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }
  if (query.length > MAX_SEARCH_LENGTH) {
    return res.status(400).json({ error: 'Query parameter q is too long (max 100 characters)' });
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

// GET /episodes?id= - Fetch episodes for an anime
app.get('/episodes', async (req, res) => {
  const id = req.query.id;
  // Security: Prevent path traversal and SSRF by ensuring id is strictly a positive integer
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Valid numeric id parameter is required' });
  }

  try {
    const response = await axios.get(`${JIKAN_BASE}/anime/${id}/episodes`, {
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
  // Security: Prevent path traversal and SSRF by ensuring id is strictly a positive integer
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Valid numeric id parameter is required' });
  }

  try {
    const response = await axios.get(`${JIKAN_BASE}/anime/${id}`, {
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
