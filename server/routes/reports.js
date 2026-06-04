const express = require("express");
const {
  getDashboard,
  getReports
} = require("../controllers/reportsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/dashboard", getDashboard);
router.get("/all", getReports);

module.exports = router;

