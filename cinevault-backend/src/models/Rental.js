const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
  memberId:    { type: mongoose.Schema.Types.ObjectId, ref: "Member",   required: true },
  copyId:      { type: mongoose.Schema.Types.ObjectId, ref: "FilmCopy", required: true },
  dateRented:  { type: Date, default: Date.now },
  dueDateBack: { type: Date, required: true },
  rentalCost:  { type: Number, default: 3.50 },
  overDueCost: { type: Number, default: 0 },
  returnDate:  { type: Date, default: null },
}, { timestamps: true });

// Auto-calculate overdue cost on return
rentalSchema.methods.processReturn = function () {
  this.returnDate = new Date();
  if (this.returnDate > this.dueDateBack) {
    const daysLate = Math.ceil((this.returnDate - this.dueDateBack) / (1000 * 60 * 60 * 24));
    this.overDueCost = parseFloat((daysLate * 0.50).toFixed(2));
  }
};

module.exports = mongoose.model("Rental", rentalSchema);
