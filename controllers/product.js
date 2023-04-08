const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/BadRequest");
const Product = require("../models/Product");
const NotFoundError = require("../errors/NotFound");
const Category = require("../models/Category");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

//upload image
const multerStorage = multer.memoryStorage();
const multerFilter = function (req, file, callBack) {
  if (file.mimetype.startsWith("image")) {
    callBack(null, true);
  } else {
    callBack(new BadRequestError("only images allowed"), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
const uploadImage = upload.fields([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);
const resizeProductImages = async function (req, res, next) {
  const imagesCoverName = `product-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize({
      width: 400,
      height: 400,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .toFormat("jpeg")
    .toFile(`uploads/products/${imagesCoverName}`);
  req.body.imageCover = imagesCoverName;
  if (req.files.images) {
    req.body.images = [];
    //added Promise because we use async but map not a async
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imagesName = `product-${uuidv4()}-${Date.now()}-${
          index + 1
        }.jpeg`;
        await sharp(img.buffer)
          .resize({
            width: 400,
            height: 400,
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .toFormat("jpeg")
          .toFile(`uploads/products/${imagesName}`);
        //save image is database
        req.body.images.push(imagesName);
      })
    );
    next();
  }
};
const createProduct = async (req, res) => {
  const { name, description, images, imageCover, price } = req.body;
  if (!name || !description || !imageCover || !images || !price) {
    throw new BadRequestError("all fields are required");
  }
  //req.body.slug = slugify(req.body.title)
  const category = await Category.findById(req.body.category);
  if (!category) {
    throw new NotFoundError("this category is not exist");
  }
  //price after discount
  const checkPrice = req.body.priceAfterDiscount;
  if (price > checkPrice) {
    throw new BadRequestError("price after discount must me lower price");
  }
  await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "product created successfully" });
};
//get products by category
const getCategoryProducts = async (req, res) => {
  //pagination
  const page = req.query.page || 1;
  const limit = req.query.limit || 15;
  const skip = (page - 1) * limit;
  const { categoryId } = req.params;
  const category = await Category.findById(categoryId);
  const products = await Product.find({ category: categoryId })
    .skip(skip)
    .limit(limit);
  if (products === 0) {
    throw new NotFoundError("there are no products for this category");
  }
  res
    .status(StatusCodes.OK)
    .json({ products, length: products.length, category });
};
//get all products
const getAllProducts = async (req, res) => {
  //filtering
  const queryStringObject = { ...req.query }; // we reset a req query as an object and take a copy from it
  const excludes = ["page", "limit", "sort", "keyword"]; //this things we will use it
  excludes.forEach((field) => delete queryStringObject[field]);
  let queryStr = JSON.stringify(queryStringObject);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  //paginate
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const skip = Number(page - 1) * limit;
  //filter
  let mongooseQuery = Product.find(JSON.parse(queryStr))
    .skip(skip)
    .limit(limit)
    .populate({
      path: "category",
      select: "name",
    });
  //sort
  if (req.query.sort) {
    mongooseQuery = mongooseQuery.sort(req.query.sort);
  } else {
    mongooseQuery = mongooseQuery.sort("-createdAt");
  }
  if (mongooseQuery.length === 0) {
    throw new NotFoundError("there are no products");
  }

  if (req.query.keyword) {
    let query = {};
    query.$or = [
      { name: { $regex: req.query.keyword, $options: "i" } },
      { description: { $regex: req.query.keyword, $options: "i" } },
    ];
    mongooseQuery = mongooseQuery.find(query);
  }

  const products = await mongooseQuery;
  const totalProducts = await Product.countDocuments(JSON.parse(queryStr));

  const numOfPages = Math.ceil(totalProducts / limit);
  res.status(StatusCodes.OK).json({
    data: {
      products,
      numOfPages,
      page,
      totalProducts,
    },
  });
};
//popular products
const popularProducts = async (req, res) => {
  const products = await Product.find()
    .sort("-ratingsQuantity")
    .limit(10)
    .populate({
      path: "category",
      select: "name",
    });
  if (products.length === 0) {
    throw new NotFoundError("there are not products");
  }
  res.status(StatusCodes.OK).json({ products });
};
//get best Sell
const bestSellProducts = async (req, res) => {
  const products = await Product.find()
    .sort("-sold")
    .limit(10)
    .populate({ path: "category", select: "name" });
  if (products.length === 0) {
    throw new NotFoundError("there are not products");
  }
  res.status(StatusCodes.OK).json({ products });
};
//get product
const getProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate("reviews");
  if (!product) {
    throw new NotFoundError("this product is not exist");
  }
  res.status(StatusCodes.OK).json({ product });
};
//update product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndUpdate(id, req.body, { new: true });
  res.status(StatusCodes.OK).json({ msg: "product updated successfully" });
};
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  res.status(StatusCodes.OK).json({ msg: "product deleted successfully" });
};
const newProducts = async (req, res) => {
  const sort = { createdAt: -1 };
  const products = await Product.find().sort(sort).limit(10).populate({
    path: "category",
    select: "name",
  });
  if (products.length === 0) {
    throw new NotFoundError("there are no products");
  }
  res.status(StatusCodes.OK).json({ products });
};
module.exports = {
  createProduct,
  getAllProducts,
  getCategoryProducts,
  popularProducts,
  bestSellProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  newProducts,
  resizeProductImages,
  uploadImage,
};
