const UnAuthenticationError = require("../errors/UnAuthentication");
const Token = require("../models/Token");
const { validToken, createCookies } = require("../utils/jwt");

const AUthentication = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;
  try {
    //if there is an access token
    if (accessToken) {
      const payload = validToken(accessToken);
      req.user = payload.user;
      return next();
    }
    //if there is no access token
    const payload = validToken(refreshToken);
    //check if there is an token
    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });
    //if there is no refresh token send a message to user to login in again
    if (!existingToken) {
      throw new UnAuthenticationError("authentication invalid");
    }
    //if there is an refresh token create cookies again
    createCookies({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });
    req.user = payload.user;
    next();
  } catch (error) {
    throw new UnAuthenticationError("authentication invalid");
  }
};

module.exports = { AUthentication };
