const Color = require("../models/colorModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbid = require("../utils/validateMongoDBid");

// Create color
const createColor = asyncHandler(async (req, res) => {
  const newCategory = await Color.create(req.body);
  res.status(200);
  res.json(newCategory);
});

// Update color
const updateColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbid(id);
  const color = await Color.findById(id);
  if (!color) {
    res.status(400);
    throw new Error(`color not Found of id ${id}`);
    return;
  }
  const updatedColor = await Color.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200);
  res.json(updatedColor);
});

// Delete color
const deleteColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbid(id);
  const color = await Color.findById(id);
  if (!color) {
    res.status(400);
    throw new Error(`color not Found of id ${id}`);
    return;
  }
  await Color.findByIdAndDelete(id);
  res.status(200);
  res.json({ message: `color of id ${id} Deleted ` });
});

// Get A color
const getColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbid(id);
  const color = await Color.findById(id);
  if (!color) {
    res.status(400);
    throw new Error(`color not Found of id ${id}`);
    return;
  }
  res.status(200);
  res.json(color);
});

// Get All color
const getAllColor = asyncHandler(async (req, res) => {
  try {
    const color = await Color.find({}).sort("-createdAt");
    res.status(200);
    res.json(color);
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createColor,
  updateColor,
  deleteColor,
  getAllColor,
  getColor,
};
