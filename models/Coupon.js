const { default: mongoose } = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "coupon name is required"],
      trim: true,
      unique: true,
    },
    expire: {
      type: Date,
      required: [true, "coupon expire date is required"],
    },
    discount: {
      type: Number,
      required: [true, "discount is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", CouponSchema);
