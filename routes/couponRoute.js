const express = require("express");
const {
  createCoupon,
  getAllCoupon,
  updateCoupon,
  deleetCoupon,
  getACoupon,
} = require("../controller/couponController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", protect, adminOnly, createCoupon);
router.patch("/:id", protect, adminOnly, updateCoupon);
router.get("/", protect, adminOnly, getAllCoupon);
router.get("/:id", protect, adminOnly, getACoupon);
router.delete("/:id", protect, adminOnly, deleetCoupon);
module.exports = router;
