const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
let blogCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("blogCategory", blogCategorySchema);
