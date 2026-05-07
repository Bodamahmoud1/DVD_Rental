const express = require("express");
const router  = express.Router();
const { createReview, getReviewsByFilm, deleteReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Submit a review for a film
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [filmId, stars]
 *             properties:
 *               filmId: { type: string, description: "MongoDB Film ID" }
 *               stars:  { type: number, minimum: 1, maximum: 5 }
 *               text:   { type: string, maxLength: 500 }
 *     responses:
 *       201:
 *         description: Review submitted
 *       409:
 *         description: Already reviewed this film
 */
router.post("/", protect, createReview);

/**
 * @swagger
 * /api/reviews/{filmId}:
 *   get:
 *     summary: Get all reviews for a film
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: filmId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of reviews with average rating
 */
router.get("/:filmId", getReviewsByFilm);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review (owner or admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review deleted
 *       403:
 *         description: Not authorized
 */
router.delete("/:id", protect, deleteReview);

module.exports = router;
