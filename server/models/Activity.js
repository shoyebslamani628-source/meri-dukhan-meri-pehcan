const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["part", "bill", "supplier", "auth"],
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    entityType: {
      type: String,
      trim: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    amount: {
      type: Number,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);

