const { default: mongoose } = require("mongoose");

const TokenSchema = new mongoose.Schema({
  refreshToken: String,
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Token", TokenSchema);
