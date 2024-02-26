const asyncHandler = require("express-async-handler");
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary");
const fs = require("fs");

// Upload Product Images
const uploadProductImages = asyncHandler(async (req, res, next) => {
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;

    // Uploading images to Cloudinary and collecting URLs
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath); // Assuming newPath is an object with a 'url' property
      fs.unlinkSync(path);
    }

    const image = urls;
    res.status(200).json(image);
  } catch (error) {
    next(error);
  }
});

// Delete Product Images
const deleteProductImages = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const deleteImg = await cloudinaryDeleteImg(id, "images");
    res.status(200).json({ id, message: "Image Deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  uploadProductImages,
  deleteProductImages,
};
