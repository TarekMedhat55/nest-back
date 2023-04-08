const {
  register,
  login,
  logout,
  forgetPassword,
  resetCode,
  changePassword,
} = require("../controllers/auth");
const { AUthentication } = require("../middleware/auth");
const router = require("express").Router();
router.post("/register", register);
router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.post("/reset-code", resetCode);
router.post("/change-password", changePassword);
router.delete("/logout", AUthentication, logout);
module.exports = router;
