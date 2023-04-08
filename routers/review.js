const {
  createReview,
  getAllReviews,
  getReview,
  updatedReview,
  deleteReview,
} = require("../controllers/Review");
const { AUthentication } = require("../middleware/auth");

const router = require("express").Router({ mergeParams: true }); //to access params from parent route //product

router.post("/create-review", AUthentication, createReview);
router.get("/", getAllReviews);
router.get("/:id", getReview);
router.patch("/:id", AUthentication, updatedReview);
router.delete("/:id", AUthentication, deleteReview);

module.exports = router;
