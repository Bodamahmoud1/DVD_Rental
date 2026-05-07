const mongoose = require("mongoose");

const filmTitleSchema = new mongoose.Schema({
  filmTitle:      { type: String, required: true, trim: true },
  releaseDate:    { type: Date },
  filmDuration:   { type: Number },
  filmCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "FilmCategory" },
  actors:         [{ type: mongoose.Schema.Types.ObjectId, ref: "Actor" }],
  description:    { type: String, default: "" },
  poster:         { type: String, default: "" },
  hoverImage:     { type: String, default: "" },
  rating:         { type: Number, default: 0, min: 0, max: 5 },
  price:          { type: Number, default: 3.50 },
}, { timestamps: true });

module.exports = mongoose.model("FilmTitle", filmTitleSchema);
