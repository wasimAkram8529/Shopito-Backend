const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDBid = require("../utils/validateMongoDBid");
const { cloudinaryUploadImg } = require("../utils/cloudinary");
const fs = require("fs");

// Create Blog

const createBlog = asyncHandler(async (req, res) => {
  const newBlog = await Blog.create(req.body);
  res.status(200);
  res.json(newBlog);
});

// Update Blog
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBid(id);
  const isblogExist = await Blog.findById(id);
  if (!isblogExist) {
    res.status(404);
    throw new Error(`Blog does exist of id ${id} `);
    return;
  }
  const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200);
  res.json(updatedBlog);
});

// Get All Blog
const getAllBlog = asyncHandler(async (req, res) => {
  const { sort, tags, category } = req.query;
  //console.log(category);
  let queyObject = {};

  if (category) {
    queyObject.category = category;
  }

  if (tags) {
    queyObject.tags = tags;
  }

  //console.log(queyObject);

  const blog = await Blog.find(queyObject);

  // if (sort) {
  //   const sortList = sort.split(",").join(" ");
  //   let result = await blog.sort(sortList);
  //   console.log(result);
  // }
  res.status(200);
  res.json(blog);
});

// Delete Blog
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBid(id);
  const blog = await Blog.findById(id);
  if (!blog) {
    res.status(404);
    throw new Error(`Blog does exist of id ${id} `);
    return;
  }
  await Blog.findByIdAndDelete(id);
  res.status(200);
  res.json({ message: "Blog Deleted" });
});

// Get A Blog
const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBid(id);
  const blog = await Blog.findById(id);
  blog.numViews = blog.numViews + 1;
  await blog.save();
  if (!blog) {
    res.status(404);
    throw new Error(`Blog does exist of id ${id} `);
    return;
  }
  res.status(200);
  res.json(blog);
});

// Like Blog

const likeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoDBid(blogId);

  const blog = await Blog.findById(blogId);
  if (!blog) {
    res.status(404);
    throw new Error(`Blog Does not exist of id ${blogId} `);
    return;
  }
  const loginUserId = req.user._id;

  const isLiked = blog.isLiked;

  const alreadyDisliked = blog.dislikes.find(
    (userId) => userId?.toString() === loginUserId.toString()
  );

  if (alreadyDisliked) {
    const newBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json(newBlog);
  }

  if (isLiked) {
    const newBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json(newBlog);
  } else {
    const newBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json(newBlog);
  }
});

// Dislike The Blog
const disLikeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoDBid(blogId);

  const blog = await Blog.findById(blogId);
  if (!blog) {
    res.status(404);
    throw new Error(`Blog Does not exist of id ${blogId} `);
    return;
  }
  const loginUserId = req.user._id;

  const isDisliked = blog.isDisliked;

  const alreadyLiked = blog.likes.find(
    (userId) => userId?.toString() === loginUserId.toString()
  );

  if (alreadyLiked) {
    const newBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json(newBlog);
  }

  if (isDisliked) {
    const newBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json(newBlog);
  } else {
    const newBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { dislikes: loginUserId },
        isDisliked: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json(newBlog);
  }
});

// Upload Blog Images
const uploadBlogImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBid(id);
  const uploader = (path) => cloudinaryUploadImg(path, "images");
  const urls = [];
  const files = req.files;

  // Uploading images to Cloudinary and collecting URLs
  for (const file of files) {
    const { path } = file;
    const newPath = await uploader(path);
    urls.push(newPath.url); // Assuming newPath is an object with a 'url' property
    fs.unlinkSync(path);
  }
  // Updating the 'image' field in the Product model
  const updatedBlog = await Blog.findByIdAndUpdate(
    id,
    { image: urls }, // Pass the array of URLs to 'image' field
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedBlog);
});

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlog,
  deleteBlog,
  likeBlog,
  disLikeBlog,
  uploadBlogImages,
};
