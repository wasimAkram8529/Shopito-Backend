const express = require("express");
const {
  createColor,
  updateColor,
  deleteColor,
  getAllColor,
  getColor,
} = require("../controller/colorController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", protect, adminOnly, createColor);
router.patch("/:id", protect, adminOnly, updateColor);
router.delete("/:id", protect, adminOnly, deleteColor);
router.get("/", getAllColor);
router.get("/:id", getColor);

module.exports = router;
