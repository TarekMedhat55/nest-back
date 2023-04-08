const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        size: Number,
        price: Number,
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order must be belong to user"],
    },
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingAddress: {
      alias: {
        type: String,
        required: [true, "alias is required"],
      },
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      phone: {
        type: Number,
        required: [true, "phone number is required"],
      },
      city: {
        type: String,
        required: [true, "city is required"],
      },
      postcode: {
        type: String,
        required: [true, "postcode is required"],
      },
      street: {
        type: String,
        required: [true, "street is required"],
      },
      email: {
        type: String,
        required: [true, "email is required"],
      },
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
      type: Number,
    },
    paymentMethodType: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "shippingAddress",
    select: "firstName lastName email phone",
  }).populate({
    path: "cartItems.product",
    select: "name imageCover mfg",
  });
  next();
});

module.exports = mongoose.model("Order", orderSchema);
