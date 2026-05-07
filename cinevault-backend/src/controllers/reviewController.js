const Review    = require("../models/Review");
const FilmTitle = require("../models/FilmTitle");

// POST /api/reviews — submit a review (auth required)
const createReview = async (req, res) => {
  try {
    const { filmId, stars, text } = req.body;
    if (!filmId || !stars) return res.status(400).json({ message: "filmId and stars are required" });

    const film = await FilmTitle.findById(filmId);
    if (!film) return res.status(404).json({ message: "Film not found" });

    // Check for existing review
    const existing = await Review.findOne({ memberId: req.user._id, filmId });
    if (existing) return res.status(409).json({ message: "You have already reviewed this film" });

    const review = await Review.create({
      memberId: req.user._id,
      filmId,
      stars: Math.min(5, Math.max(1, Number(stars))),
      text: text || "",
    });

    await review.populate("memberId", "memberName profilePic");
    res.status(201).json({ message: "Review submitted", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/:filmId — get all reviews for a film (public)
const getReviewsByFilm = async (req, res) => {
  try {
    const reviews = await Review.find({ filmId: req.params.filmId })
      .populate("memberId", "memberName profilePic")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avg = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ reviews, averageRating: Number(avg), count: reviews.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/reviews/:id — delete own review (auth required)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Only owner or admin can delete
    if (String(review.memberId) !== String(req.user._id) && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createReview, getReviewsByFilm, deleteReview };
