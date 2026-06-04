const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      type: String,
      trim: true
    },
    paymentDue: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

supplierSchema.index({ name: "text", phone: "text", email: "text" });

module.exports = mongoose.model("Supplier", supplierSchema);

