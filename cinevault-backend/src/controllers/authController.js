const jwt    = require("jsonwebtoken");
const Member = require("../models/Member");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "24h" });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { memberName, email, password, phone, dob } = req.body;
    if (await Member.findOne({ email }))
      return res.status(409).json({ message: "Email already registered" });

    const member = await Member.create({ memberName, email, password, phone, dob });
    const token  = generateToken(member._id);
    res.status(201).json({ token, member });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const member = await Member.findOne({ email }).select("+password");
    if (!member || !(await member.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    await Member.ensureWallet(member);
    const token = generateToken(member._id);
    res.json({ token, member: member.toJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  const m = await Member.ensureWallet(req.user);
  res.json(m.toJSON());
};

module.exports = { register, login, getMe };
