const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateMongoDbid = require("../utils/validateMongoDBid");
const { sendEmail } = require("./emailController");
const crypto = require("crypto");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqId = require("uniqid");
const { ok } = require("assert");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Create user
const registerUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Email has already been registered");
    return;
  }

  // Create new user
  const user = await User.create(req.body);
  res.json(user);
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
    return;
  }

  // find User in DB
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User does not exist");
    return;
  }

  // Validate Password
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  const token = generateToken(user._id);
  if (user && passwordIsCorrect) {
    const newUser = await User.findOne({ email }).select("-password");
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      secure: true, // Only use with HTTPS
      sameSite: "None", // Allow cross-site cookies
    });

    res.status(201).json(newUser);
    return;
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

// Login Admin
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
    return;
  }

  // find User in DB
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User does not exist");
    return;
  }

  if (user.role !== "admin") {
    res.status(401);
    throw new Error("Not Authorised as an admin");
    return;
  }
  // User exists, check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  // Generate Token
  const token = generateToken(user._id);
  if (user && passwordIsCorrect) {
    const newUser = await User.findOne({ email }).select("-password");
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      secure: true,
      sameSite: "none",
    });

    // Send User data
    res.status(201).json(newUser);
    return;
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

// Get Login Status
const getLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.json(false);
    return;
  }

  // Verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    res.json(true);
    return;
  } else {
    res.json(false);
    return;
  }
});

// Logout User
const logOut = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ message: "Successfully Logged Out" });
});

// Update Password

const updatePassword = asyncHandler(async (req, res) => {
  //res.send("Password update");
  const { _id } = req.user;
  validateMongoDbid(_id);
  const { password } = req.body;
  validateMongoDbid(_id);
  //console.log(password);
  const user = await User.findById(_id);
  console.log(user);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.status(200);
    res.json({ Message: "Password Updated" });
  } else {
    res.status(400);
    throw new Error("Please Enter new Password");
  }
});

// Forgot Password Token

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not Found");
  } else {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hii, Please Follow this link to reset Your Password. This link is valid till 10 minute from now. <a href='http://localhost:3000/reset-password/${token}'>Click Here</ a>`;
    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      html: resetURL,
    };
    sendEmail(data);
    res.json({ token });
  }
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(404);
    throw new Error("Token Expired, Please try again later");
    return;
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.status(200);
  res.json({ message: "Password Updated" });
});

// get single User
const getUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbid(_id);
  const user = await User.find({ _id }).select("-password");
  if (user) {
    res.status(200);
    res.json(user);
    return;
  }

  // User Not Exist
  res.status(400);
  throw new Error("User does not exist");
});

// get All User
const getAllUser = asyncHandler(async (req, res) => {
  const allUser = await User.find({}).select(
    "_id email mobile firstName lastName"
  );
  res.status(200).json(allUser);
});

// update user
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbid(_id);
  const user = await User.findById(_id);
  if (user) {
    const { firstName, lastName, mobile, address } = req.body;
    user.firstName = firstName ? firstName : user.firstName;
    user.lastName = lastName ? lastName : user.lastName;
    user.mobile = mobile ? mobile : user.mobile;
    user.address = address ? address : user.address;
    const updatedUser = await user.save();
    res.status(200);
    res.json(updatedUser);
    return;
  }

  res.status(404);
  throw new Error("User not found");
});

// Update Photo
const updatePhoto = asyncHandler(async (req, res) => {
  const { photo } = req.body;
  validateMongoDbid(req.user._id);
  const user = await User.findById(req.user._id);
  user.photo = photo || user.photo;
  const updatedUser = await user.save();
  res.status(200).json({ updatedUser });
});

// Block user by admin
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbid(id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    res.status(200);
    res.json({ message: "User Blocked" });
  } catch (error) {
    res.status(404);
    throw new Error("User not found");
  }
});

// unBlock User By admin
const unBlockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbid(id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );
    res.status(200);
    res.json({ message: "User unBlocked" });
  } catch (error) {
    res.status(404);
    throw new Error("User not found");
  }
});

// Get All WishList

const getAllWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbid(_id);
  const user = await User.findById(_id).populate("wishlist");
  res.json(user);
});

const removeFromWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { id } = req.body;

  validateMongoDbid(_id);

  try {
    // Find the user and populate the wishlist
    const user = await User.findById(_id);

    // Filter out the item to be removed from the wishlist
    const wishList = await user.wishlist;

    const newWishList = wishList.filter((itemId) => itemId.toString() !== id);

    // res.status(200).json({ wishList, requestBody: id });

    // Update the user's wishlist in the database
    user.wishlist = newWishList;
    await user.save();

    // Respond with the updated user as JSON
    const updatedUser = await User.findById(_id).populate("wishlist");
    res.json(updatedUser);
  } catch (error) {
    // Handle any errors that may occur during the process
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// save Address

const saveAddress = asyncHandler(async (req, res) => {
  validateMongoDbid(req.user._id);
  const user = await User.findById(req.user._id);
  if (user) {
    const { address } = req.body;
    user.address = address ? address : user.address;
    const updatedUser = await user.save();
    res.status(200);
    res.json(updatedUser);
    return;
  }

  res.status(404);
  throw new Error("User not found");
});

// user Cart
const userCart = asyncHandler(async (req, res, next) => {
  const { productId, color, quantity, price } = req.body;
  const { _id } = req.user;
  validateMongoDbid(_id);
  try {
    const newCart = await new Cart({
      userId: _id,
      productId,
      quantity,
      price,
      color,
    }).save();
    res.status(200).json(newCart);
  } catch (error) {
    next(error);
  }

  // let products = [];
  // const user = req.user;
  // const alreadyExistCart = await Cart.findOne({ orderby: _id });
  // if (alreadyExistCart) {
  //   // update it later according to working of site
  //   // Use deleteOne to remove the found document
  //   await Cart.deleteOne({ orderby: _id });
  // }

  // let cartTotal = 0;
  // for (let i = 0; i < cart.length; i++) {
  //   let object = {};
  //   object.product = cart[i]._id;
  //   object.count = cart[i].count;
  //   object.color = cart[i].color;
  //   let getPrice = await Product.findById(cart[i]._id).select("price").exec();
  //   object.prize = getPrice.price;
  //   cartTotal += cart[i].count * getPrice.price;
  //   products.push(object);
  // }
});
const clearCart = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  validateMongoDbid(_id);
  try {
    const result = await Cart.deleteOne({ userId: _id });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Cart not found" });
    }

    res
      .status(200)
      .json({ status: "ok", message: "Cart cleared successfully" });
  } catch (error) {
    next(error);
  }
});

// update Cart Quantity
const updateCartQuantity = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { id, quantity } = req.body;

  validateMongoDbid(_id);

  // Find and update the cart item
  const updatedCartItem = await Cart.findOneAndUpdate(
    { userId: _id, productId: id },
    { quantity },
    { new: true, runValidators: true }
  ).populate("productId color");

  if (!updatedCartItem) {
    return res.status(404).json({
      message: `Product with id ${id} is not in your cart`,
    });
  }

  const cart = await Cart.find({ userId: _id }).populate("productId color");
  res.status(200).json(cart);
});

// Get User cart
const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbid(_id);
  const cart = await Cart.find({ userId: _id }).populate("productId color");
  res.status(200).json(cart);
});

// remove item from Cart
const removeItemFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;

  validateMongoDbid(_id);

  // // Find and delete the cart item
  const deletedCartItem = await Cart.findOneAndDelete({
    userId: _id,
    productId: id,
  });

  // res.json({ id, _id });
  // return;

  if (!deletedCartItem) {
    // If the item is not found in the cart, return an error response
    return res.status(404).json({
      message: `Product with id ${id} is not in your cart`,
    });
  }

  // Fetch the updated user cart after deletion
  const newUserCart = await Cart.find({ userId: _id }).populate(
    "productId color"
  );

  // Return the updated user cart as a response
  res.status(200).json(newUserCart);
});

// Apply Coupon
const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (!validCoupon) {
    res.status(404);
    throw new Error("Invalid Coupon");
    return;
  }

  const { cartTotal } = await Cart.findOne({ orderby: _id });
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: _id },
    {
      totalAfterDiscount,
    },
    { new: true, runValidators: true }
  );
  res.status(200).json({
    message: "Coupon Applied",
  });
});

// Create Order
const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingInfo,
    orderItems,
    totalPrice,
    totalPriceAfterDiscount,
    paymentInfo,
    deliveryDate,
  } = req.body;
  const { _id } = req.user;

  validateMongoDbid(_id);

  try {
    const newOrder = await Order.create({
      user: _id,
      shippingInfo,
      orderItems,
      totalPrice,
      totalPriceAfterDiscount,
      paymentInfo,
      deliveryDate,
    });

    res.status(200).json({ status: "ok", newOrder });
  } catch (error) {
    throw new Error(error);
  }
});

// Get Orders
const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbid(_id);
  const userOrders = await Order.find({ user: _id }).populate(
    "orderItems.product orderItems.color user"
  );
  res.status(200).json(userOrders);
});

// Get All Orders
const getAllOrders = asyncHandler(async (req, res) => {
  //const { _id } = req.user;
  //validateMongoDbid(_id);
  const userOrders = await Order.find({}).populate(
    "orderItems.product orderItems.color user"
  );
  res.status(200).json(userOrders);
});

// Get Orders
const getAOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;
  validateMongoDbid(_id);

  const OrderById = await Order.find({
    user: _id,
    _id: id,
  }).populate("user orderItems.product orderItems.color");

  res.status(200).json(OrderById);
});

// Update Order Status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  console.log(status, id);
  validateMongoDbid(id);
  const order = await Order.findByIdAndUpdate(
    id,
    {
      orderStatus: status,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  const orders = await Order.find().populate(
    "user orderItems.product orderItems.color"
  );
  res.status(200).json(orders);
});

const getMonthlyOrderIncomeAndCount = asyncHandler(async (req, res) => {
  let monthName = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let date = new Date();
  let endDate = "";
  date.setDate(1);
  for (let i = 0; i < 11; i++) {
    date.setMonth(date.getMonth() - 1);
    endDate = monthName[date.getMonth()] + " " + date.getFullYear();
  }
  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $lte: new Date(),
          $gte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: {
          month: "$month",
        },
        amount: {
          $sum: "$totalPriceAfterDiscount",
        },
        count: {
          $sum: 1,
        },
      },
    },
  ]);
  res.status(200).json(data);
});

const getYearlyOrderCount = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
        },
        count: {
          $sum: 1,
        },
        amount: {
          $sum: "$totalPriceAfterDiscount",
        },
      },
    },
    {
      $sort: { "_id.year": 1 },
    },
  ]);
  res.status(200).json(data);
});

module.exports = {
  registerUser,
  loginUser,
  getLoginStatus,
  logOut,
  getUser,
  getAllUser,
  updateUser,
  updatePhoto,
  blockUser,
  unBlockUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getAllWishlist,
  saveAddress,
  userCart,
  clearCart,
  getUserCart,
  applyCoupon,
  createOrder,
  getOrders,
  getAllOrders,
  getAOrder,
  updateOrderStatus,
  removeFromWishList,
  removeItemFromCart,
  updateCartQuantity,
  getMonthlyOrderIncomeAndCount,
  getYearlyOrderCount,
};
