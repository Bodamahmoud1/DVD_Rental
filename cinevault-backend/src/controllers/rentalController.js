const Rental   = require("../models/Rental");
const FilmCopy = require("../models/FilmCopy");
const FilmTitle = require("../models/FilmTitle");
const Member    = require("../models/Member");
const { clearCache } = require("../config/redis");

// POST /api/rentals  — create rental
const createRental = async (req, res) => {
  try {
    const { filmId } = req.body;

    const film = await FilmTitle.findById(filmId);
    if (!film) return res.status(404).json({ message: "Film not found" });

    // ── Check if user already has an active rental for this film ──
    const activeCopies = await FilmCopy.find({ filmId, currentlyRented: true });
    if (activeCopies.length) {
      const existingRental = await Rental.findOne({
        memberId: req.user._id,
        copyId: { $in: activeCopies.map(c => c._id) },
        returnDate: null,
      });
      if (existingRental) {
        return res.status(409).json({ message: "You already have an active rental for this film" });
      }
    }

    const price = Number(film.price);
    if (!Number.isFinite(price) || price < 0)
      return res.status(400).json({ message: "Invalid film price" });

    const member = await Member.ensureWallet(req.user._id);
    if (member.balance < price) {
      return res.status(402).json({
        message: "Insufficient wallet balance",
        balance: member.balance,
        required: price,
      });
    }

    const copy = await FilmCopy.findOne({ filmId, currentlyRented: false });
    if (!copy) return res.status(400).json({ message: "No copies available" });

    copy.currentlyRented = true;
    await copy.save();

    try {
      member.balance = Number((member.balance - price).toFixed(2));
      await member.save();

      const dueDateBack = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const rental = await Rental.create({
        memberId:    req.user._id,
        copyId:      copy._id,
        dueDateBack,
        rentalCost:  price,
      });

      await rental.populate([
        { path: "copyId", populate: { path: "filmId", select: "filmTitle poster" } },
      ]);

      await clearCache("films_list:*");

      res.status(201).json({
        message: "Rental created",
        rental,
        balance: member.balance,
      });
    } catch (inner) {
      copy.currentlyRented = false;
      await copy.save();
      throw inner;
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/rentals/my  — member's own rentals
const getMyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ memberId: req.user._id })
      .populate({ path: "copyId", populate: { path: "filmId", select: "filmTitle poster price" } })
      .sort({ createdAt: -1 });
    res.json({ rentals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/rentals/:id/return  — process return (admin)
const returnRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: "Rental not found" });
    if (rental.returnDate) return res.status(400).json({ message: "Already returned" });

    rental.processReturn();
    await rental.save();

    // Free the copy
    await FilmCopy.findByIdAndUpdate(rental.copyId, { currentlyRented: false });
    await clearCache("films_list:*");

    res.json({ message: "Return processed", overDueCost: rental.overDueCost, rental });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/rentals  — all rentals (admin)
const getAllRentals = async (req, res) => {
  try {
    const { status, memberId } = req.query;
    const filter = {};
    if (memberId) filter.memberId = memberId;
    if (status === "active")   filter.returnDate = null;
    if (status === "returned") filter.returnDate = { $ne: null };

    const rentals = await Rental.find(filter)
      .populate("memberId", "memberName email")
      .populate({ path: "copyId", populate: { path: "filmId", select: "filmTitle" } })
      .sort({ createdAt: -1 });

    res.json({ count: rentals.length, rentals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createRental, getMyRentals, returnRental, getAllRentals };
