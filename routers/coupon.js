const {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/coupone");

const router = require("express").Router();

router.post("/create-coupon", createCoupon);
router.get("/", getAllCoupons);
router.get("/:id", getCoupon);
router.patch("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

module.exports = router;
