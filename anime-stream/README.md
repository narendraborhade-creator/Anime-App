# 🎌 ANIME STREAM

A modern anime streaming web application built with Vite, Vanilla JavaScript, Node.js, and Express. Powered by the Jikan API (MyAnimeList unofficial API).

## Features

- 🔥 Browse trending anime
- 🔍 Search anime by title
- 📺 Episode list viewer
- ▶️ HTML5 video player with sample stream
- 🌙 Dark theme with orange accent
- 📱 Responsive design

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + Vanilla JS + HTML + CSS |
| Backend | Node.js + Express |
| API | Jikan API (MyAnimeList) |
| Video | HTML5 Video Player |

## Project Structure

```
anime-stream/
├── backend/
│   ├── server.js       # Express server
│   └── package.json    # Backend dependencies
├── frontend/
│   ├── index.html      # Main HTML
│   ├── style.css       # Styles
│   ├── script.js       # Frontend logic
│   └── package.json    # Frontend dependencies (Vite)
└── README.md
```

## Getting Started

### 1. Start the Backend

```bash
cd backend
npm install
node server.js
```

Backend runs on: http://localhost:5000

### 2. Start the Frontend

```bash
cd frontend
npm install
npx vite --host --port 5173
```

Frontend runs on: http://localhost:5173

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /trending` | Fetch trending/top anime |
| `GET /search?q=<query>` | Search anime by title |
| `GET /episodes?id=<id>` | Fetch episodes for an anime |
| `GET /health` | Health check |

## Usage

1. Open http://localhost:5173 in your browser
2. Browse trending anime on the homepage
3. Use the search bar to find specific anime
4. Click any anime card to view its episodes
5. Click an episode to play the sample video stream

## Notes

- Real anime streams are not available via the Jikan API
- A sample HLS stream is used for demonstration purposes
- The app falls back to an MP4 sample if HLS is not supported
