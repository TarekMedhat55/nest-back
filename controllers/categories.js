const BadRequestError = require("../errors/BadRequest");
const NotFoundError = require("../errors/NotFound");
const Category = require("../models/Category");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const sharp = require("sharp");
//we will use memory storage to save it in buffer
const multerStorage = multer.memoryStorage();
//filter images to upload images only
const multerFilter = function (req, file, callBack) {
  //file=>mimetype:image/jpeg
  if (file.mimetype.startsWith("image")) {
    //no error
    callBack(null, true);
  } else {
    callBack(new BadRequestError("only images allowed"), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
const uploadCategoryImage = upload.single("image");
//sharp image
const resizeImage = async (req, res, next) => {
  const imagesName = `category-${uuidv4()}-${Date.now()}.jpeg`;
  //console.log(sharp);
  await sharp(req.file.buffer)
    .resize({
      width: 400,
      height: 400,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .toFormat("jpeg")
    .toFile(`uploads/categories/${imagesName}`); //to file to save it
  //save image name in database
  req.body.image = imagesName;
  next();
};
const CreateCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new BadRequestError("category name is required");
  }
  const categoryExist = await Category.findOne({ name });
  if (categoryExist) {
    throw new BadRequestError("category is exist");
  }
  await Category.create(req.body);
  res
    .status(StatusCodes.CREATED)
    .json({ msg: "category created successfully" });
};

const getAllCategories = async (req, res) => {
  const categories = await Category.find();
  if (categories.length === 0) {
    throw new NotFoundError("there are no categories");
  }
  res.status(StatusCodes.OK).json({ categories, length: categories.length });
};
const getCategory = async (req, res) => {
  const { id } = req.params;
  //check category exist
  const category = await Category.findById(id);
  if (!category) {
    throw new NotFoundError("category is not exist");
  }
  res.status(StatusCodes.OK).json({ category });
};
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    throw new BadRequestError("category name is required");
  }
  const category = await Category.findById(id);
  if (!category) {
    throw new NotFoundError("category is not exist");
  }
  await Category.findByIdAndUpdate(id, req.body, { new: true });
  res.status(StatusCodes.OK).json({ msg: "category updated successfully" });
};
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  await Category.findByIdAndDelete(id);
  res.status(StatusCodes.OK).json({ msg: "Category deleted successfully" });
};

module.exports = {
  CreateCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  uploadCategoryImage,
  resizeImage,
};
