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
  /*let queryObject1 = { ...req.query };
  const excludeQuery = ["page", "sort", "limit", "fields"];
  excludeQuery.forEach((query) => delete queryObject1[query]);
  console.log(queryObject1);
  const { numericFilters } = queryObject1;

  const queryObject = { ...queryObject1 };
  if (numericFilters) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
    delete queryObject["numericFilters"];
  }

  console.log(queryObject);
  const products = await Product.find(queryObject).sort("-createdAt");
  res.status(200).json(products);*/
  const { featured, company, name, sort, fields, numericFilters, tags } =
    req.query;
  const queryObject = {};
  //console.log(numericFilters);
  console.log(tags);

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
  if (numericFilters) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    //console.log(filters);
    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field) && !queryObject[field]) {
        queryObject[field] = { [operator]: Number(value) };
      } else if (options.includes(field)) {
        queryObject[field][operator] = Number(value);
      }
      //console.log(queryObject[field][operator]);
    });
    // console.log(queryObject);
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
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  } else {
    const slug = title ? slugify(title) : product.slug;
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
        color,
      },
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedProduct);
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
  //console.log(userId);

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
      { totalrating: actualRating },
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

  //console.log()
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
    //console.log(product);

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

  //console.log(product.ratings);
  // Update product Review
  const newRating = product?.ratings.map((item) => {
    if (item?.userId?.toString() === userId) {
      item.star = star;
      item.review = review;
      item.reviewDate = reviewDate;
    }
    return item;
  });
  product.ratings = newRating;
  const updatedReview = await product.save();
  // const updatedReview = await Product.findOneAndUpdate(
  //   {
  //     _id: product._id,
  //     "ratings.userId": userId,
  //   },
  //   {
  //     $set: {
  //       "ratings.$.star": star,
  //       "ratings.$.review": review,
  //       "ratings.$.reviewDate": reviewDate,
  //     },
  //   }
  // );

  if (updatedReview) {
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
