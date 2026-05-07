const express = require("express");
const router  = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new member
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberName, email, password]
 *             properties:
 *               memberName: { type: string, example: "Ahmed Hassan" }
 *               email:      { type: string, example: "ahmed@example.com" }
 *               password:   { type: string, example: "Ahmed1234!" }
 *               phone:      { type: string, example: "0100000000" }
 *     responses:
 *       201:
 *         description: Member registered successfully
 *       409:
 *         description: Email already registered
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: "ahmed@example.com" }
 *               password: { type: string, example: "Ahmed1234!" }
 *     responses:
 *       200:
 *         description: Login successful - returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in member
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current member data
 *       401:
 *         description: Not authorized
 */
router.get("/me", protect, getMe);

module.exports = router;
