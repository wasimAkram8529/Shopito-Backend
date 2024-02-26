const Razorpay = require("razorpay");

const instance = new Razorpay({
  key_id: "rzp_test_WSxAAGxZXsLTOQ",
  key_secret: "sTPsS8A8M9HBy7g4ZpUOLJfe",
});

const checkout = async (req, res) => {
  const { amount } = req.body;
  const option = {
    amount: amount * 100,
    currency: "INR",
  };

  const order = await instance.orders.create(option);
  res.status(200).json({ order, success: true });
};
const paymentVerification = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId } = req.body;

  res.status(200).json({
    razorpayOrderId,
    razorpayPaymentId,
  });
};

module.exports = {
  checkout,
  paymentVerification,
};
