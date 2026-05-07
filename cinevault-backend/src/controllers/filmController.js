const FilmTitle    = require("../models/FilmTitle");
const FilmCopy     = require("../models/FilmCopy");
const { clearCache } = require("../config/redis");

// GET /api/films
const getFilms = async (req, res) => {
  try {
    const { title, category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (title)    filter.filmTitle = { $regex: title, $options: "i" };
    if (category) filter.filmCategoryId = category;

    const total = await FilmTitle.countDocuments(filter);
    const films = await FilmTitle.find(filter)
      .populate("filmCategoryId", "categoryName")
      .populate("actors", "actorName gender")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Add available copies count per film + low stock flag
    const LOW_STOCK_THRESHOLD = 2;
    const filmsWithCopies = await Promise.all(films.map(async (f) => {
      const availableCopies = await FilmCopy.countDocuments({ filmId: f._id, currentlyRented: false });
      return { ...f.toObject(), availableCopies, lowStock: availableCopies <= LOW_STOCK_THRESHOLD };
    }));

    res.json({ total, page: Number(page), films: filmsWithCopies });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/films/:id
const getFilmById = async (req, res) => {
  try {
    const film = await FilmTitle.findById(req.params.id)
      .populate("filmCategoryId", "categoryName")
      .populate("actors", "actorName gender");
    if (!film) return res.status(404).json({ message: "Film not found" });

    const copies = await FilmCopy.find({ filmId: film._id });
    const availableCopies = copies.filter(c => !c.currentlyRented).length;
    res.json({ ...film.toObject(), copies, availableCopies });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/films  (admin)
const createFilm = async (req, res) => {
  try {
    const film = await FilmTitle.create(req.body);
    // Create initial copies
    const copiesCount = req.body.copies || 1;
    await FilmCopy.insertMany(
      Array.from({ length: copiesCount }, () => ({ filmId: film._id }))
    );
    await clearCache("films_list:*");
    res.status(201).json({ message: "Film created", film });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/films/:id  (admin)
const updateFilm = async (req, res) => {
  try {
    const film = await FilmTitle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!film) return res.status(404).json({ message: "Film not found" });
    await clearCache("films_list:*");
    res.json({ message: "Film updated", film });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/films/:id  (admin)
const deleteFilm = async (req, res) => {
  try {
    const film = await FilmTitle.findByIdAndDelete(req.params.id);
    if (!film) return res.status(404).json({ message: "Film not found" });
    await FilmCopy.deleteMany({ filmId: req.params.id });
    await clearCache("films_list:*");
    res.json({ message: "Film deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/films/alerts/low-stock — films with low availability (admin)
const getLowStockFilms = async (req, res) => {
  try {
    const LOW_STOCK_THRESHOLD = 2;
    const films = await FilmTitle.find().populate("filmCategoryId", "categoryName");
    const results = await Promise.all(films.map(async (f) => {
      const availableCopies = await FilmCopy.countDocuments({ filmId: f._id, currentlyRented: false });
      const totalCopies = await FilmCopy.countDocuments({ filmId: f._id });
      return { ...f.toObject(), availableCopies, totalCopies, lowStock: availableCopies <= LOW_STOCK_THRESHOLD };
    }));
    const lowStockFilms = results.filter(f => f.lowStock);
    res.json({
      count: lowStockFilms.length,
      threshold: LOW_STOCK_THRESHOLD,
      films: lowStockFilms,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getFilms, getFilmById, createFilm, updateFilm, deleteFilm, getLowStockFilms };
