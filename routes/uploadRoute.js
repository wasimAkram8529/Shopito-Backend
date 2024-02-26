const express = require("express");
const {
  uploadProductImages,
  deleteProductImages,
} = require("../controller/uploadController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  uploadPhoto,
  productImgResize,
} = require("../middlewares/uploadImages");
const router = express.Router();

router.post(
  "/upload-productImg",
  protect,
  uploadPhoto.array("images", 20),
  productImgResize,
  uploadProductImages
);
router.delete("/delete-Img/:id", protect, adminOnly, deleteProductImages);

module.exports = router;
