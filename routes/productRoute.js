const express = require("express");
const {
  createProduct,
  getProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  reviewProduct,
  updateReview,
  deleteReview,
} = require("../controller/productController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const router = express.Router();

// Post Methods
router.post("/", protect, adminOnly, createProduct);
router.post("/reviewProduct/:id", protect, reviewProduct);

// Get Methods
router.get("/", getProducts);
router.get("/:id", getProduct);

// Delete Methods
router.patch("/deleteReview/:id", protect, deleteReview);
router.delete("/:id", protect, adminOnly, deleteProduct);

// Patch Methods
router.patch("/updateReview/:id", protect, updateReview);
router.patch("/:id", protect, adminOnly, updateProduct);

module.exports = router;
