const express = require("express");
const router  = express.Router();
const { createRental, getMyRentals, returnRental, getAllRentals } = require("../controllers/rentalController");
const { protect, adminOnly } = require("../middleware/auth");

/**
 * @swagger
 * /api/rentals:
 *   post:
 *     summary: Create a new rental
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [filmId]
 *             properties:
 *               filmId: { type: string, description: MongoDB Film ID }
 *     responses:
 *       201:
 *         description: Rental created successfully
 *       400:
 *         description: No copies available
 */
router.post("/", protect, createRental);

/**
 * @swagger
 * /api/rentals/my:
 *   get:
 *     summary: Get current member's rental history
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of member's rentals
 */
router.get("/my", protect, getMyRentals);

/**
 * @swagger
 * /api/rentals/{id}/return:
 *   put:
 *     summary: Process a DVD return (Admin only)
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Return processed with overdue cost
 *       400:
 *         description: Already returned
 */
router.put("/:id/return", protect, adminOnly, returnRental);

/**
 * @swagger
 * /api/rentals:
 *   get:
 *     summary: Get all rentals (Admin only)
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, returned] }
 *       - in: query
 *         name: memberId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of all rentals
 */
router.get("/", protect, adminOnly, getAllRentals);

module.exports = router;
