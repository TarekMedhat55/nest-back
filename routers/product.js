const {
  getCategoryProducts,
  createProduct,
  getAllProducts,
  bestSellProducts,
  popularProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  newProducts,
  resizeProductImages,
  uploadImage,
} = require("../controllers/Product");
const reviewRoute = require("./review");
const router = require("express").Router();
// Nested route
router.use("/:categoryId/products", getCategoryProducts);

//get => /products/productId/reviews
router.use("/:productId/reviews", reviewRoute);

router.post("/create-product", uploadImage, resizeProductImages, createProduct);
router.get("/", getAllProducts);
router.get("/new-products", newProducts);
router.get("/deals-products", newProducts);
router.get("/popular-products", popularProducts);
router.get("/best-sell", bestSellProducts);
router.get("/:id", getProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);
module.exports = router;
