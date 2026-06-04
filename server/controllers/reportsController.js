const Activity = require("../models/Activity");
const Bill = require("../models/Bill");
const Part = require("../models/Part");
const Supplier = require("../models/Supplier");

const getDayRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const getMonthlyIncome = async () => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 11);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  return Bill.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        income: { $sum: "$total" },
        bills: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        month: "$_id",
        income: { $round: ["$income", 2] },
        bills: 1
      }
    }
  ]);
};

const getTopSellingParts = async () =>
  Bill.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.nameSnapshot",
        quantitySold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.lineTotal" }
      }
    },
    { $sort: { quantitySold: -1, revenue: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        name: "$_id",
        quantitySold: 1,
        revenue: { $round: ["$revenue", 2] }
      }
    }
  ]);

const getLowStockParts = async () =>
  Part.find({
    $expr: { $lte: ["$quantity", "$min_stock_level"] }
  })
    .populate("supplier", "name phone")
    .sort({ quantity: 1, name: 1 });

const getSupplierSummary = async () => {
  const suppliers = await Supplier.find().sort({ name: 1 }).lean();
  const partSummary = await Part.aggregate([
    {
      $match: {
        supplier: { $ne: null }
      }
    },
    {
      $group: {
        _id: "$supplier",
        partsLinked: { $sum: 1 },
        totalQuantity: { $sum: "$quantity" },
        stockValue: { $sum: { $multiply: ["$quantity", "$price"] } }
      }
    }
  ]);

  const summaryMap = new Map(
    partSummary.map((summary) => [String(summary._id), summary])
  );

  return suppliers.map((supplier) => {
    const summary = summaryMap.get(String(supplier._id)) || {};
    return {
      _id: supplier._id,
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      paymentDue: supplier.paymentDue || 0,
      partsLinked: summary.partsLinked || 0,
      totalQuantity: summary.totalQuantity || 0,
      stockValue: Math.round((summary.stockValue || 0) * 100) / 100
    };
  });
};

const getDashboard = async (req, res) => {
  try {
    const { start, end } = getDayRange();
    const [partValueSummary] = await Part.aggregate([
      {
        $group: {
          _id: null,
          totalPartsCount: { $sum: "$quantity" },
          distinctPartCount: { $sum: 1 },
          totalInventoryValue: { $sum: { $multiply: ["$quantity", "$price"] } }
        }
      }
    ]);

    const lowStockAlertsCount = await Part.countDocuments({
      $expr: { $lte: ["$quantity", "$min_stock_level"] }
    });

    const [todayBilling] = await Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          billCount: { $sum: 1 }
        }
      }
    ]);

    const recentActivity = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    return res.json({
      totalPartsCount: partValueSummary?.totalPartsCount || 0,
      distinctPartCount: partValueSummary?.distinctPartCount || 0,
      totalInventoryValue:
        Math.round((partValueSummary?.totalInventoryValue || 0) * 100) / 100,
      lowStockAlertsCount,
      todayBillingTotal: Math.round((todayBilling?.total || 0) * 100) / 100,
      todayBillCount: todayBilling?.billCount || 0,
      recentActivity
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const [monthlyIncome, topSellingParts, lowStockParts, supplierSummary] =
      await Promise.all([
        getMonthlyIncome(),
        getTopSellingParts(),
        getLowStockParts(),
        getSupplierSummary()
      ]);

    return res.json({
      monthlyIncome,
      topSellingParts,
      lowStockParts,
      supplierSummary
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboard,
  getReports,
  getMonthlyIncome,
  getTopSellingParts,
  getLowStockParts,
  getSupplierSummary
};

