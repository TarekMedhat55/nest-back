const {
  addProductToCart,
  clearCart,
  getUserCart,
  deleteSpecificProduct,
  cartQuantity,
  applyCoupon,
} = require("../controllers/cart");
const { AUthentication } = require("../middleware/auth");

const router = require("express").Router();
router.get("/", AUthentication, getUserCart);
router.post("/add-product", AUthentication, addProductToCart);
router.post("/apply-coupon", AUthentication, applyCoupon);
router.patch("/:itemId", AUthentication, cartQuantity);
router.delete("/clear-cart", AUthentication, clearCart);
router.delete("/:itemId", AUthentication, deleteSpecificProduct);

module.exports = router;
