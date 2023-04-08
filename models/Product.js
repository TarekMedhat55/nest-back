const { default: mongoose } = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "product name is required"],
    },
    description: {
      type: String,
      required: [true, "product description is required"],
    },
    price: {
      type: Number,
      required: [true, "product price is required"],
    },
    imageCover: {
      type: String,
      required: [true, "product images cover is required"],
    },
    images: [String],
    priceAfterDiscount: {
      type: Number,
    },
    quantity: {
      type: Number,
      required: [true, "product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: [true, "category is required"],
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating muse be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    sizes: {
      type: [String],
    },
    type: String,
    mfg: Date,
    life: String,
    sku: String,
  },
  {
    timestamps: true,
    //to enable virtual reviews
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
ProductSchema.post("init", function (doc) {
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/products/${image}`;
      imagesList.push(imageUrl);
    });
    doc.images = imagesList;
  }
});
//virtual populate
//like if we made
// reviews:[{type:mongoose.schema.objectId,ref:'reviews}]
ProductSchema.virtual("reviews", {
  ref: "Review", //ref to review model
  foreignField: "product", //product in reviews model
  localField: "_id", //product _id
});
module.exports = mongoose.model("Product", ProductSchema);
