const Activity = require("../models/Activity");
const Part = require("../models/Part");
const Supplier = require("../models/Supplier");

const getSuppliers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const suppliers = await Supplier.find(filter).sort({ updatedAt: -1 });
    return res.json(suppliers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found." });
    }

    const parts = await Part.find({ supplier: supplier._id }).sort({ name: 1 });

    return res.json({ supplier, parts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);

    await Activity.create({
      type: "supplier",
      message: `Added supplier ${supplier.name}`,
      entityType: "Supplier",
      entityId: supplier._id,
      amount: supplier.paymentDue
    });

    return res.status(201).json(supplier);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found." });
    }

    await Activity.create({
      type: "supplier",
      message: `Updated supplier ${supplier.name}`,
      entityType: "Supplier",
      entityId: supplier._id,
      amount: supplier.paymentDue
    });

    return res.json(supplier);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found." });
    }

    await Part.updateMany(
      { supplier: supplier._id },
      { $unset: { supplier: "" } }
    );

    await Activity.create({
      type: "supplier",
      message: `Deleted supplier ${supplier.name}`,
      entityType: "Supplier",
      entityId: supplier._id
    });

    return res.json({ message: "Supplier deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};

