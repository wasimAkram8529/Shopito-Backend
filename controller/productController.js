const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const User = require("../models/userModel");
const mongoose = require("mongoose");

// Create Product
const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    sku,
    category,
    brand,
    quantity,
    description,
    image,
    regularPrice,
    price,
    color,
    tags,
  } = req.body;

  if (
    !title ||
    !category ||
    !brand ||
    !quantity ||
    !price ||
    !description ||
    !tags
  ) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  //Create Products
  const slug = slugify(title);
  const product = await Product.create({
    title,
    sku,
    slug,
    category,
    brand,
    quantity,
    description,
    image,
    regularPrice,
    price,
    color,
    tags,
  });

  res.status(201).json(product);
});

// Get All Products
const getProducts = asyncHandler(async (req, res) => {
  const {
    featured,
    company,
    name,
    sort,
    fields,
    numericFilters,
    tags,
    category,
  } = req.query;
  const queryObject = {};

  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }
  if (company) {
    queryObject.company = company;
  }
  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }
  if (tags) {
    queryObject.tags = tags;
  }
  if (category) {
    queryObject.category = category;
  }

  if (numericFilters) {
    const newNumericFilter = numericFilters.replace("&lt;", "<");
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    let filters = newNumericFilter.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field) && !queryObject[field]) {
        queryObject[field] = { [operator]: Number(value) };
      } else if (options.includes(field)) {
        queryObject[field][operator] = Number(value);
      }
    });
  }

  let result = Product.find(queryObject).populate("color");
  // sort
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort("createdAt");
  }

  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }
  // const page = Number(req.query.page) || 1;
  // const limit = Number(req.query.limit) || 10;
  // const skip = (page - 1) * limit;

  // result = result.skip(skip).limit(limit);
  // 23
  // 4 7 7 7 2

  const products = await result;
  res.status(200).json(products);
});

// Get Single Product
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("color");
  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  } else {
    res.status(200).json(product);
  }
});

//Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  } else {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product Deleted." });
  }
});

//Update Product
const updateProduct = asyncHandler(async (req, res) => {
  const {
    title,
    category,
    brand,
    quantity,
    description,
    image,
    regularPrice,
    price,
    color,
  } = req.body;

  let allColors;
  if (typeof color?.[0] === "object") {
    allColors = color.map((singleColor) => {
      return singleColor.value;
    });
  } else {
    allColors = color;
  }

  const product = await Product.findById({ _id: req.params.id });
  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  } else {
    const slug = title ? slugify(title) : product.slug;
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        { _id: req.params.id },
        {
          title,
          category,
          slug,
          brand,
          quantity,
          description,
          image,
          regularPrice,
          price,
          color: allColors,
        },
        { new: true, runValidators: true }
      );
      res.status(200).json(updatedProduct);
    } catch (error) {
      console.log(error);
    }
  }
});

// Add To Wishlist
const addToWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { id } = req.body;

  const user = await User.findById(_id);
  const alreadyAdded = await user.wishlist.includes(id);

  if (alreadyAdded) {
    res.status(400);
    throw new Error("This Product is Already Exist in WishList");
    return;
  }

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      $push: { wishlist: id },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200);
  res.json(updatedUser);
});

// Review product
const reviewProduct = asyncHandler(async (req, res) => {
  const { star, review, reviewDate, userId } = req.body;
  const { id } = req.params;

  // Validation
  if (star < 1) {
    res.status(400);
    throw new Error("Please add a star and review");
  }

  let product = await Product.findById({ _id: id });

  if (!product) {
    res.status(400);
    throw new Error("Product not found");
  }

  let alreadyReviewed;

  const { ratings } = product;

  for (let i = 0; i < ratings.length; i++) {
    if (ratings[i].userId.toString() === userId) {
      alreadyReviewed = true;
      break;
    }
  }

  if (alreadyReviewed) {
    res.status(200).json({
      product,
      message: "You've already submitted a review for this product",
    });
  } else {
    product.ratings.push({
      star,
      review,
      reviewDate,
      name: req.user.firstName + " " + req.user.lastName,
      userId: req.user._id,
    });

    product = await product.save();

    const totalRating = product.ratings.length;
    let ratingSum = product.ratings
      .map((item) => item.star)
      .reduce(
        (prevValue, currentValue) => prevValue + parseInt(currentValue),
        0
      );

    let actualRating = Math.round(ratingSum / totalRating);
    product = await Product.findByIdAndUpdate(
      id,
      { totalRating: actualRating },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      message: "Thank you for your review! Your feedback is valuable to us.",
      product,
    });
  }
});

// // Delete Review
const deleteReview = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const { ratings } = product;
    const newRatings = ratings.filter(
      (rating) => rating.userId.toString() !== userId
    );

    product.ratings = newRatings;
    product = await product.save();

    res.status(200).json({ product, message: "Product rating deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update Product review
const updateReview = asyncHandler(async (req, res) => {
  const { star, review, reviewDate, userId } = req.body;
  const { id } = req.params;

  // Validation
  if (star < 1) {
    res.status(400);
    throw new Error("Please add a star and review");
  }

  const product = await Product.findById(id);

  if (!product) {
    res.status(400);
    throw new Error("Product not found");
    return;
  }

  // Match user to update review
  if (req.user._id.toString() !== userId) {
    res.status(401);
    throw new Error("User not authorized");
    return;
  }

  // Update product Review
  let reviewMatched = false;
  const newRating = product?.ratings.map((item) => {
    if (item?.userId?.toString() === userId) {
      reviewMatched = true;
      item.star = star;
      item.review = review;
      item.reviewDate = reviewDate;
    }
    return item;
  });
  product.ratings = newRating;
  const updatedReview = await product.save();

  if (reviewMatched) {
    res.status(200).json({ updatedReview, message: "Product review updated" });
  } else {
    res.status(400).json({ message: "Product review not updated" });
  }
});

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  addToWishList,
  reviewProduct,
  updateReview,
  deleteReview,
};
