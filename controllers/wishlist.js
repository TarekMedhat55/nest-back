const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");

const addProductToWishlist = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      //addToSet operator adds a value to an array
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );
  res
    .status(StatusCodes.OK)
    .json({ msg: "product added successfully", wishlist: user.wishlist });
};
const removeProductToWishlist = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      //pull delete productId  from wishlist if this product exist
      $pull: { wishlist: req.params.productId },
    },
    { new: true }
  );
  res
    .status(StatusCodes.OK)
    .json({ msg: "product remove successfully", wishlist: user.wishlist });
};
const getProductWishlist = async (req, res) => {
  const user = await User.findById(req.user.userId).populate("wishlist");

  res
    .status(StatusCodes.OK)
    .json({ wishlist: user.wishlist, length: user.wishlist.length });
};
module.exports = {
  addProductToWishlist,
  removeProductToWishlist,
  getProductWishlist,
};
