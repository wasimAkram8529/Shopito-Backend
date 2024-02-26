const productCategory = require("../models/productCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbid = require("../utils/validateMongoDBid");

// Create Category
const createCategory = asyncHandler(async (req, res) => {
  const newCategory = await productCategory.create(req.body);
  res.status(200);
  res.json(newCategory);
});

// Update Category
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await productCategory.findById(id);
  if (!category) {
    res.status(400);
    throw new Error(`Category not Found of id ${id}`);
    return;
  }
  const updatedCategory = await productCategory.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200);
  res.json(updatedCategory);
});

// Delete Category
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await productCategory.findById(id);
  if (!category) {
    res.status(400);
    throw new Error(`Category not Found of id ${id}`);
    return;
  }
  await productCategory.findByIdAndDelete(id);
  res.status(200);
  res.json({ message: `Product Category of id ${id} Deleted ` });
});

// Get A  Category
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const category = await productCategory.findById(id);
    if (!category) {
      res.status(400);
      throw new Error(`Category not Found of id ${id}`);
      return;
    }
    res.status(200);
    res.json(category);
  } catch (error) {
    next(error);
  }
});

// Get All Category
const getAllCategory = asyncHandler(async (req, res) => {
  const category = await productCategory.find({}).sort("-createdAt");
  res.status(200);
  res.json(category);
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategory,
  getCategory,
};
