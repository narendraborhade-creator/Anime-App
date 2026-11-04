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

// Security: Validate positive integer IDs to prevent path traversal & SSRF injection into upstream API URLs
const isValidId = (id) => typeof id === 'string' && /^\d+$/.test(id) && Number(id) > 0;

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
    // Security: Do not leak internal error message / stack trace to client
    res.status(500).json({
      error: 'Failed to fetch trending anime'
    });
  }
});

// GET /search?q= - Search anime
app.get('/search', async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!query) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }
  // Security: Enforce query length limit to mitigate Denial of Service (DoS) risks
  if (query.length > 100) {
    return res.status(400).json({ error: 'Query parameter q must not exceed 100 characters' });
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
    // Security: Do not leak internal error message to client
    res.status(500).json({
      error: 'Failed to search anime'
    });
  }
});

// GET /episodes?id= - Fetch episodes for an anime
app.get('/episodes', async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ error: 'Query parameter id is required' });
  }
  if (!isValidId(String(id))) {
    return res.status(400).json({ error: 'Query parameter id must be a valid positive integer' });
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
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Anime ID must be a valid positive integer' });
  }

  try {
    const response = await axios.get(`${JIKAN_BASE}/anime/${id}`, {
      timeout: 10000
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching anime details:', error.message);
    // Security: Do not leak internal error message to client
    res.status(500).json({
      error: 'Failed to fetch anime details'
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
