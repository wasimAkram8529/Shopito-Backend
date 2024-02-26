const express = require("express");
const {
  createBrand,
  updateBrand,
  deleteBrand,
  getAllBrand,
  getBrand,
} = require("../controller/brandController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", protect, adminOnly, createBrand);
router.patch("/update-brand/:id", protect, adminOnly, updateBrand);
router.delete("/delete-brand/:id", protect, adminOnly, deleteBrand);
router.get("/", getAllBrand);
router.get("/:id", getBrand);

module.exports = router;
