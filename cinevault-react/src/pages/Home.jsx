import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FilmCard from "../components/FilmCard";
import { FILMS, CATEGORIES } from "../data/films";
import { apiGetFilms } from "../services/api";

const FILMS_PER_PAGE = 20;
const NEW_RELEASES_COUNT = 12;
const SCROLL_ANCHOR_OFFSET = 80;

const filmYear = (f) => {
  if (f?.releaseDate) { const y = new Date(f.releaseDate).getFullYear(); if (!Number.isNaN(y)) return y; }
  return typeof f?.year === "number" ? f.year : 0;
};

const normalize = (f) => ({
  ...f,
  id:         f._id || f.id,
  title:      f.filmTitle || f.title,
  category:   f.filmCategoryId?.categoryName || f.category,
  copies:     f.availableCopies ?? f.copies,
  poster:     f.poster,
  hoverImage: f.hoverImage || null,
  rating:     f.rating,
  price:      f.price,
  duration:   f.filmDuration || f.duration,
  year:       f.releaseDate ? new Date(f.releaseDate).getFullYear() : f.year,
});

export default function Home({ searchQuery, showToast }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [films, setFilms]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [backendUp, setBackendUp] = useState(true);
  const navigate  = useNavigate();
  const location  = useLocation();
  const newReleasesMode = location.hash === "#new-releases";

  // ── Fetch current page from backend ─────────────────────────
  const fetchFilms = useCallback(async (pg, cat, search) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: FILMS_PER_PAGE };
      if (search) params.title = search;
      // category filtering — backend accepts categoryId; we'll filter client-side from results
      const data = await apiGetFilms(params);
      let films = Array.isArray(data?.films) ? data.films : [];

      // Client-side category filter (because backend needs ObjectId, not name)
      if (cat && cat !== "All") {
        films = films.filter(f =>
          (f.filmCategoryId?.categoryName || f.category) === cat
        );
      }

      setFilms(films);
      setTotal(Number(data?.total ?? films.length));
      setBackendUp(true);
    } catch {
      // Fallback to static data
      let fallback = FILMS;
      if (search) fallback = fallback.filter(f => (f.filmTitle || f.title || "").toLowerCase().includes(search.toLowerCase()));
      if (cat && cat !== "All") fallback = fallback.filter(f => f.category === cat);
      const start = (pg - 1) * FILMS_PER_PAGE;
      setFilms(fallback.slice(start, start + FILMS_PER_PAGE));
      setTotal(fallback.length);
      setBackendUp(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchFilms(page, activeCategory, searchQuery);
  }, [page, activeCategory, searchQuery, fetchFilms]);

  // Hash scroll
  useEffect(() => {
    if (location.pathname !== "/") return;
    const id = location.hash.replace(/^#/, "");
    if (!["new-releases", "categories"].includes(id)) return;
    const scrollToAnchor = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    scrollToAnchor();
    const t = window.setTimeout(scrollToAnchor, 120);
    return () => window.clearTimeout(t);
  }, [location.pathname, location.hash, loading]);

  // New-releases mode: sort & cap static films
  const displayFilms = newReleasesMode
    ? [...films].sort((a, b) => filmYear(b) - filmYear(a)).slice(0, NEW_RELEASES_COUNT)
    : films;

  // Pagination math — when backend filters by title but not by category client-side
  // total from backend is the unfiltered count; adjust for category
  const totalPages = Math.max(1, Math.ceil(total / FILMS_PER_PAGE));

  const changePage = (p) => {
    setPage(p);
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setPage(1);
  };

  // ── Build page number array (1 … current-1 current current+1 … last) ──
  const buildPageNums = () => {
    const nums = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
        nums.push(i);
      } else if (nums[nums.length - 1] !== "…") {
        nums.push("…");
      }
    }
    return nums;
  };

  return (
    <div style={{ animation: "fadeIn .35s ease" }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        background: "#0D0D0D", padding: "5rem 2.5rem 4rem",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 50%, rgba(201,168,76,.08) 0%, transparent 60%)", pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(201,168,76,.12)", border: "1px solid rgba(201,168,76,.3)",
            color: "#F0D080", fontSize: 10.5, letterSpacing: 2.5, textTransform: "uppercase",
            padding: "6px 14px", borderRadius: 4, marginBottom: "1.4rem",
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#C9A84C" }} />
            Now Available to Rent
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, color: "#fff", lineHeight: 1.15, fontWeight: 700, marginBottom: "1.2rem" }}>
            Thousands of films,<br /><em style={{ color: "#F0D080", fontStyle: "normal" }}>one collection.</em>
          </h1>
          <p style={{ fontSize: 14.5, color: "rgba(255,255,255,.5)", lineHeight: 1.8, marginBottom: "2rem", maxWidth: 420 }}>
            Explore our curated catalog of DVDs — from timeless classics to the latest blockbusters. Rent today, return at your pace.
          </p>
          <div style={{ display: "flex", gap: 12, marginBottom: "2.5rem" }}>
            <button onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}
              style={{ background: "#C9A84C", color: "#0D0D0D", border: "none", borderRadius: 7, padding: "11px 24px", fontSize: 13.5, fontWeight: 500, cursor: "pointer" }}>
              Browse Catalog
            </button>
            <button onClick={() => showToast("Rent → Enjoy → Return within 7 days!", "info")}
              style={{ background: "transparent", color: "rgba(255,255,255,.65)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 7, padding: "11px 24px", fontSize: 13.5, cursor: "pointer" }}>
              How it works
            </button>
          </div>
          <div style={{ display: "flex", gap: "2.5rem" }}>
            {[["100+", "Films"], ["500+", "Copies"], ["98%", "Availability"]].map(([n, l]) => (
              <div key={l}>
                <span style={{ display: "block", fontSize: 24, color: "#fff", fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>{n}</span>
                <small style={{ fontSize: 11, color: "rgba(255,255,255,.38)", textTransform: "uppercase", letterSpacing: 1.5 }}>{l}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Mini poster grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, transform: "perspective(700px) rotateY(-10deg) rotateX(3deg)" }}>
          {FILMS.slice(0, 6).map(f => (
            <div key={f.id} onClick={() => navigate(`/film/${f.id}`)}
              style={{ borderRadius: 7, overflow: "hidden", aspectRatio: "2/3", position: "relative", cursor: "pointer", background: "#1a1a2e", transition: "transform .3s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <img src={f.poster} alt={f.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
              <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,.6)", color: "rgba(255,255,255,.85)", fontSize: 9, padding: "3px 8px", borderRadius: 3, backdropFilter: "blur(4px)" }}>{f.category}</div>
              <div style={{ position: "absolute", top: 8, right: 8, color: "#F0D080", fontSize: 9 }}>★ {f.rating}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATALOG ──────────────────────────────────────────── */}
      <section id="catalog" style={{ padding: "3rem 2.5rem" }}>

        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.4rem", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 id="new-releases" style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: "#0D0D0D", fontWeight: 700, margin: 0, scrollMarginTop: SCROLL_ANCHOR_OFFSET }}>
              {newReleasesMode ? "New Releases" : "Featured Films"}
            </h2>
            {newReleasesMode && (
              <p style={{ fontSize: 12.5, color: "#9A9A9A", margin: "6px 0 0" }}>
                Showing the {NEW_RELEASES_COUNT} most recent titles.
              </p>
            )}
          </div>
          {/* Result count */}
          <span style={{ fontSize: 12.5, color: "#C9A84C", fontWeight: 500 }}>
            {loading ? "Loading…" : `${total} film${total !== 1 ? "s" : ""} · Page ${page} of ${totalPages}`}
          </span>
        </div>

        {/* Category pills */}
        <div id="categories" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.8rem", scrollMarginTop: SCROLL_ANCHOR_OFFSET }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => handleCategoryClick(cat)}
              style={{
                padding: "6px 18px", borderRadius: 24, fontSize: 12.5, fontWeight: 500, cursor: "pointer",
                border: activeCategory === cat ? "none" : "1px solid #E8E2D9",
                background: activeCategory === cat ? "#0D0D0D" : "#fff",
                color: activeCategory === cat ? "#fff" : "#5A5A5A",
                transition: "all .2s",
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Film grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #E8E2D9", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#9A9A9A", fontSize: 13 }}>Loading films…</p>
          </div>
        ) : displayFilms.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: "#0D0D0D", marginBottom: 8 }}>No films found</h3>
            <p style={{ color: "#9A9A9A" }}>Try a different search or category.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
            {displayFilms.map(f => (
              <FilmCard key={f._id || f.id} film={normalize(f)} showToast={showToast} catalogOnline={backendUp} />
            ))}
          </div>
        )}

        {/* ── PAGINATION ─────────────────────────────────────── */}
        {!newReleasesMode && !loading && totalPages > 1 && (
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            gap: 6, marginTop: "3rem", flexWrap: "wrap",
          }}>
            {/* Prev */}
            <button
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              style={paginationBtn(false, page === 1)}
            >
              ← Prev
            </button>

            {/* Page numbers */}
            {buildPageNums().map((num, i) =>
              num === "…" ? (
                <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: "#9A9A9A", fontSize: 14, alignSelf: "center" }}>…</span>
              ) : (
                <button
                  key={num}
                  onClick={() => changePage(num)}
                  style={paginationBtn(num === page, false)}
                >
                  {num}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages}
              style={paginationBtn(false, page === totalPages)}
            >
              Next →
            </button>
          </div>
        )}

        {/* Page info below pagination */}
        {!newReleasesMode && !loading && totalPages > 1 && (
          <p style={{ textAlign: "center", color: "#AAAAAA", fontSize: 12, marginTop: 12 }}>
            Showing {((page - 1) * FILMS_PER_PAGE) + 1}–{Math.min(page * FILMS_PER_PAGE, total)} of {total} films
          </p>
        )}

      </section>
    </div>
  );
}

// ── Style helper ──────────────────────────────────────────────
function paginationBtn(active, disabled) {
  return {
    minWidth: 38, height: 38,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    borderRadius: 8,
    border: active ? "none" : "1px solid #E0D8CE",
    background: active ? "#0D0D0D" : disabled ? "#F5F3F0" : "#fff",
    color: active ? "#fff" : disabled ? "#C0B8B0" : "#3A3A3A",
    fontSize: 13.5, fontWeight: active ? 600 : 400,
    cursor: disabled ? "not-allowed" : "pointer",
    padding: "0 12px",
    transition: "all .18s",
    opacity: disabled ? 0.5 : 1,
    boxShadow: active ? "0 2px 8px rgba(0,0,0,.18)" : "none",
  };
}
