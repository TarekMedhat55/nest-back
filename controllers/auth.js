const BadRequestError = require("../errors/BadRequest");
const NotFoundError = require("../errors/NotFound");
const Token = require("../models/Token");
const User = require("../models/User");
const crypto = require("crypto");
const { createCookies } = require("../utils/jwt");
const { StatusCodes } = require("http-status-codes");
const UnAuthenticationError = require("../errors/UnAuthentication");
const { sendEmail } = require("../utils/sendEmail");
const register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    throw new BadRequestError("all fields are required");
  }
  //check email
  const checkEmail = await User.findOne({ email });
  if (checkEmail) {
    throw new NotFoundError("this email is not exist");
  }
  const user = await User.create({ firstName, lastName, email, password });
  const userToken = {
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  //generate radom refresh token
  const refreshToken = crypto.randomBytes(40).toString("hex");
  await Token.create({ refreshToken, user: user._id });
  //create cookies
  createCookies({ res, user: userToken, refreshToken });
  //const user info
  const userInfo = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  res.status(StatusCodes.CREATED).json({ user: userInfo });
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("all fields are required");
  }
  //check user
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnAuthenticationError("this email is not exist");
  }
  //check password
  const checkPassword = await user.comparePassword(password);
  if (!checkPassword) {
    throw new UnAuthenticationError("password not correct");
  }
  const userToken = {
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  //const user info
  const userInfo = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  //check for token
  let refreshToken = "";
  //if token exist
  const tokenExist = await Token.findOne({ user: user._id });
  if (tokenExist) {
    refreshToken = tokenExist.refreshToken;
    //create cookies
    createCookies({ res, user: userToken, refreshToken });
    res.status(StatusCodes.OK).json({ userInfo });
    return;
  }
  //generate refreshTOken
  refreshToken = crypto.randomBytes(40).toString("hex");
  await Token.create({ refreshToken, user: user._id });
  //create cookies
  createCookies({ res, user: userToken, refreshToken });
  res.status(StatusCodes.OK).json({ userInfo });
};
const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "logout" });
};
const forgetPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("email is required");
  }
  //check if email is exist
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnAuthenticationError("this email is not exist");
  }
  //generate reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  //hash resetCode
  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex")
    .toString();
  //expire reset code after 10 mints
  const expireDate = new Date(Date.now() + 1000 * 60 * 10);
  user.passwordResetCode = hashResetCode;
  user.passwordResetExpire = expireDate;
  user.passwordResetValid = undefined;
  await user.save();
  //message
  const message = `Hi ${user.firstName} ${user.lastName},\n We received a request to reset the password on your Nest E-commerce Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The Nest E-commerce Team`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetExpire = undefined;
    user.passwordResetValid = undefined;
    await user.save();
    throw new BadRequestError("there is a problem to sending a email");
  }
  res.status(StatusCodes.OK).json({ msg: "reset code sended to your email" });
};
const resetCode = async (req, res) => {
  const { resetCode } = req.body;
  if (!resetCode) {
    throw new BadRequestError("reset code is required");
  }
  const resetCodeHas = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex")
    .toString();

  const user = await User.findOne({ passwordResetCode: resetCodeHas });
  if (!user) {
    throw new BadRequestError("reset code not valid");
  }
  if (user.passwordResetExpire < Date.now()) {
    throw new BadRequestError("reset code expired");
  }
  user.passwordResetValid = true;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "success" });
};
const changePassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("all fields are required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnAuthenticationError("this email is not exist");
  }
  if (!user.passwordResetValid) {
    throw new BadRequestError("reset code not valid");
  }
  user.password = password;
  user.passwordResetCode = undefined;
  user.passwordResetExpire = undefined;
  user.passwordResetValid = undefined;
  await user.save();
  //generate cookies
  let refreshToken = "";
  const userToken = {
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  //const user info
  const userInfo = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  //token exist
  const tokenExist = await Token.findOne({ user: user._id });
  if (tokenExist) {
    refreshToken = tokenExist.refreshToken;
    createCookies({ res, user: userToken, refreshToken });
    res.status(StatusCodes.OK).json({ user: userInfo });
    return;
  }
  //generate refreshToken
  refreshToken = crypto.randomBytes(40).toString();
  createCookies({ res, user: userToken, refreshToken });
  res.status(StatusCodes.OK).json({ user: userInfo });
};
module.exports = {
  register,
  login,
  logout,
  forgetPassword,
  resetCode,
  changePassword,
};
