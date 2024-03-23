require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/dbConnection");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");

// Middlewares
const { errorHandler, notFound } = require("./middlewares/errorHandler");

// Route Handlers
const authRouteHandler = require("./routes/authRoute");
const productRouteHandler = require("./routes/productRoute");
const blogRouteHandler = require("./routes/blogRoute");
const productCategoryRouteHandler = require("./routes/productCategoryRoute");
const blogCategoryRouteHandler = require("./routes/blogCategoryRoute");
const brandRouteHandler = require("./routes/brandRoute");
const couponRouteHandler = require("./routes/couponRoute");
const colorRouteHandler = require("./routes/colorRoute");
const enquiryRouteHandler = require("./routes/enquiryRoute");
const uploadRouteHandler = require("./routes/uploadRoute");

app.use(express.json());
app.use(helmet());
app.use(xss());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      `https://shopito-admin.vercel.app`,
      `https://shopito-admin-4vdofzx4x-md-wasim-akrams-projects.vercel.app`,
      `https://shopito-admin-git-main-md-wasim-akrams-projects.vercel.app/`,
      `https://shopito-frontend.vercel.app`,
    ],
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use("/api/user", authRouteHandler);
app.use("/api/products", productRouteHandler);
app.use("/api/blogs", blogRouteHandler);
app.use("/api/productCategory", productCategoryRouteHandler);
app.use("/api/blogCategory", blogCategoryRouteHandler);
app.use("/api/brand", brandRouteHandler);
app.use("/api/coupon", couponRouteHandler);
app.use("/api/color", colorRouteHandler);
app.use("/api/enquiry", enquiryRouteHandler);
app.use("/api/upload", uploadRouteHandler);

app.use(notFound);
app.use(errorHandler);

// DataBase Connection
const PORT = process.env.PORT || 4000;
const start = async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server is Listening on PORT Number ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
