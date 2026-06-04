const mongoose = require("mongoose");

const PART_CATEGORIES = [
  "Engine",
  "Brakes",
  "Suspension",
  "Electrical",
  "Tyres",
  "Body",
  "Other"
];

const partSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: PART_CATEGORIES,
      default: "Other"
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    min_stock_level: {
      type: Number,
      required: true,
      min: 0,
      default: 5
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null
    }
  },
  { timestamps: true }
);

partSchema.index({ name: "text", category: "text" });

module.exports = mongoose.model("Part", partSchema);
module.exports.PART_CATEGORIES = PART_CATEGORIES;

