const router = require("express").Router();

const {
  addUserAddress,
  removeUserAddress,
  getUserAddress,
} = require("../controllers/address");
const { AUthentication } = require("../middleware/auth");
router.get("/", AUthentication, getUserAddress);
router.post("/add-address", AUthentication, addUserAddress);
router.delete("/:addressId", AUthentication, removeUserAddress);

module.exports = router;
