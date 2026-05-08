import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FilmCard from "../components/FilmCard";

const BADGE = { active: ["#DCFCE7", "#166534"], due: ["#FEF9C3", "#854D0E"], over: ["#FEE2E2", "#991B1B"], done: ["#F1F5F9", "#475569"] };
const LABEL = { active: "Active", due: "Due Soon", over: "Overdue", done: "Returned" };

const SideItem = ({ icon, label, active, onClick }) => (
  <li onClick={onClick} style={{
    display: "flex", alignItems: "center", padding: "10px 1.6rem",
    fontSize: 13.5, fontWeight: active ? 500 : 400, cursor: "pointer", transition: "all .2s",
    color: active ? "#C9A84C" : "rgba(255,255,255,.5)",
    background: active ? "rgba(201,168,76,.08)" : "transparent",
    borderLeft: active ? "3px solid #C9A84C" : "3px solid transparent",
    listStyle: "none",
  }}>
    {label}
  </li>
);

export default function Dashboard({ showToast }) {
  const location = useLocation();
  const [section, setSection] = useState(() => {
    const hash = location.hash.replace("#", "");
    return ["dashboard", "rentals", "wishlist"].includes(hash) ? hash : "dashboard";
  });
  
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (["dashboard", "rentals", "wishlist"].includes(hash)) {
      setSection(hash);
    } else if (!hash) {
      setSection("dashboard");
    }
  }, [location.hash]);

  const { user, logout, rentals, wishlist } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(" ")[0] || "Guest";
  const activeRentals = rentals.filter(r => r.status === "active" || r.status === "due");
  const overdueRentals = rentals.filter(r => r.status === "over");
  const totalFees = rentals.reduce((s, r) => s + (r.overdue || 0), 0);
  const normalizeWishlistFilm = (f) => ({
    ...f,
    id: f?._id || f?.id,
    title: f?.filmTitle || f?.title || "Untitled Film",
    category: f?.filmCategoryId?.categoryName || f?.category || "Uncategorized",
    copies: f?.availableCopies ?? f?.copies ?? 0,
    poster: f?.poster || "",
    rating: f?.rating ?? 0,
    reviews: f?.reviews ?? 0,
    price: Number(f?.price ?? 0),
    duration: f?.filmDuration || f?.duration || 0,
    year: f?.releaseDate ? new Date(f.releaseDate).getFullYear() : (f?.year || ""),
  });

  const wishlistFilms = wishlist
    .map((entry) => entry?.film)
    .filter(Boolean)
    .map(normalizeWishlistFilm);

  const go = (s) => { 
    if (s === "browse") { navigate("/"); return; } 
    if (s === "profile") { navigate("/profile"); return; } 
    navigate(`/dashboard#${s}`); 
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 64px)" }}>
      {/* Sidebar */}
      <aside className="dashboard-sidebar" style={{ background: "#0D0D0D", borderRight: "1px solid rgba(255,255,255,.06)", position: "sticky", top: 64, height: "calc(100vh - 64px)", overflowY: "auto" }}>
        <div style={{ padding: "1.8rem 1.4rem 1.4rem", borderBottom: "1px solid rgba(255,255,255,.08)", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#C9A84C" }} />
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: "#fff", fontWeight: 700 }}>CineVault</span>
          </div>
        </div>
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,.28)", textTransform: "uppercase", letterSpacing: 2, padding: "0 1.4rem .6rem" }}>Main</div>
        <ul style={{ padding: 0, margin: 0 }}>
          {[["dashboard", "Dashboard"], ["browse", "Browse Films"], ["rentals", "My Rentals"], ["wishlist", "Wishlist"]].map(([s, l]) => (
            <SideItem key={s} label={l} active={section === s} onClick={() => go(s)} />
          ))}
        </ul>
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,.28)", textTransform: "uppercase", letterSpacing: 2, padding: "1rem 1.4rem .6rem", marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,.08)" }}>Account</div>
        <ul style={{ padding: 0, margin: 0 }}>
          <SideItem label="Profile" active={false} onClick={() => navigate("/profile")} />
          <SideItem label="Sign Out" active={false} onClick={() => { logout(); showToast("Signed out. See you next time!", "info"); navigate("/"); }} />
        </ul>
      </aside>

      {/* Main */}
      <div style={{ padding: "2rem", background: "#FAF7F2" }}>
        {section === "dashboard" && (
          <div style={{ animation: "fadeIn .3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.6rem" }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "#0D0D0D" }}>Good evening, {firstName} </h2>
                <p style={{ fontSize: 12.5, color: "#5A5A5A", marginTop: 3 }}>You have {activeRentals.length} active rental{activeRentals.length !== 1 ? "s" : ""} · {overdueRentals.length > 0 ? overdueRentals.length + " overdue" : "No overdue fees"}</p>
              </div>
              <button onClick={() => navigate("/")} style={{ background: "#0D0D0D", color: "#fff", border: "none", borderRadius: 7, padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>+ Browse Films</button>
            </div>
            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.6rem" }}>
              {[[activeRentals.length, "Active Rentals", activeRentals.length > 0 ? "1 due in 2 days" : "All clear", "#B7770D"],
              [rentals.length, "Total Rented", "All time", "#1B6B4A"],
              ["£" + totalFees.toFixed(2), "Overdue Fees", overdueRentals.length ? "Items overdue" : "None outstanding", overdueRentals.length ? "#B03A2E" : "#1B6B4A"]
              ].map(([v, l, d, dc]) => (
                <div key={l} style={{ background: "#fff", border: "1px solid #E8E2D9", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: "#0D0D0D" }}>{v}</div>
                  <div style={{ fontSize: 10.5, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: .8, marginTop: 3 }}>{l}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 500, marginTop: 6, color: dc }}>{d}</div>
                </div>
              ))}
            </div>
            {/* Rental table */}
            <RentalTable rentals={rentals.slice(0, 5)} />
          </div>
        )}

        {section === "rentals" && (
          <div style={{ animation: "fadeIn .3s ease" }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "#0D0D0D", marginBottom: "1.4rem" }}>My Rentals</h2>
            <RentalTable rentals={rentals} />
          </div>
        )}

        {section === "wishlist" && (
          <div style={{ animation: "fadeIn .3s ease" }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "#0D0D0D", marginBottom: "1.4rem" }}>
              My Wishlist ({wishlistFilms.length})
            </h2>
            {wishlistFilms.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: "#0D0D0D", marginBottom: 8 }}>Your wishlist is empty</h3>
                <p style={{ color: "#9A9A9A", marginBottom: "1.2rem" }}>Browse films and click ♡ Wishlist to save them here.</p>
                <button onClick={() => navigate("/")} style={{ background: "#C9A84C", color: "#0D0D0D", border: "none", borderRadius: 7, padding: "10px 22px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Browse Catalog</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 18 }}>
                {wishlistFilms.map(f => <FilmCard key={f.id} film={f} showToast={showToast} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RentalTable({ rentals }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E8E2D9", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #E8E2D9", background: "#FAF7F2" }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#0D0D0D" }}>Rental History</span>
        <span style={{ fontSize: 12, color: "#C9A84C" }}>{rentals.length} record{rentals.length !== 1 ? "s" : ""}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 110px", gap: 8, padding: "8px 16px", background: "#FAF7F2", fontSize: 10.5, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: .8, borderBottom: "1px solid #E8E2D9" }}>
        <span>Film</span><span>Rented</span><span>Due Back</span><span>Status</span>
      </div>
      {rentals.map(r => (
        <div key={r.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 110px", gap: 8, padding: "10px 16px", borderBottom: "1px solid #E8E2D9", alignItems: "center" }}>
          <span style={{ fontSize: 13.5, fontWeight: 500, color: "#0D0D0D" }}>{r.filmTitle}</span>
          <span style={{ fontSize: 12.5, color: "#5A5A5A" }}>{r.dateRented}</span>
          <span style={{ fontSize: 12.5, color: "#5A5A5A" }}>{r.dueDateBack}</span>
          <span style={{ fontSize: 10.5, padding: "3px 10px", borderRadius: 12, fontWeight: 500, display: "inline-block", background: BADGE[r.status][0], color: BADGE[r.status][1] }}>{LABEL[r.status]}</span>
        </div>
      ))}
    </div>
  );
}
