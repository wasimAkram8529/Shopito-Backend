const Enquiry = require("../models/enquiryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbid = require("../utils/validateMongoDBid");

// Create Enquiry
const createEnquiry = asyncHandler(async (req, res) => {
  const newCategory = await Enquiry.create(req.body);
  res.status(200);
  res.json(newCategory);
});

// Update Enquiry
const updateEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbid(id);
  const enquiry = await Enquiry.findById(id);
  if (!enquiry) {
    res.status(400);
    throw new Error(`Enquiry not Found of id ${id}`);
    return;
  }
  const updatedEnquiry = await Enquiry.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200);
  res.json(updatedEnquiry);
});

// Delete Enquiry
const deleteEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbid(id);
  const enquiry = await Enquiry.findById(id);
  if (!enquiry) {
    res.status(400);
    throw new Error(`Enquiry not Found of id ${id}`);
    return;
  }
  await Enquiry.findByIdAndDelete(id);
  res.status(200);
  res.json({ message: `Enquiry of id ${id} Deleted ` });
});

// Get A Enquiry
const getEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbid(id);
  const enquiry = await Enquiry.findById(id);
  if (!enquiry) {
    res.status(400);
    throw new Error(`Enquiry not Found of id ${id}`);
    return;
  }
  res.status(200);
  res.json(enquiry);
});

// Get All Enquiry
const getAllEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.find({}).sort("-createdAt");
  res.status(200);
  res.json(enquiry);
});

module.exports = {
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getAllEnquiry,
  getEnquiry,
};
