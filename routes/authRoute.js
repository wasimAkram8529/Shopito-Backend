const express = require("express");
const {
  registerUser,
  loginUser,
  getUser,
  updateUser,
  logOut,
  updatePhoto,
  blockUser,
  unBlockUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getAllUser,
  getAllWishlist,
  saveAddress,
  userCart,
  getUserCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
  getLoginStatus,
  getAOrder,
  removeFromWishList,
  removeItemFromCart,
  updateCartQuantity,
  getAllOrders,
  getMonthlyOrderIncomeAndCount,
  getYearlyOrderCount,
  clearCart,
} = require("../controller/userController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { addToWishList } = require("../controller/productController");
const {
  checkout,
  paymentVerification,
} = require("../controller/paymentController");
const router = express.Router();

// Create User
router.post("/register", registerUser);
router.post("/wishlist", protect, addToWishList);

// Login User
router.post("/login", loginUser);

// Login Admin
router.post("/admin-login", loginAdmin);

// Cart
router.post("/cart", protect, userCart);
router.post("/cart/apply-coupon", protect, applyCoupon);
router.post("/create-order", protect, createOrder);

// CheckOut
router.post("/order/checkout", protect, checkout);
router.post("/order/paymentVerification", protect, paymentVerification);

// get info related to orders
router.get(
  "/orders/getMonthlyOrderIncomeAndCount",
  protect,
  adminOnly,
  getMonthlyOrderIncomeAndCount
);
router.get(
  "/orders/getYearlyOrderCount",
  protect,
  adminOnly,
  getYearlyOrderCount
);
// Logout
router.get("/logout", logOut);

// Get Login Status
router.get("/getLoginStatus", getLoginStatus);

// Get All user
router.get("/all-users", protect, adminOnly, getAllUser);

// Get WishList
router.get("/wishlist", protect, getAllWishlist);

// update WishList
router.patch("/remove", protect, removeFromWishList);

// Get Cart
router.get("/cart", protect, getUserCart);
router.get("/get-orders", protect, getOrders);
router.get("/get-all-orders", protect, adminOnly, getAllOrders);

// Get A Order
router.get("/order/:id", protect, getAOrder);

// Get A user
router.get("/get-user", protect, getUser);

// Save
router.patch("/save-address", protect, saveAddress);

// Update password
router.patch("/update-password", protect, updatePassword);

// Forgot Password
router.patch("/forgot-password-token", forgotPasswordToken);

// Reset Password
router.patch("/reset-password/:token", resetPassword);

// Update User
router.patch("/update-user", protect, updateUser);

// Update CArt Quantity
router.patch("/cart", protect, updateCartQuantity);

// Update User Photo
router.patch("/update-user-photo", protect, updatePhoto);
router.patch("/order/update-order/:id", protect, adminOnly, updateOrderStatus);

// Block and unBlock User
router.post("/block-user/:id", protect, adminOnly, blockUser);
router.post("/unblock-user/:id", protect, adminOnly, unBlockUser);

// Delete One Item From cart
router.delete("/cart/remove-item/:id", protect, removeItemFromCart);
router.delete("/cart/clearCart", protect, clearCart);

module.exports = router;
