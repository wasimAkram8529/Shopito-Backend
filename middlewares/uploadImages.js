const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// To store the image to specific location in disk
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffiex = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffiex + ".jpeg");
  },
});

// to filter the images with other files
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      {
        message: "Unsupported file format",
      },
      false
    );
  }
};

const uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fieldSize: 2000000 },
});

// Product Image Resize
const productImgResize = async (req, res, next) => {
  if (!req.files) {
    return next();
  } else {
    await Promise.all(
      req.files.map(async (file) => {
        await sharp(file.path)
          // .resize(300, 300)
          .toFormat("jpeg")
          .jpeg({ quality: 90 });
        // .toFile(`public/images/products/${file.filename}`);
        // fs.unlinkSync(`public/images/products/${file.filename}`);
      })
    );
    next();
  }
};

// Blog Image Resize
const blogImgResize = async (req, res, next) => {
  if (!req.files) {
    return next();
  } else {
    await Promise.all(
      req.files.map(async (file) => {
        await sharp(file.path)
          .resize(300, 300)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`public/images/blogs/${file.filename}`);
        fs.unlinkSync(`public/images/blogs/${file.filename}`);
      })
    );
    next();
  }
};

module.exports = {
  uploadPhoto,
  productImgResize,
  blogImgResize,
};
