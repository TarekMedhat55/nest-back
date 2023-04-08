const CustomAPi = require("./CustomAPi");
const { StatusCodes } = require("http-status-codes");
class UnAuthenticationError extends CustomAPi {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}
module.exports = UnAuthenticationError;
