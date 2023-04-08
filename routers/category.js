const {
  CreateCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImage,
} = require("../controllers/categories");

const router = require("express").Router();
router.post(
  "/create-category",
  uploadCategoryImage,
  resizeImage,
  CreateCategory
);
router.get("/", getAllCategories);
router.get("/:id", getCategory);
router.patch("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
