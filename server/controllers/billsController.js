const Activity = require("../models/Activity");
const Bill = require("../models/Bill");
const Part = require("../models/Part");

const GST_RATE = 0.18;

const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;

const getDayRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const generateInvoiceNumber = async () => {
  const { start, end } = getDayRange();
  const countToday = await Bill.countDocuments({
    createdAt: { $gte: start, $lt: end }
  });
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `INV-${datePart}-${String(countToday + 1).padStart(3, "0")}`;
};

const getBills = async (req, res) => {
  try {
    const { search, dateFrom, dateTo } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { vehicleNumber: { $regex: search, $options: "i" } }
      ];
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const bills = await Bill.find(filter)
      .populate("items.part", "name category quantity price")
      .sort({ createdAt: -1 });

    return res.json(bills);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate(
      "items.part",
      "name category quantity price"
    );

    if (!bill) {
      return res.status(404).json({ message: "Bill not found." });
    }

    return res.json(bill);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createBill = async (req, res) => {
  try {
    const {
      customerName,
      vehicleNumber,
      items = [],
      labourCharges = 0,
      paymentStatus = "Paid"
    } = req.body;

    if (!customerName || !vehicleNumber) {
      return res
        .status(400)
        .json({ message: "Customer name and vehicle number are required." });
    }

    if (!items.length && Number(labourCharges) <= 0) {
      return res.status(400).json({
        message: "Add at least one part or labour charge to create a bill."
      });
    }

    const normalizedItems = items.map((item) => ({
      partId: item.partId || item.part,
      quantity: Number(item.quantity)
    }));

    const invalidItem = normalizedItems.find(
      (item) => !item.partId || !Number.isInteger(item.quantity) || item.quantity < 1
    );

    if (invalidItem) {
      return res.status(400).json({
        message: "Each selected part must include a valid quantity."
      });
    }

    const partIds = [...new Set(normalizedItems.map((item) => String(item.partId)))];
    const parts = await Part.find({ _id: { $in: partIds } });
    const partMap = new Map(parts.map((part) => [String(part._id), part]));

    const billItems = [];

    for (const item of normalizedItems) {
      const part = partMap.get(String(item.partId));

      if (!part) {
        return res.status(404).json({ message: "Selected part not found." });
      }

      if (part.quantity < item.quantity) {
        return res.status(400).json({
          message: `${part.name} has only ${part.quantity} item(s) in stock.`
        });
      }

      const lineTotal = roundMoney(part.price * item.quantity);
      billItems.push({
        part: part._id,
        nameSnapshot: part.name,
        categorySnapshot: part.category,
        quantity: item.quantity,
        unitPrice: part.price,
        lineTotal
      });
    }

    for (const item of normalizedItems) {
      const part = partMap.get(String(item.partId));
      part.quantity -= item.quantity;
      await part.save();
    }

    const partsTotal = billItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const subtotal = roundMoney(partsTotal + Number(labourCharges));
    const gstAmount = roundMoney(subtotal * GST_RATE);
    const total = roundMoney(subtotal + gstAmount);

    const bill = await Bill.create({
      invoiceNumber: await generateInvoiceNumber(),
      customerName,
      vehicleNumber,
      items: billItems,
      labourCharges: roundMoney(labourCharges),
      subtotal,
      gstRate: GST_RATE,
      gstAmount,
      total,
      paymentStatus,
      createdBy: req.user._id
    });

    await bill.populate("items.part", "name category quantity price");

    await Activity.create({
      type: "bill",
      message: `Created bill ${bill.invoiceNumber} for ${bill.customerName}`,
      entityType: "Bill",
      entityId: bill._id,
      amount: bill.total
    });

    return res.status(201).json(bill);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getBills,
  getBillById,
  createBill
};

