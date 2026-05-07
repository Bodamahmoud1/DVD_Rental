const express = require("express");
const router  = express.Router();
const { getFilms, getFilmById, createFilm, updateFilm, deleteFilm, getLowStockFilms } = require("../controllers/filmController");
const { protect, adminOnly } = require("../middleware/auth");
const { cacheMiddleware } = require("../config/redis");

/**
 * @swagger
 * /api/films:
 *   get:
 *     summary: Get all films with pagination and filters
 *     tags: [Films]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema: { type: string }
 *         description: Filter by title
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Filter by category ID
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *     responses:
 *       200:
 *         description: List of films
 */
router.get("/", cacheMiddleware("films_list", 300), getFilms);

/**
 * @swagger
 * /api/films/alerts/low-stock:
 *   get:
 *     summary: Get films with low stock (Admin only)
 *     tags: [Films]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of low-stock films with threshold alerts
 */
router.get("/alerts/low-stock", protect, adminOnly, getLowStockFilms);

/**
 * @swagger
 * /api/films/{id}:
 *   get:
 *     summary: Get a single film by ID
 *     tags: [Films]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Film details with copies and actors
 *       404:
 *         description: Film not found
 */
router.get("/:id", getFilmById);

/**
 * @swagger
 * /api/films:
 *   post:
 *     summary: Create a new film (Admin only)
 *     tags: [Films]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [filmTitle]
 *             properties:
 *               filmTitle:    { type: string }
 *               releaseDate:  { type: string, format: date }
 *               filmDuration: { type: number }
 *               price:        { type: number }
 *               copies:       { type: number }
 *     responses:
 *       201:
 *         description: Film created
 *       403:
 *         description: Admin access required
 */
router.post("/", protect, adminOnly, createFilm);

/**
 * @swagger
 * /api/films/{id}:
 *   put:
 *     summary: Update a film (Admin only)
 *     tags: [Films]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Film updated
 *       404:
 *         description: Film not found
 */
router.put("/:id", protect, adminOnly, updateFilm);

/**
 * @swagger
 * /api/films/{id}:
 *   delete:
 *     summary: Delete a film (Admin only)
 *     tags: [Films]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Film deleted
 *       404:
 *         description: Film not found
 */
router.delete("/:id", protect, adminOnly, deleteFilm);

module.exports = router;
