import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const controlHeight = 36;
const controlRadius = 10;

export default function Navbar({ onSearch, dark, onToggleDark }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [hoveredNav, setHoveredNav] = useState("");
  const [hoveredAction, setHoveredAction] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    if (location.pathname !== "/") navigate("/");
    onSearch?.(e.target.value);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position:"sticky", top:0, zIndex:100,
      display:"grid",
      gridTemplateColumns:"auto minmax(0, 1fr) auto",
      alignItems:"center",
      columnGap:14,
      padding:"0 1.25rem 0 1.5rem",
      minHeight:64,
      boxSizing:"border-box",
      background: dark ? "rgba(13,13,13,0.96)" : "rgba(255,255,255,0.96)",
      borderBottom: dark ? "1px solid rgba(255,255,255,.08)" : "1px solid #E8E2D9",
      backdropFilter:"blur(12px)",
      boxShadow: scrolled ? (dark ? "0 4px 24px rgba(0,0,0,.4)" : "0 4px 24px rgba(0,0,0,.08)") : "none",
      transition:"box-shadow .3s, background .3s, border-color .3s",
    }}>
      {/* Logo + links */}
      <div style={{ display:"flex", alignItems:"center", gap:"clamp(10px, 1.8vw, 1.75rem)", minWidth:0 }}>
        <Link to="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none", flexShrink:0 }}>
          <div style={{ width:9, height:9, borderRadius:"50%", background:"#C9A84C" }}/>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color: dark ? "#fff" : "#0D0D0D", whiteSpace:"nowrap", transition:"color .3s" }}>
            CineVault
          </span>
        </Link>
        <ul style={{
          display:"flex",
          gap:"clamp(8px, 1.2vw, 1.5rem)",
          listStyle:"none",
          margin:0,
          padding:0,
          flexShrink:0,
        }}>
          {[["Browse","/"],["New Releases","/#new-releases"],["Categories","/#categories"],["My Rentals", user?"/dashboard":"/login"]].map(([label,path])=>(
            <li key={label} style={{ flexShrink:0 }}>
              {(() => {
                const active = isActive(path) && label === "Browse";
                const hovered = hoveredNav === label;
                return (
              <Link to={path} style={{
                fontSize:13.5,
                color: active || hovered
                  ? (dark ? "#fff" : "#0D0D0D")
                  : (dark ? "rgba(255,255,255,.6)" : "#5A5A5A"),
                textDecoration:"none",
                fontWeight: active ? 500 : 400,
                borderBottom: active || hovered ? "2px solid #C9A84C" : "2px solid transparent",
                paddingBottom:2,
                whiteSpace:"nowrap",
                transform: hovered ? "translateY(-1px)" : "translateY(0)",
                transition:"color .25s, border-color .25s, transform .2s",
              }}
              onMouseEnter={() => setHoveredNav(label)}
              onMouseLeave={() => setHoveredNav("")}
              >{label}</Link>
                );
              })()}
            </li>
          ))}
        </ul>
      </div>

      {/* Search bar — flex priority over account buttons */}
      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minWidth:0, padding:"0 4px" }}>
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background: dark ? "rgba(255,255,255,.07)" : "#FAF7F2",
          border: dark ? "1px solid rgba(255,255,255,.12)" : "1px solid #E8E2D9",
          borderRadius:24,
          padding:"0 14px",
          height: controlHeight,
          width:"100%",
          maxWidth:300,
          boxSizing:"border-box",
          transition:"background .3s, border-color .3s",
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0 }}>
            <circle cx="6" cy="6" r="4.5" stroke="#9A9A9A" strokeWidth="1.5"/>
            <path d="M9.5 9.5L12.5 12.5" stroke="#9A9A9A" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search films, actors…"
            value={query}
            onChange={handleSearch}
            style={{
              border:"none",
              background:"transparent",
              fontSize:13,
              color: dark ? "rgba(255,255,255,.85)" : "#0D0D0D",
              outline:"none",
              width:"100%",
              minWidth:0,
              transition:"color .3s",
            }}
          />
        </div>
      </div>

      {/* Wallet + account — flex-shrink: 0 to prevent squishing */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:8, flexShrink:0, minWidth:"fit-content" }}>
        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={onToggleDark}
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            height: controlHeight,
            width: controlHeight,
            display:"inline-flex",
            alignItems:"center",
            justifyContent:"center",
            background: dark ? "rgba(255,255,255,.08)" : "#FAF7F2",
            border: dark ? "1px solid rgba(255,255,255,.14)" : "1px solid #E8E2D9",
            borderRadius: controlRadius,
            cursor:"pointer",
            flexShrink:0,
            transition:"background .3s, border-color .3s, transform .2s",
            boxSizing:"border-box",
          }}
          onMouseEnter={e => e.currentTarget.style.transform="scale(1.08)"}
          onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
        >
          {dark ? (
            /* Sun icon */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F0D080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            /* Moon icon */
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5A5A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
        {user ? (
          <>
            <span
              title="Wallet Balance"
              style={{
                height: controlHeight,
                display:"inline-flex",
                alignItems:"center",
                padding:"0 12px",
                fontSize:12.5,
                fontWeight:600,
                color:"#0D0D0D",
                background:"#FAF7F2",
                border:"1px solid #E8E2D9",
                borderRadius: controlRadius,
                whiteSpace:"nowrap",
                boxSizing:"border-box",
              }}
            >
              £{Number(user.balance ?? 0).toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              title="Dashboard"
              style={{
                height: controlHeight,
                minWidth: controlHeight,
                padding:"0 12px",
                background:"#C9A84C",
                color:"#0D0D0D",
                border:"1px solid rgba(0,0,0,.06)",
                borderRadius: controlRadius,
                fontSize:13,
                fontWeight:600,
                cursor:"pointer",
                boxSizing:"border-box",
                display:"inline-flex",
                alignItems:"center",
                justifyContent:"center",
                transform: hoveredAction === "dashboard" ? "translateY(-1px)" : "translateY(0)",
                boxShadow: hoveredAction === "dashboard" ? "0 8px 20px rgba(201,168,76,.28)" : "none",
                transition:"transform .2s, box-shadow .2s, filter .2s",
                filter: hoveredAction === "dashboard" ? "brightness(1.04)" : "none",
              }}
              onMouseEnter={() => setHoveredAction("dashboard")}
              onMouseLeave={() => setHoveredAction("")}
            >
              {user.initials}
            </button>
            <button
              type="button"
              onClick={() => { logout(); navigate("/"); }}
              style={{
                height: controlHeight,
                padding:"0 14px",
                background:"#fff",
                color:"#5A5A5A",
                border:"1px solid #E8E2D9",
                borderRadius: controlRadius,
                fontSize:12.5,
                fontWeight:500,
                cursor:"pointer",
                whiteSpace:"nowrap",
                boxSizing:"border-box",
                display:"inline-flex",
                alignItems:"center",
                justifyContent:"center",
                background: hoveredAction === "signout" ? (dark ? "rgba(255,255,255,.08)" : "#f5efe6") : (dark ? "rgba(255,255,255,.04)" : "#fff"),
                borderColor: hoveredAction === "signout" ? "#C9A84C" : (dark ? "rgba(255,255,255,.18)" : "#E8E2D9"),
                color: hoveredAction === "signout" ? (dark ? "#fff" : "#2F2F2F") : (dark ? "rgba(255,255,255,.75)" : "#5A5A5A"),
                transform: hoveredAction === "signout" ? "translateY(-1px)" : "translateY(0)",
                transition:"all .2s",
              }}
              onMouseEnter={() => setHoveredAction("signout")}
              onMouseLeave={() => setHoveredAction("")}
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              height: controlHeight,
              padding:"0 18px",
              background:"#0D0D0D",
              color:"#fff",
              border:"none",
              borderRadius: controlRadius,
              fontSize:13,
              fontWeight:500,
              cursor:"pointer",
              whiteSpace:"nowrap",
              transform: hoveredAction === "signin" ? "translateY(-1px)" : "translateY(0)",
              boxShadow: hoveredAction === "signin" ? "0 10px 20px rgba(0,0,0,.2)" : "none",
              filter: hoveredAction === "signin" ? "brightness(1.07)" : "none",
              transition:"transform .2s, box-shadow .2s, filter .2s",
            }}
            onMouseEnter={() => setHoveredAction("signin")}
            onMouseLeave={() => setHoveredAction("")}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
