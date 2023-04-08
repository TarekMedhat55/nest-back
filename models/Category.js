const { default: mongoose } = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "category name is required"],
      unique: true,
    },
    image: String,
  },
  { timestamps: true }
);
//findOne findAll update
CategorySchema.post("init", function (doc) {
  //return image base url + image image
  if (doc.image) {
    const ImageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = ImageUrl;
  }
});
//findOne findAll create
// CategorySchema.post("save", function (doc) {
//   //return image base url + image image
//   if (doc.image) {
//     const ImageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
//     doc.image = ImageUrl;
//   }
// });
module.exports = mongoose.model("Category", CategorySchema);
