const mongoose = require("mongoose");

const actorSchema = new mongoose.Schema({
  actorName: { type: String, required: true, trim: true },
  gender:    { type: String, enum: ["M","F","O"], default: "M" },
}, { timestamps: true });

module.exports = mongoose.model("Actor", actorSchema);
