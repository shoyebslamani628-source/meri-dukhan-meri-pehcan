const express = require("express");
const {
  createBill,
  getBillById,
  getBills
} = require("../controllers/billsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").get(getBills).post(createBill);
router.route("/:id").get(getBillById);

module.exports = router;

