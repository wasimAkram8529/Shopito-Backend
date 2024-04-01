const mongoose = require("mongoose");

const connectDB = async (URL) => {
  return mongoose.connect(URL, {
    maxIdleTimeMS: 60000,
  });
};

module.exports = connectDB;
