const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const startingBalance = () =>
  Number(process.env.MEMBER_STARTING_BALANCE) || 30;

const memberSchema = new mongoose.Schema({
  memberName: { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true, minlength: 8 },
  phone:      { type: String, default: "" },
  dob:        { type: Date },
  profilePic: { type: String, default: "" },
  /** Wallet balance in GBP — rental price is deducted here */
  balance:    { type: Number, default: () => startingBalance(), min: 0 },
  isAdmin:    { type: Boolean, default: false },
  joinDate:   { type: Date, default: Date.now },
}, { timestamps: true });

const resolveMemberId = (memberOrId) => {
  if (memberOrId == null) return null;
  if (typeof memberOrId === "string") return memberOrId;
  if (memberOrId instanceof mongoose.Types.ObjectId) return memberOrId;
  if (memberOrId._id != null) return memberOrId._id;
  return null;
};

/** Ensure legacy members (no balance field) get a starting wallet */
memberSchema.statics.ensureWallet = async function (memberOrId) {
  const id = resolveMemberId(memberOrId);
  if (!id) return null;
  const m = await this.findById(id);
  if (!m) return null;
  if (m.balance == null || m.balance === undefined) {
    m.balance = startingBalance();
    await m.save();
  }
  return m;
};

// Hash password before save
memberSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
memberSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

// Remove password from JSON output
memberSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("Member", memberSchema);
