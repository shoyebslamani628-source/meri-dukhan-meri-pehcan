const express = require("express");
const {
  createPart,
  deletePart,
  getPartById,
  getParts,
  updatePart
} = require("../controllers/partsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").get(getParts).post(createPart);
router.route("/:id").get(getPartById).put(updatePart).delete(deletePart);

module.exports = router;

