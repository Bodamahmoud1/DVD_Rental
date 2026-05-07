import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import { FILMS } from "../data/films";
import { apiGetFilm, apiCreateRental, apiGetReviews, apiCreateReview, apiDeleteReview } from "../services/api";

const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

const reviewSchema = Yup.object({
  stars: Yup.number().min(1, "Select a rating").max(5).required("Rating required"),
  text:  Yup.string().max(500, "Max 500 characters"),
});

export default function FilmDetail({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshRentals, patchUser, wishlist, toggleWishlist } = useAuth();
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    apiGetFilm(id)
      .then(data => setFilm(data))
      .catch(() => {
        // fallback to static
        const f = FILMS.find(f => f.id === parseInt(id) || f._id === id);
        setFilm(f || null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    if (!id) return;
    apiGetReviews(id)
      .then(data => {
        setReviews(data.reviews || []);
        setAvgRating(data.averageRating || 0);
      })
      .catch(() => setReviews([]));
  }, [id]);

  if (loading) return <div style={{ textAlign:"center", padding:"4rem" }}><div style={{ width:36, height:36, border:"2.5px solid #E8E2D9", borderTopColor:"#C9A84C", borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto" }}/></div>;
  if (!film) { navigate("/"); return null; }

  const title    = film.filmTitle || film.title;
  const avail    = (film.availableCopies ?? film.copies) > 0;
  const category = film.filmCategoryId?.categoryName || film.category;
  const year     = film.releaseDate ? new Date(film.releaseDate).getFullYear() : film.year;
  const actors   = film.actors?.map(a => a.actorName || a) || [];
  const filmId   = String(film._id || film.id);
  const canRentById = isMongoObjectId(filmId);
  const inWishlist = wishlist.some((entry) => entry.id === filmId);
  const rentPrice = Number(film.price ?? 0);
  const canAfford = !user || Number(user.balance) >= rentPrice;

  const handleRent = async () => {
    if (!user) { showToast("Please sign in to rent films", "info"); navigate("/login"); return; }
    if (!canAfford) {
      showToast(`Insufficient balance £${Number(user.balance).toFixed(2)} — rental costs £${rentPrice.toFixed(2)}.`, "error");
      return;
    }
    if (!canRentById) {
      showToast("This title is preview-only right now. Refresh catalog and try again.", "info");
      return;
    }
    try {
      const data = await apiCreateRental(filmId);
      if (typeof data.balance === "number") patchUser({ balance: data.balance });
      await refreshRentals();
      showToast(`"${title}" rented! Due back in 7 days.`, "success");
    } catch (err) {
      showToast(err.message || "Could not rent film", "error");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await apiDeleteReview(reviewId);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      showToast("Review deleted", "info");
    } catch (err) {
      showToast(err.message || "Could not delete review", "error");
    }
  };

  const alreadyReviewed = reviews.some(r => r.memberId?._id === user?._id || r.memberId === user?._id);

  return (
    <div style={{ padding:"2rem 2.5rem", animation:"fadeIn .35s ease", maxWidth:1100, margin:"0 auto" }}>
      <button onClick={() => navigate(-1)} style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:13, color:"#5A5A5A", background:"none", border:"none", cursor:"pointer", marginBottom:"1.5rem" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        Back to catalog
      </button>

      <div className="film-detail-grid" style={{ display:"grid", gridTemplateColumns:"240px 1fr", gap:"2.5rem", background:"#fff", border:"1px solid #E8E2D9", borderRadius:14, padding:"2rem", boxShadow:"0 4px 24px rgba(0,0,0,.08)", marginBottom:"2rem" }}>
        <div style={{ aspectRatio:"2/3", borderRadius:10, overflow:"hidden", position:"relative", background:"#0D0D0D", flexShrink:0 }}>
          <img src={film.poster} alt={title} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.target.style.display="none"; }}/>
          <div style={{ position:"absolute", bottom:12, left:12, background:"#C9A84C", color:"#0D0D0D", fontSize:10, fontWeight:700, padding:"4px 11px", borderRadius:4, zIndex:2 }}>HD</div>
        </div>

        <div style={{ display:"flex", flexDirection:"column" }}>
          <div style={{ display:"inline-block", background:"#FAF7F2", border:"1px solid #E8E2D9", fontSize:10.5, color:"#9A9A9A", padding:"4px 12px", borderRadius:4, textTransform:"uppercase", letterSpacing:1.2, marginBottom:12, width:"fit-content" }}>{category}</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:700, color:"#0D0D0D", lineHeight:1.2, marginBottom:6 }}>{title}</h1>
          <p style={{ fontSize:13, color:"#9A9A9A", marginBottom:"1.4rem" }}>{year} · {film.filmDuration || film.duration} min</p>

          <div className="film-stats-row" style={{ display:"flex", gap:"1.5rem", padding:"1rem 0", borderTop:"1px solid #E8E2D9", borderBottom:"1px solid #E8E2D9", marginBottom:"1.4rem", flexWrap:"wrap" }}>
            {[["★ "+(avgRating || film.rating),"Rating"],[(film.filmDuration||film.duration)+" min","Duration"],[(film.availableCopies??film.copies),"Copies Left"],["£"+(film.price||0).toFixed(2),"Per Rental"]].map(([v,l]) => (
              <div key={l} style={{ textAlign:"center", flex:1, minWidth:60 }}>
                <strong style={{ display:"block", fontSize:18, fontFamily:"'Playfair Display',serif", color:"#0D0D0D" }}>{v}</strong>
                <small style={{ fontSize:10, color:"#9A9A9A", textTransform:"uppercase", letterSpacing:1 }}>{l}</small>
              </div>
            ))}
          </div>

          <p style={{ fontSize:13.5, color:"#2A2A2A", lineHeight:1.8, marginBottom:"1.4rem", flex:1 }}>{film.description || film.desc}</p>

          {actors.length > 0 && <>
            <div style={{ fontSize:10.5, fontWeight:500, color:"#9A9A9A", textTransform:"uppercase", letterSpacing:1.2, marginBottom:9 }}>Cast</div>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:"1.6rem" }}>
              {actors.map(a => <span key={a} style={{ background:"#FAF7F2", border:"1px solid #E8E2D9", borderRadius:5, fontSize:11.5, color:"#2A2A2A", padding:"5px 11px" }}>{a}</span>)}
            </div>
          </>}

          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <button onClick={handleRent} disabled={!avail || (user && !canAfford) || !canRentById} style={{ background:avail && (!user || canAfford) && canRentById?"#0D0D0D":"#E8E2D9", color:avail && (!user || canAfford) && canRentById?"#fff":"#9A9A9A", border:"none", borderRadius:8, padding:"11px 28px", fontSize:13.5, fontWeight:500, cursor:avail && (!user || canAfford) && canRentById?"pointer":"not-allowed" }}>
              {!avail ? "Currently Unavailable" : !canRentById ? "Unavailable Online" : user && !canAfford ? "Insufficient Balance" : `Rent for £${rentPrice.toFixed(2)}`}
            </button>
            <button onClick={() => { toggleWishlist(film); showToast(inWishlist?"Removed from wishlist":`"${title}" added to wishlist`,"info"); }}
              style={{ background:"#fff", color:"#0D0D0D", border:"1px solid #E8E2D9", borderRadius:8, padding:"11px 22px", fontSize:13.5, cursor:"pointer" }}>
              {inWishlist ? "♥ Wishlisted" : "♡ Wishlist"}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginBottom:"2rem" }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, marginBottom:"1rem", color:"#0D0D0D" }}>
          Member Reviews {reviews.length > 0 && <span style={{ fontSize:14, color:"#9A9A9A", fontWeight:400 }}>({reviews.length})</span>}
        </h2>

        {/* Write a Review Form */}
        {user && !alreadyReviewed && (
          <div style={{ background:"#fff", border:"1px solid #E8E2D9", borderRadius:10, padding:"1.2rem 1.4rem", marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:500, color:"#0D0D0D", marginBottom:10 }}>Write a Review</div>
            <Formik
              initialValues={{ stars: 0, text: "" }}
              validationSchema={reviewSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                try {
                  const data = await apiCreateReview(filmId, values.stars, values.text);
                  setReviews(prev => [data.review, ...prev]);
                  showToast("Review submitted!", "success");
                  resetForm();
                } catch (err) {
                  showToast(err.message || "Could not submit review", "error");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ values, setFieldValue, isSubmitting }) => (
                <Form>
                  <div style={{ display:"flex", gap:4, marginBottom:10 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setFieldValue("stars", n)}
                        style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color: n <= values.stars ? "#C9A84C" : "#E8E2D9", transition:"color .15s" }}>
                        ★
                      </button>
                    ))}
                  </div>
                  <ErrorMessage name="stars" render={m => <div style={{ fontSize:11.5, color:"#B03A2E", marginBottom:6 }}>{m}</div>} />
                  <Field as="textarea" name="text" placeholder="Share your thoughts about this film..." rows={3}
                    style={{ width:"100%", padding:"10px 13px", border:"1px solid #E8E2D9", borderRadius:7, fontSize:13, color:"#0D0D0D", background:"#FAF7F2", outline:"none", resize:"vertical", boxSizing:"border-box", fontFamily:"'DM Sans', sans-serif" }} />
                  <ErrorMessage name="text" render={m => <div style={{ fontSize:11.5, color:"#B03A2E", marginTop:4 }}>{m}</div>} />
                  <button type="submit" disabled={isSubmitting || values.stars === 0}
                    style={{ marginTop:10, background:"#0D0D0D", color:"#fff", border:"none", borderRadius:7, padding:"8px 20px", fontSize:12.5, fontWeight:500, cursor: values.stars > 0 ? "pointer" : "not-allowed", opacity: isSubmitting ? .7 : 1 }}>
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div style={{ background:"#fff", border:"1px solid #E8E2D9", borderRadius:10, padding:"2rem", textAlign:"center" }}>
            <p style={{ color:"#9A9A9A", fontSize:13 }}>No reviews yet. Be the first to review this film!</p>
          </div>
        ) : (
          reviews.map(r => (
            <div key={r._id || r.name} style={{ background:"#fff", border:"1px solid #E8E2D9", borderRadius:10, padding:"1.2rem 1.4rem", marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontSize:13.5, fontWeight:500, color:"#0D0D0D" }}>{r.memberId?.memberName || r.name || "Anonymous"}</span>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ color:"#C9A84C", fontSize:12 }}>{"★".repeat(r.stars)}{"☆".repeat(5-r.stars)}</span>
                  {user && (String(r.memberId?._id) === String(user._id) || user.isAdmin) && (
                    <button onClick={() => handleDeleteReview(r._id)} style={{ background:"none", border:"none", color:"#B03A2E", fontSize:11, cursor:"pointer" }}>Delete</button>
                  )}
                </div>
              </div>
              {r.text && <p style={{ fontSize:13, color:"#5A5A5A", lineHeight:1.7 }}>{r.text}</p>}
              {r.createdAt && <small style={{ fontSize:10.5, color:"#9A9A9A" }}>{new Date(r.createdAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}</small>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
