const express = require("express");
const {
  getMe,
  login,
  registerOwner
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register-owner", registerOwner);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;

