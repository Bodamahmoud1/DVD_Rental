const express = require("express");
const router  = express.Router();
const {
  getCategories, createCategory, updateCategory, deleteCategory,
  getActors, createActor, updateActor, deleteActor,
} = require("../controllers/categoryController");
const { protect, adminOnly } = require("../middleware/auth");

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all film categories
 *     tags: [Catalog]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/categories", getCategories);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryName]
 *             properties:
 *               categoryName: { type: string, example: "Horror" }
 *     responses:
 *       201:
 *         description: Category created
 */
router.post("/categories", protect, adminOnly, createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category (Admin only)
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName: { type: string }
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 */
router.put("/categories/:id", protect, adminOnly, updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category (Admin only)
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 */
router.delete("/categories/:id", protect, adminOnly, deleteCategory);

/**
 * @swagger
 * /api/actors:
 *   get:
 *     summary: Get all actors with optional name search
 *     tags: [Catalog]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Search by actor name
 *     responses:
 *       200:
 *         description: List of actors
 */
router.get("/actors", getActors);

/**
 * @swagger
 * /api/actors:
 *   post:
 *     summary: Create a new actor (Admin only)
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [actorName]
 *             properties:
 *               actorName: { type: string, example: "Tom Hanks" }
 *               gender:    { type: string, enum: [M, F, O] }
 *     responses:
 *       201:
 *         description: Actor created
 */
router.post("/actors", protect, adminOnly, createActor);

/**
 * @swagger
 * /api/actors/{id}:
 *   put:
 *     summary: Update an actor (Admin only)
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actorName: { type: string }
 *               gender:    { type: string, enum: [M, F, O] }
 *     responses:
 *       200:
 *         description: Actor updated
 *       404:
 *         description: Actor not found
 */
router.put("/actors/:id", protect, adminOnly, updateActor);

/**
 * @swagger
 * /api/actors/{id}:
 *   delete:
 *     summary: Delete an actor (Admin only)
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Actor deleted
 *       404:
 *         description: Actor not found
 */
router.delete("/actors/:id", protect, adminOnly, deleteActor);

module.exports = router;
