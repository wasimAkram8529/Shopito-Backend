const express = require("express");
const {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlog,
  deleteBlog,
  likeBlog,
  disLikeBlog,
  uploadBlogImages,
} = require("../controller/blogController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  uploadPhoto,
  productImgResize,
  blogImgResize,
} = require("../middlewares/uploadImages");
const router = express.Router();

router.post("/", protect, adminOnly, createBlog);
router.get("/", getAllBlog);
router.get("/:id", getBlog);
router.patch("/:id", protect, adminOnly, updateBlog);
router.patch(
  "/upload-blogImg/:id",
  protect,
  adminOnly,
  uploadPhoto.array("images", 20),
  blogImgResize,
  uploadBlogImages
);
router.patch("/likes/post", protect, likeBlog);
router.patch("/dislikes/post", protect, disLikeBlog);
router.delete("/:id", protect, adminOnly, deleteBlog);

module.exports = router;
