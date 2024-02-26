const express = require("express");
const {
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getAllEnquiry,
  getEnquiry,
} = require("../controller/enquiryController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", protect, createEnquiry);
router.patch("/:id", protect, updateEnquiry);
router.delete("/:id", protect, deleteEnquiry);
router.get("/", getAllEnquiry);
router.get("/:id", getEnquiry);

module.exports = router;
