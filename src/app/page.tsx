"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";

const API_BASE = "http://localhost:5000";
const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

interface Anime {
  mal_id: number;
  title: string;
  images: { jpg: { image_url: string; large_image_url: string } };
  score: number | null;
  type: string;
}

interface Episode {
  mal_id: number;
  title: string;
  title_romanji: string;
}

const S: Record<string, CSSProperties> = {
  body: { background: "#0b0b0b", color: "#fff", fontFamily: "system-ui, sans-serif", minHeight: "100vh" },
  header: { position: "sticky", top: 0, zIndex: 100, background: "rgba(11,11,11,0.97)", borderBottom: "1px solid #222", padding: "0 2rem", height: 64, display: "flex", alignItems: "center" },
  headerContent: { display: "flex", alignItems: "center", gap: "1.5rem", width: "100%", maxWidth: 1400, margin: "0 auto" },
  logo: { display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 },
  logoIcon: { color: "#ff6b00", fontSize: "1.5rem" },
  logoText: { fontSize: "1.2rem", fontWeight: 800, letterSpacing: 2, color: "#fff" },
  searchForm: { display: "flex", flex: 1, maxWidth: 480, background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, overflow: "hidden" },
  searchInput: { flex: 1, background: "transparent", border: "none", outline: "none", padding: "0.6rem 1rem", color: "#fff", fontSize: "0.9rem" },
  searchBtn: { background: "#ff6b00", border: "none", padding: "0.6rem 1rem", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" },
  nav: { display: "flex", gap: "1.5rem", marginLeft: "auto" },
  navLink: { color: "#aaa", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 },
  hero: { background: "linear-gradient(135deg, #0b0b0b 0%, #1a0a00 50%, #0b0b0b 100%)", padding: "2.5rem 2rem", textAlign: "center", borderBottom: "1px solid #222" },
  heroTitle: { fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.5rem", background: "linear-gradient(135deg, #fff 0%, #ff6b00 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { color: "#aaa", fontSize: "1rem" },
  section: { padding: "2rem", maxWidth: 1400, margin: "0 auto" },
  filterBar: { display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" as const },
  filterBtnActive: { background: "#ff6b00", border: "1px solid #ff6b00", color: "#fff", padding: "0.4rem 1rem", borderRadius: 20, cursor: "pointer", fontSize: "0.85rem" },
  filterBtnInactive: { background: "#1a1a1a", border: "1px solid #333", color: "#aaa", padding: "0.4rem 1rem", borderRadius: 20, cursor: "pointer", fontSize: "0.85rem" },
  sectionTitle: { fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.25rem" },
  card: { background: "#1a1a1a", borderRadius: 10, overflow: "hidden", cursor: "pointer", border: "1px solid #2a2a2a", transition: "transform 0.2s, box-shadow 0.2s" },
  poster: { width: "100%", aspectRatio: "2/3", objectFit: "cover" as const, display: "block", background: "#141414" },
  posterPlaceholder: { width: "100%", aspectRatio: "2/3", background: "#141414", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" },
  cardInfo: { padding: "0.75rem" },
  cardTitle: { fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const },
  cardMeta: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  score: { color: "#ffd700", fontSize: "0.8rem", fontWeight: 600 },
  type: { fontSize: "0.75rem", color: "#666", background: "#111", padding: "0.15rem 0.5rem", borderRadius: 4 },
  playerSection: { padding: "2rem", maxWidth: 1400, margin: "0 auto", display: "flex", gap: "1.5rem" },
  playerWrapper: { flex: 1, minWidth: 0 },
  playerTitle: { fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" },
  videoContainer: { background: "#000", borderRadius: 10, overflow: "hidden", aspectRatio: "16/9", position: "relative" as const },
  video: { width: "100%", height: "100%", display: "block" },
  videoPlaceholder: { width: "100%", height: "100%", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: "1rem", color: "#555" },
  episodePanel: { width: 300, flexShrink: 0, background: "#1a1a1a", borderRadius: 10, border: "1px solid #2a2a2a", overflow: "hidden", display: "flex", flexDirection: "column" as const, maxHeight: 550 },
  episodePanelHeader: { padding: "1rem", borderBottom: "1px solid #2a2a2a", fontWeight: 700, fontSize: "0.9rem", background: "#141414", flexShrink: 0 },
  episodeList: { overflowY: "auto" as const, flex: 1 },
  episodeItem: { padding: "0.75rem 1rem", cursor: "pointer", borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: "0.75rem" },
  episodeItemActive: { padding: "0.75rem 1rem", cursor: "pointer", borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(255,107,0,0.15)", borderLeft: "3px solid #ff6b00" },
  epNum: { background: "#ff6b00", color: "#fff", fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: 4, flexShrink: 0, minWidth: 36, textAlign: "center" as const },
  epTitle: { fontSize: "0.82rem", color: "#aaa", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const },
  skeletonCard: { background: "#1a1a1a", borderRadius: 10, overflow: "hidden", border: "1px solid #2a2a2a" },
  skeletonPoster: { width: "100%", aspectRatio: "2/3", background: "linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" },
  skeletonLine: { height: 14, background: "#222", borderRadius: 4, marginBottom: 8 },
  toast: { position: "fixed" as const, bottom: "2rem", right: "2rem", background: "#1a1a1a", border: "1px solid #333", borderLeft: "4px solid #ff6b00", padding: "0.75rem 1.25rem", borderRadius: 8, fontSize: "0.875rem", color: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.5)", zIndex: 1000, maxWidth: 300 },
};

export default function Home() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [selectedEp, setSelectedEp] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionTitle, setSectionTitle] = useState("🔥 Trending Anime");
  const [showPlayer, setShowPlayer] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("trending");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { fetchTrending(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/trending`);
      const data = await res.json();
      setAnimeList(data.data || []);
      setSectionTitle("🔥 Trending Anime");
      setActiveFilter("trending");
    } catch {
      showToast("⚠️ Backend not available - retrying...");
      setTimeout(async () => {
        try {
          const res = await fetch(`${API_BASE}/trending`);
          const data = await res.json();
          setAnimeList(data.data || []);
        } catch { showToast("❌ Could not connect to backend"); }
      }, 2000);
    } finally { setLoading(false); }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) { fetchTrending(); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setAnimeList(data.data || []);
      setSectionTitle(`🔍 Results for "${searchQuery}"`);
      setActiveFilter("");
    } catch { showToast("Search failed"); }
    finally { setLoading(false); }
  };

  const handleAnimeClick = async (anime: Anime) => {
    setSelectedAnime(anime);
    setShowPlayer(true);
    setEpisodes([]);
    setSelectedEp(null);
    showToast(`Loading episodes for ${anime.title}...`);
    setTimeout(() => document.getElementById("player")?.scrollIntoView({ behavior: "smooth" }), 100);
    try {
      const res = await fetch(`${API_BASE}/episodes?id=${anime.mal_id}`);
      const data = await res.json();
      const eps = data.data || [];
      if (eps.length === 0) {
        setEpisodes(Array.from({ length: 12 }, (_, i) => ({ mal_id: i + 1, title: `Episode ${i + 1}`, title_romanji: "" })));
      } else { setEpisodes(eps); }
      showToast(`✅ ${eps.length || 12} episodes loaded!`);
    } catch {
      setEpisodes(Array.from({ length: 12 }, (_, i) => ({ mal_id: i + 1, title: `Episode ${i + 1}`, title_romanji: "" })));
      showToast("Using demo episodes");
    }
  };

  const handleEpClick = (ep: Episode) => {
    setSelectedEp(ep);
    if (videoRef.current) {
      videoRef.current.src = SAMPLE_VIDEO;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
    showToast(`▶ Playing Episode ${ep.mal_id}`);
  };

  const filters = [
    { id: "trending", label: "🔥 Trending" },
    { id: "airing", label: "📺 Airing" },
    { id: "upcoming", label: "🗓️ Upcoming" },
    { id: "popular", label: "⭐ Popular" },
  ];

  const handleFilter = async (filterId: string) => {
    setActiveFilter(filterId);
    setLoading(true);
    try {
      let url = `${API_BASE}/trending`;
      let title = "🔥 Trending Anime";
      if (filterId === "airing") { url = `${API_BASE}/search?q=&filter=airing`; title = "📺 Currently Airing"; }
      else if (filterId === "upcoming") { url = `${API_BASE}/search?q=&filter=upcoming`; title = "🗓️ Upcoming Anime"; }
      else if (filterId === "popular") { url = `${API_BASE}/search?q=&order_by=popularity`; title = "⭐ Most Popular"; }
      const res = await fetch(url);
      const data = await res.json();
      setAnimeList(data.data || []);
      setSectionTitle(title);
    } catch { showToast("Failed to load"); }
    finally { setLoading(false); }
  };

  return (
    <div style={S.body}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0b0b0b; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #141414; }
        ::-webkit-scrollbar-thumb { background: #ff6b00; border-radius: 3px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .anime-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 12px 30px rgba(255,107,0,0.2); border-color: #ff6b00 !important; }
        .ep-item:hover { background: #222 !important; }
        .search-input::placeholder { color: #555; }
        .search-input:focus { outline: none; }
        .search-btn:hover { background: #ff8c00 !important; }
      `}</style>

      {/* Header */}
      <header style={S.header}>
        <div style={S.headerContent}>
          <div style={S.logo}>
            <span style={S.logoIcon}>▶</span>
            <span style={S.logoText}>ANIME STREAM</span>
          </div>
          <form style={S.searchForm} onSubmit={handleSearch}>
            <input
              className="search-input"
              style={S.searchInput}
              type="text"
              placeholder="Search anime..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            <button className="search-btn" style={S.searchBtn} type="submit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </form>
          <nav style={S.nav}>
            <a href="#" style={{ ...S.navLink, color: "#ff6b00" }}>Home</a>
            <a href="#" style={S.navLink}>Browse</a>
            <a href="#" style={S.navLink}>My List</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={S.hero}>
        <h1 style={S.heroTitle}>Watch Anime Online</h1>
        <p style={S.heroSub}>Stream the latest and greatest anime series</p>
      </section>

      {/* Player Section */}
      {showPlayer && selectedAnime && (
        <div id="player" style={S.playerSection}>
          <div style={S.playerWrapper}>
            <h2 style={S.playerTitle}>
              {selectedAnime.title}{selectedEp ? ` — Episode ${selectedEp.mal_id}` : ""}
            </h2>
            <div style={S.videoContainer}>
              {selectedEp ? (
                <video ref={videoRef} style={S.video} controls autoPlay src={SAMPLE_VIDEO} />
              ) : (
                <div style={S.videoPlaceholder}>
                  <div style={{ fontSize: "4rem", color: "#ff6b00", opacity: 0.5 }}>▶</div>
                  <p>Select an episode to start watching</p>
                </div>
              )}
            </div>
          </div>
          <div style={S.episodePanel}>
            <div style={S.episodePanelHeader}>📋 Episodes ({episodes.length})</div>
            <div style={S.episodeList}>
              {episodes.length === 0 ? (
                <div style={{ padding: "1rem", textAlign: "center", color: "#555" }}>Loading episodes...</div>
              ) : episodes.map(ep => (
                <div
                  key={ep.mal_id}
                  className="ep-item"
                  style={selectedEp?.mal_id === ep.mal_id ? S.episodeItemActive : S.episodeItem}
                  onClick={() => handleEpClick(ep)}
                >
                  <span style={S.epNum}>EP {ep.mal_id}</span>
                  <span style={S.epTitle}>{ep.title || ep.title_romanji || `Episode ${ep.mal_id}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Anime Grid */}
      <div style={S.section}>
        <div style={S.filterBar}>
          {filters.map(f => (
            <button
              key={f.id}
              style={activeFilter === f.id ? S.filterBtnActive : S.filterBtnInactive}
              onClick={() => handleFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <h2 style={S.sectionTitle}>{sectionTitle}</h2>
        <div style={S.grid}>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={S.skeletonCard}>
                <div style={S.skeletonPoster} />
                <div style={{ padding: "0.75rem" }}>
                  <div style={{ ...S.skeletonLine, width: "80%" }} />
                  <div style={{ ...S.skeletonLine, width: "50%" }} />
                </div>
              </div>
            ))
          ) : animeList.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "#555" }}>
              <p style={{ fontSize: "1.2rem" }}>No anime found</p>
            </div>
          ) : animeList.map(anime => (
            <div
              key={anime.mal_id}
              className="anime-card"
              style={{
                ...S.card,
                transform: hoveredCard === anime.mal_id ? "translateY(-4px) scale(1.02)" : "none",
                boxShadow: hoveredCard === anime.mal_id ? "0 12px 30px rgba(255,107,0,0.2)" : "none",
                borderColor: hoveredCard === anime.mal_id ? "#ff6b00" : "#2a2a2a",
              }}
              onClick={() => handleAnimeClick(anime)}
              onMouseEnter={() => setHoveredCard(anime.mal_id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {anime.images?.jpg?.image_url ? (
                <img
                  src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
                  alt={anime.title}
                  style={S.poster}
                  loading="lazy"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div style={S.posterPlaceholder}>🎌</div>
              )}
              <div style={S.cardInfo}>
                <div style={S.cardTitle}>{anime.title}</div>
                <div style={S.cardMeta}>
                  <span style={S.score}>⭐ {anime.score ? anime.score.toFixed(1) : "N/A"}</span>
                  <span style={S.type}>{anime.type || "TV"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}
