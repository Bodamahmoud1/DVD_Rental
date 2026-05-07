const FilmCategory = require("../models/FilmCategory");
const Actor        = require("../models/Actor");

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const categories = await FilmCategory.find().sort("categoryName");
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/categories  (admin)
const createCategory = async (req, res) => {
  try {
    const cat = await FilmCategory.create({ categoryName: req.body.categoryName });
    res.status(201).json({ message: "Category created", category: cat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/categories/:id  (admin)
const updateCategory = async (req, res) => {
  try {
    const cat = await FilmCategory.findByIdAndUpdate(
      req.params.id,
      { categoryName: req.body.categoryName },
      { new: true, runValidators: true }
    );
    if (!cat) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category updated", category: cat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/categories/:id  (admin)
const deleteCategory = async (req, res) => {
  try {
    const cat = await FilmCategory.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/actors
const getActors = async (req, res) => {
  try {
    const { name } = req.query;
    const filter = name ? { actorName: { $regex: name, $options: "i" } } : {};
    const actors = await Actor.find(filter).sort("actorName");
    res.json({ actors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/actors  (admin)
const createActor = async (req, res) => {
  try {
    const actor = await Actor.create(req.body);
    res.status(201).json({ message: "Actor created", actor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/actors/:id  (admin)
const updateActor = async (req, res) => {
  try {
    const actor = await Actor.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!actor) return res.status(404).json({ message: "Actor not found" });
    res.json({ message: "Actor updated", actor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/actors/:id  (admin)
const deleteActor = async (req, res) => {
  try {
    const actor = await Actor.findByIdAndDelete(req.params.id);
    if (!actor) return res.status(404).json({ message: "Actor not found" });
    res.json({ message: "Actor deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCategories, createCategory, updateCategory, deleteCategory,
  getActors, createActor, updateActor, deleteActor,
};
