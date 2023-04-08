const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/NotFound");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

const createCashOrder = async (req, res) => {
  const taxPrice = 0;
  const shippingPrice = 20;
  //get card depend on cart id
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    throw new NotFoundError("this cart it is not exist");
  }
  //get order price depend on cart price('check if there is a coupon or not')
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  console.log(cartPrice);
  //create order with default payment method
  const order = await Order.create({
    user: req.user.userId,
    cartItems: cart.cartItems,
    totalOrderPrice,
    shippingAddress: req.body.shippingAddress,
  });
  //after creating order
  if (order) {
    //decrement product quantity and increment product sold
    // bulkWrite=> send multiOperation in one command //filter and update
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});
    //5- clear cart depend on cardId
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  //clear cart
  res.status(StatusCodes.OK).json({
    data: order,
    msg: "Your order have been received ! ",
  });
};
const getOrders = async (req, res) => {
  //paginate
  const page = req.query.page || 1;
  const limit = req.query.limit || 5;
  const skip = (page - 1) * limit;
  const orders = await Order.find({ user: req.user.userId })
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);
  if (orders.length === 0) {
    throw new NotFoundError("there are no orders");
  }
  const orderLength = await Order.countDocuments({ user: req.user.userId });
  const numPages = Math.ceil(orderLength / limit);
  res.status(StatusCodes.OK).json({ orders, numPages, orderLength });
};

module.exports = { getOrders, createCashOrder, msg: "hi" };
