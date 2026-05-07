const Member = require("../models/Member");
const sharp  = require("sharp");

// GET /api/members/profile
const getProfile = async (req, res) => {
  res.json(req.user);
};

// PUT /api/members/profile
const updateProfile = async (req, res) => {
  try {
    const { memberName, phone, dob, profilePic } = req.body;
    const member = await Member.findByIdAndUpdate(
      req.user._id,
      { memberName, phone, dob, profilePic },
      { new: true, runValidators: true }
    );
    res.json({ message: "Profile updated", member });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/members/profile/picture — upload profile picture
const uploadProfilePic = async (req, res) => {
  try {
    const { image } = req.body; // base64 data URI
    if (!image) return res.status(400).json({ message: "No image data provided" });

    // Strip data URI prefix and decode
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length < 100) return res.status(400).json({ message: "Invalid image data" });

    // Resize to 200x200 avatar and re-encode as base64 JPEG
    const resized = await sharp(buffer)
      .resize(200, 200, { fit: "cover", position: "center" })
      .jpeg({ quality: 80 })
      .toBuffer();
    const dataUri = `data:image/jpeg;base64,${resized.toString("base64")}`;

    // Store the data URI directly in the DB — no filesystem needed
    const member = await Member.findByIdAndUpdate(
      req.user._id,
      { profilePic: dataUri },
      { new: true }
    );

    res.json({ message: "Profile picture updated", profilePic: dataUri, member });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/members  (admin)
const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json({ count: members.length, members });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/members/:id  (admin)
const deleteMember = async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: "Member deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile, uploadProfilePic, getAllMembers, deleteMember };

