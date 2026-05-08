import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiCreateRental } from "../services/api";

const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

export default function FilmCard({ film, showToast, catalogOnline = true }) {
  const navigate = useNavigate();
  const { user, rentals, refreshRentals, patchUser } = useAuth();
  const avail    = film.copies > 0;
  const price    = Number(film.price ?? 0);
  const canAfford = !user || Number(user.balance) >= price;
  const filmId = film._id || film.id;
  const canRentById = isMongoObjectId(filmId);
  const canRentNow = catalogOnline && canRentById;

  // Check if the logged-in user already has an active (not returned) rental for this film
  const alreadyRented = user && rentals.some(
    r => !r.returnDate && r.status !== "done" && String(r.filmId) === String(filmId)
  );

  const handleRent = async (e) => {
    e.stopPropagation();
    if (!user) { showToast("Please sign in to rent films", "info"); navigate("/login"); return; }
    if (alreadyRented) {
      showToast("You already have an active rental for this film.", "info");
      return;
    }
    if (!canAfford) {
      showToast(`Insufficient balance £${Number(user.balance).toFixed(2)} — rental costs £${price.toFixed(2)}.`, "error");
      return;
    }
    if (!catalogOnline) {
      showToast("Catalog server is offline. Start backend and MongoDB, then refresh.", "error");
      return;
    }
    if (!canRentById) {
      showToast("This title is preview-only right now. Refresh catalog and try again.", "info");
      return;
    }
    try {
      const data   = await apiCreateRental(filmId);
      if (typeof data.balance === "number") patchUser({ balance: data.balance });
      await refreshRentals();
      showToast(`"${film.title || film.filmTitle}" rented! Due back in 7 days.`, "success");
    } catch (err) {
      showToast(err.message || "Could not rent film", "error");
    }
  };
  const hoverSrc = (film.hoverImage || film.poster).replace('/w1280/', '/w500/');

  return (
    <div
      className="film-card"
      onClick={() => navigate(`/film/${film.id}`)}
    >
      {/* ── POSTER AREA ── */}
      <div className="fc-poster">

        {/* Layer 1 — main poster */}
        <img
          className="fc-poster-img"
          src={film.poster}
          alt={film.title}
          loading="lazy"
          onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
        />

        {/* Fallback gradient (shown when poster fails) */}
        <div className="fc-poster-fallback">
          <span>{film.title}</span>
        </div>

        {/* Layer 2 — hover backdrop image */}
        <div
          className="fc-hover-img"
          style={{ backgroundImage: `url(${hoverSrc})` }}
          aria-hidden="true"
        />

        {/* Layer 3 — cinematic overlay: dark gradient + blur vignette */}
        <div className="fc-overlay" aria-hidden="true" />

        {/* Layer 4 — metadata that slides up on hover */}
        <div className="fc-hover-meta" aria-hidden="true">
          <span className="fc-hover-genre">{film.category}</span>
          <p className="fc-hover-title">{film.title}</p>
          <div className="fc-hover-stats">
            <span className="fc-hover-star">★ {film.rating}</span>
            <span className="fc-hover-dur">{film.duration} min</span>
          </div>
        </div>

     
        <div className="fc-badge fc-badge-year">{film.year}</div>
        <div className={`fc-badge fc-badge-avail ${avail ? "fc-badge-avail--yes" : "fc-badge-avail--no"}`}>
          {avail ? `${film.copies} avail.` : "Unavailable"}
        </div>
      </div>


      <div className="fc-info">
        <div className="fc-title">{film.title}</div>
        <div className="fc-sub">{film.category} · {film.duration} min</div>

        <div className="fc-row">
          <span className="fc-price">£{price.toFixed(2)}</span>
          <span className="fc-rating">
            <span className="fc-star">★</span>
            {film.rating}
            <span className="fc-reviews">
              ({film.reviews >= 1000 ? (film.reviews / 1000).toFixed(1) + "k" : film.reviews})
            </span>
          </span>
        </div>

        <button
          className={`fc-btn ${
            alreadyRented
              ? "fc-btn--rented"
              : avail && (!user || canAfford) && canRentNow
              ? "fc-btn--active"
              : "fc-btn--disabled"
          }`}
          onClick={handleRent}
          disabled={alreadyRented || !avail || (user && !canAfford) || !canRentNow}
        >
          {alreadyRented
            ? "✓ Already Rented"
            : !avail
            ? "Unavailable"
            : !catalogOnline
            ? "Server Offline"
            : !canRentById
            ? "Unavailable Online"
            : user && !canAfford
            ? "Insufficient Balance"
            : "Rent Now"}
        </button>
      </div>
    </div>
  );
}
