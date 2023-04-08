const CustomAPi = require("./CustomAPi");
const { StatusCodes } = require("http-status-codes");

class NotFoundError extends CustomAPi {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}
module.exports = NotFoundError;
