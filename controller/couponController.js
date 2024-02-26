const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbid = require("../utils/validateMongoDBid");

// Create Coupon
const createCoupon = asyncHandler(async (req, res) => {
  const newCoupon = await Coupon.create(req.body);
  res.status(200).json(newCoupon);
});

// Get All Coupon
const getAllCoupon = asyncHandler(async (req, res) => {
  const allCoupon = await Coupon.find({});
  res.status(200).json(allCoupon);
});

const getACoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbid(id);
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    res.status(404);
    throw new Error(`Coupon does exist of id ${id} `);
    return;
  }
  res.status(200);
  res.json(coupon);
});

// Update Coupon
const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbid(id);
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    res.status(400);
    throw new Error(`Coupon not Found of id ${id}`);
    return;
  }
  const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200);
  res.json(updatedCoupon);
});

// Delete Coupon
const deleetCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbid(id);
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    res.status(400);
    throw new Error("Coupon does not exist");
    return;
  }
  await Coupon.findByIdAndDelete(id);
  res.status(200).json({ message: `Coupon Deleted with id ${id}` });
});

module.exports = {
  createCoupon,
  getAllCoupon,
  getACoupon,
  updateCoupon,
  deleetCoupon,
};
