const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbid = require("../utils/validateMongoDBid");

// Create Brand
const createBrand = asyncHandler(async (req, res) => {
  const newCategory = await Brand.create(req.body);
  res.status(200);
  res.json(newCategory);
});

// Update Brand
const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const brand = await Brand.findById(id);
  if (!brand) {
    res.status(400);
    throw new Error(`Brand not Found of id ${id}`);
    return;
  }
  const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200);
  res.json(updatedBrand);
});

// Delete Brand
const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const brand = await Brand.findById(id);
  if (!brand) {
    res.status(400);
    throw new Error(`Brand not Found of id ${id}`);
    return;
  }
  await Brand.findByIdAndDelete(id);
  res.status(200);
  res.json({ message: `Brand of id ${id} Deleted ` });
});

// Get A Brand
const getBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const brand = await Brand.findById(id);
  if (!brand) {
    res.status(400);
    throw new Error(`Brand not Found of id ${id}`);
    return;
  }
  res.status(200);
  res.json(brand);
});

// Get All Brand
const getAllBrand = asyncHandler(async (req, res) => {
  try {
    const brand = await Brand.find({}).sort("-createdAt");
    res.status(200);
    res.json(brand);
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getAllBrand,
  getBrand,
};
