const router = require("express").Router();
const { createCashOrder, getOrders } = require("../controllers/order");
const { AUthentication } = require("../middleware/auth");

router.get("/", AUthentication, getOrders);
router.post("/:cartId", AUthentication, createCashOrder);

module.exports = router;
