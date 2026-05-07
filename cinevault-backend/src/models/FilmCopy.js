const mongoose = require("mongoose");

const filmCopySchema = new mongoose.Schema({
  filmId:          { type: mongoose.Schema.Types.ObjectId, ref: "FilmTitle", required: true },
  currentlyRented: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("FilmCopy", filmCopySchema);
