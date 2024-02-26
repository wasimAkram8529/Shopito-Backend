const mongoose = require("mongoose");

const connectDB = async (URL) => {
  return mongoose.connect(URL);
};

module.exports = connectDB;
