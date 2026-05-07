const express = require("express");
const router  = express.Router();
const { getProfile, updateProfile, uploadProfilePic, getAllMembers, deleteMember } = require("../controllers/memberController");
const { protect, adminOnly } = require("../middleware/auth");

/**
 * @swagger
 * /api/members/profile:
 *   get:
 *     summary: Get current member profile
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Member profile data
 */
router.get("/profile", protect, getProfile);

/**
 * @swagger
 * /api/members/profile:
 *   put:
 *     summary: Update current member profile
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberName: { type: string }
 *               phone:      { type: string }
 *               profilePic: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put("/profile", protect, updateProfile);

/**
 * @swagger
 * /api/members/profile/picture:
 *   put:
 *     summary: Upload profile picture (base64)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image: { type: string, description: "Base64 encoded image data" }
 *     responses:
 *       200:
 *         description: Profile picture updated
 *       400:
 *         description: No image data or invalid format
 */
router.put("/profile/picture", protect, uploadProfilePic);

/**
 * @swagger
 * /api/members:
 *   get:
 *     summary: Get all members (Admin only)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all members
 */
router.get("/", protect, adminOnly, getAllMembers);

/**
 * @swagger
 * /api/members/{id}:
 *   delete:
 *     summary: Delete a member (Admin only)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Member deleted
 */
router.delete("/:id", protect, adminOnly, deleteMember);

module.exports = router;
