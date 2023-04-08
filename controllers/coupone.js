const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/BadRequest");
const Coupon = require("../models/coupon");
const NotFoundError = require("../errors/NotFound");

const createCoupon = async (req, res) => {
  const { name, expire, discount } = req.body;
  if (!name || !expire || !discount) {
    throw new BadRequestError("all fields are required");
  }
  //check expire
  if (expire <= Date.now()) {
    throw new BadRequestError("coupon expire failed,choose another date");
  }
  await Coupon.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "coupon created successfully" });
};
const getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find();
  if (coupons.length === 0) {
    throw new NotFoundError("there are no coupons");
  }
  res.status(StatusCodes.OK).json({ coupons, length: coupons.length });
};
const getCoupon = async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new NotFoundError("this coupon is not exist");
  }
  res.status(StatusCodes.OK).json({ coupon });
};
const updateCoupon = async (req, res) => {
  const { id } = req.params;
  await Coupon.findByIdAndUpdate(id, req.body, { new: true });
  res.status(StatusCodes.OK).json({ msg: "coupon updated successfully" });
};
const deleteCoupon = async (req, res) => {
  const { id } = req.params;
  await Coupon.findByIdAndDelete(id);
  res.status(StatusCodes.OK).json({ msg: "coupon deleted successfully" });
};
module.exports = {
  createCoupon,
  getAllCoupons,
  getCoupon,
  deleteCoupon,
  updateCoupon,
};
