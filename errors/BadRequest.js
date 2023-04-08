const CustomAPi = require("./CustomAPi");
const { StatusCodes } = require("http-status-codes");
class BadRequestError extends CustomAPi {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

module.exports = BadRequestError;
