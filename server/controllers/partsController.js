const Activity = require("../models/Activity");
const Part = require("../models/Part");
const Supplier = require("../models/Supplier");

const buildPartFilter = ({ search, category, stockStatus, supplier }) => {
  const filter = {};
  const andConditions = [];

  if (search) {
    andConditions.push({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ]
    });
  }

  if (category && category !== "All") {
    filter.category = category;
  }

  if (supplier) {
    filter.supplier = supplier;
  }

  if (stockStatus === "low") {
    andConditions.push({
      quantity: { $gt: 0 },
      $expr: { $lte: ["$quantity", "$min_stock_level"] }
    });
  }

  if (stockStatus === "out") {
    filter.quantity = 0;
  }

  if (stockStatus === "available") {
    andConditions.push({
      $expr: { $gt: ["$quantity", "$min_stock_level"] }
    });
  }

  if (andConditions.length) {
    filter.$and = andConditions;
  }

  return filter;
};

const getParts = async (req, res) => {
  try {
    const filter = buildPartFilter(req.query);
    const parts = await Part.find(filter)
      .populate("supplier", "name phone paymentDue")
      .sort({ updatedAt: -1 });

    return res.json(parts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPartById = async (req, res) => {
  try {
    const part = await Part.findById(req.params.id).populate(
      "supplier",
      "name phone email paymentDue"
    );

    if (!part) {
      return res.status(404).json({ message: "Part not found." });
    }

    return res.json(part);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createPart = async (req, res) => {
  try {
    if (req.body.supplier) {
      const supplier = await Supplier.findById(req.body.supplier);
      if (!supplier) {
        return res.status(400).json({ message: "Selected supplier not found." });
      }
    }

    const part = await Part.create(req.body);
    await part.populate("supplier", "name phone paymentDue");

    await Activity.create({
      type: "part",
      message: `Added part ${part.name}`,
      entityType: "Part",
      entityId: part._id,
      amount: part.quantity * part.price
    });

    return res.status(201).json(part);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updatePart = async (req, res) => {
  try {
    if (req.body.supplier) {
      const supplier = await Supplier.findById(req.body.supplier);
      if (!supplier) {
        return res.status(400).json({ message: "Selected supplier not found." });
      }
    }

    const part = await Part.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate("supplier", "name phone paymentDue");

    if (!part) {
      return res.status(404).json({ message: "Part not found." });
    }

    await Activity.create({
      type: "part",
      message: `Updated part ${part.name}`,
      entityType: "Part",
      entityId: part._id,
      amount: part.quantity * part.price
    });

    return res.json(part);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deletePart = async (req, res) => {
  try {
    const part = await Part.findByIdAndDelete(req.params.id);

    if (!part) {
      return res.status(404).json({ message: "Part not found." });
    }

    await Activity.create({
      type: "part",
      message: `Deleted part ${part.name}`,
      entityType: "Part",
      entityId: part._id
    });

    return res.json({ message: "Part deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getParts,
  getPartById,
  createPart,
  updatePart,
  deletePart
};

