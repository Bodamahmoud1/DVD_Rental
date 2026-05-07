const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  filmId:   { type: mongoose.Schema.Types.ObjectId, ref: "FilmTitle", required: true },
  stars:    { type: Number, required: true, min: 1, max: 5 },
  text:     { type: String, default: "", maxlength: 500 },
}, { timestamps: true });

// One review per member per film
reviewSchema.index({ memberId: 1, filmId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
