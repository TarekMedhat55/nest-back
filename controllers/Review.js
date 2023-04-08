const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/BadRequest");
const Review = require("../models/Review");
const NotFoundError = require("../errors/NotFound");
const UnAuthenticationError = require("../errors/UnAuthentication");

const createReview = async (req, res) => {
  const { title, ratings } = req.body;
  if (!title || !ratings) {
    throw new BadRequestError("all fields are required");
  }
  //check user
  if (!req.body.product) req.body.product = req.params.productId;
  req.body.user = req.user.userId;
  const checkUserReview = await Review.findOne({
    user: req.user.userId,
    product: req.body.product,
  });
  if (checkUserReview) {
    throw new BadRequestError("you already created a review before");
  }
  await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "review added successfully" });
};
const getAllReviews = async (req, res) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };

  const reviews = await Review.find(filterObject);
  if (reviews.length === 0) {
    throw new NotFoundError("there are no reviews");
  }
  res.status(StatusCodes.OK).json({ reviews });
};
const getReview = async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) {
    throw new BadRequestError("this review is not exist");
  }
  res.status(StatusCodes.OK).json({ review });
};
const updatedReview = async (req, res) => {
  const { id } = req.params;
  //check
  const checkReview = await Review.findById(id);
  if (!checkReview) {
    throw new NotFoundError("this review not exist ");
  }
  console.log(checkReview.user);
  if (req.user.userId.toString() !== checkReview.user._id.toString()) {
    throw new UnAuthenticationError("you can not edit this review");
  }
  const review = await Review.findByIdAndUpdate(id, req.body, { new: true });
  review.save();
  res.status(StatusCodes.OK).json({ msg: "review updated successfully" });
};
const deleteReview = async (req, res) => {
  const { id } = req.params;
  const review = await Review.findByIdAndRemove(id);
  if (req.user.userId.toString() !== review.user._id.toString()) {
    throw new UnAuthenticationError("you can not make this action");
  }
  await review.remove();
  res.status(StatusCodes.OK).json({ msg: "review deleted successfully" });
};
module.exports = {
  createReview,
  getAllReviews,
  getReview,
  updatedReview,
  deleteReview,
};
