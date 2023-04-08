const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/BadRequest");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const NotFoundError = require("../errors/NotFound");
const Coupon = require("../models/coupon");

//calc user cart
const calcTotalCartPrice = (userCart) => {
  let totalPrice = 0;
  userCart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  userCart.totalCartPrice = totalPrice;
  userCart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};
const addProductToCart = async (req, res) => {
  const { productId, size } = req.body;
  if (!size) {
    throw new BadRequestError("size is required");
  }

  const product = await Product.findById(productId);

  //get cart for logged user
  let userCart = await Cart.findOne({ user: req.user.userId });

  //check if user have a cart or not
  if (!userCart) {
    //create user cart
    userCart = await Cart.create({
      user: req.user.userId,
      cartItems: [
        {
          product: productId,
          size,
          price: product.price,
          subTotal: product.price,
        },
      ],
    });
  } else {
    //check if user have a cart and product,product size exist on this cart
    const productIndex = userCart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );
    //if exist update product quantity
    if (productIndex > -1) {
      const cartItem = userCart.cartItems[productIndex];
      cartItem.quantity += 1;
      cartItem.subTotal = product.price * cartItem.quantity;
      userCart.cartItems[productIndex] = cartItem;
    } else {
      //product not exist in cart items,push product to cartItems array
      userCart.cartItems.push({
        product: productId,
        size,
        price: product.price,
        subTotal: product.price,
      });
    }
  }
  //cal total cart price
  calcTotalCartPrice(userCart);
  await userCart.save();
  res.status(StatusCodes.OK).json({
    msg: "product added to cart successfully",
    numOfCartItems: userCart.cartItems.length,
    data: userCart,
  });
};
//get user cart
const getUserCart = async (req, res) => {
  //get user cart
  const userCart = await Cart.findOne({ user: req.user.userId }).populate({
    path: "cartItems.product",
    select: "name imageCover price priceAfterDiscount",
  });
  if (!userCart) {
    throw new NotFoundError("cart it's empty");
  }
  res
    .status(StatusCodes.OK)
    .json({ userCart, length: userCart.cartItems.length });
};
//remove specific product
const deleteSpecificProduct = async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.userId },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );
  //calc products
  calcTotalCartPrice(cart);
  cart.save();
  res.status(StatusCodes.OK).json({ cart, length: cart.cartItems.length });
};
//clear cart
const clearCart = async (req, res) => {
  //check if user have a cart
  const userCart = await Cart.findOne({ user: req.user.userId });
  if (userCart.cartItems.length === 0) {
    throw new BadRequestError("you don't have products in your cart");
  }
  await userCart.remove();
  res.status(StatusCodes.OK).json({ msg: "cart empty" });
};
//updated cart quantity
const cartQuantity = async (req, res) => {
  const { quantity } = req.body;
  //get user cart
  const cart = await Cart.findOne({ user: req.user.userId });
  //get product from cart items
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  //if this product exist
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cartItem.subTotal = cartItem.price * cartItem.quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    throw new NotFoundError("this product not exist in cart");
  }
  calcTotalCartPrice(cart);
  res.status(StatusCodes.OK).json({ cart, length: cart.cartItems.length });
};
//const apply coupon
const applyCoupon = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new BadRequestError("coupon name is required");
  }
  //check if coupon exist and not expired
  const coupon = await Coupon.findOne({ name });
  if (!coupon) {
    throw new BadRequestError("this coupon not exist");
  }
  if (coupon.expire < Date.now()) {
    throw new BadRequestError("this coupon is expired");
  }
  //get user cart to get totalPrice
  const cart = await Cart.findOne({ user: req.user.userId });
  //cart total price
  const totalPrice = cart.totalCartPrice;
  //calc priceAfterDiscount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);
  //cart total price equal to totalPriceAfterDisCount
  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();
  res.status(StatusCodes.OK).json({ cart, length: cart.cartItems.length });
};
module.exports = {
  addProductToCart,
  clearCart,
  getUserCart,
  deleteSpecificProduct,
  cartQuantity,
  applyCoupon,
};
