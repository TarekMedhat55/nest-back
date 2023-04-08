const BadRequestError = require("../errors/BadRequest");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

const addUserAddress = async (req, res) => {
  const { firstName, lastName, phone, city, email } = req.body;
  if (!firstName || !lastName || !phone || !city || !email) {
    throw new BadRequestError("all fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { $addToSet: { addresses: req.body } },
    { new: true }
  );
  res.status(StatusCodes.OK).json({ msg: "address added successfully" });
};
const removeUserAddress = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { $pull: { addresses: { _id: req.params.addressId } } },
    { new: true }
  );
  res
    .status(StatusCodes.OK)
    .json({ msg: "address deleted successfully", address: user.addresses });
};
const getUserAddress = async (req, res) => {
  const user = await User.findById(req.user.userId).populate("addresses");
  res
    .status(StatusCodes.OK)
    .json({ address: user.addresses, length: user.addresses.length });
};
module.exports = { addUserAddress, removeUserAddress, getUserAddress };
