const mongoose = require("mongoose");
const Product = require("./Product");

const ReviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, "Min ratings value is 1.0"],
      max: [5, "Max ratings value is 5.0"],
      required: [true, "review ratings required"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to user"],
    },
    // parent reference (one to many)
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to product"],
    },
  },
  { timestamps: true }
);
//to populate to user in any  find reviews
ReviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "firstName lastName" });
  next();
});
//Aggregation
ReviewSchema.statics.calcAverageRatingsQuantity = async function (productId) {
  const result = await this.aggregate([
    //stage 1
    //get all reviews in specific productId
    { $match: { product: productId } },
    //create groupe based productId and calc average for ratings and sum
    {
      $group: {
        _id: "product",
        avgRatings: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
  //log=> result =>[ { _id: 'product', avgRatings: 3.2, ratingsQuantity: 1 } ]
  console.log(result.length);
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].avgRatings,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};
//call this method after create , delete and updated review

ReviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingsQuantity(this.product);
});
ReviewSchema.post("remove", async function () {
  await this.constructor.calcAverageRatingsQuantity(this.product);
});
module.exports = mongoose.model("Review", ReviewSchema);
