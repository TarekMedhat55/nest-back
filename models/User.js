const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "first name required"],
  },
  lastName: {
    type: String,
    required: [true, "last name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  passwordResetExpire: Date,
  passwordResetValid: Boolean,
  passwordResetCode: String,
  //1 to many =>
  wishlist: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Product",
    },
  ],
  //address
  addresses: [
    {
      id: { type: mongoose.Schema.Types.ObjectId },
      alias: String,
      details: String,
      phone: String,
      city: String,
      postcode: String,
      street: String,
      firstName: String,
      lastName: String,
      email: String,
    },
  ],
});

UserSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
UserSchema.methods.comparePassword = async function (passwordCheck) {
  const isMatch = await bcrypt.compare(passwordCheck, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
