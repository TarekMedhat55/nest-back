require("dotenv").config();
require("express-async-errors");
const express = require("express");
const { default: mongoose } = require("mongoose");
const NotFoundMiddleware = require("./middleware/NotFoundMiddleware");
const ErrorHandlerMiddleware = require("./middleware/ErrorHandler");
const cookieParser = require("cookie-parser");
const authRouter = require("./routers/auth");
const categoryRouter = require("./routers/category");
const productRouter = require("./routers/product");
const reviewRouter = require("./routers/review");
const wishlistRouter = require("./routers/wishlist");
const addressRouter = require("./routers/address");
const couponRouter = require("./routers/coupon");
const cartRouter = require("./routers/cart");
const orderRouter = require("./routers/order");
const cors = require("cors");
const hpp = require("hpp");

const path = require("path");

const app = express();
app.use(cookieParser(process.env.SECRET_KEY));
//set request size //securice
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "uploads")));
app.use(cors());
//for securty
//if we send /api/products/?sort=price&sort=sold => we get error
//for this we need hpp to solve this problem => hpp take last sort
//witeList => الحاجات الى ممكن اجيبهم كلهم
//يعنى مثلا لو جيت ضفت سعرين يجيب المنتجات الى بالسعرين دول مايخدش اخر واحده
// app.use(hpp({ whitelist: ["price"] })); // <- THIS IS THE NEW LINE

app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/address", addressRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

app.use(NotFoundMiddleware);
app.use(ErrorHandlerMiddleware);
const port = process.env.PORT || 8000;
const start = async () => {
  try {
    await mongoose
      .connect(process.env.DATABASE)
      .then(() => console.log("Database connected"))
      .catch((error) => console.log("Error", error));
    app.listen(port, () => console.log(`sever is running on port ${port}`));
  } catch (error) {
    console.log("Error", error);
  }
};

start();
