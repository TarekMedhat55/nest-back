const router = require("express").Router();
const {
  addProductToWishlist,
  removeProductToWishlist,
  getProductWishlist,
} = require("../controllers/wishlist");
const { AUthentication } = require("../middleware/auth");
router.get("/", AUthentication, getProductWishlist);
router.post("/add-product", AUthentication, addProductToWishlist);
router.delete("/:productId", AUthentication, removeProductToWishlist);

module.exports = router;
