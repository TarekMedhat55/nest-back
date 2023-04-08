const jwt = require("jsonwebtoken");
//create token
const createToken = ({ payload }) => {
  const token = jwt.sign(payload, process.env.SECRET_KEY);
  return token;
};
//valid token
const validToken = (token) => jwt.verify(token, process.env.SECRET_KEY);
//create cookies
const createCookies = ({ res, user, refreshToken }) => {
  const tokenJwt = createToken({ payload: { user } });
  const refreshTokenJwt = createToken({ payload: { user, refreshToken } });
  const oneDay = 1000 * 60 * 60 * 24;
  const longExpire = 1000 * 60 * 60 * 24 * 30;
  res.cookie("accessToken", tokenJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });
  res.cookie("refreshToken", refreshTokenJwt, {
    httpOnly: true,
    signed: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + longExpire),
  });
};
module.exports = { validToken, createCookies };
