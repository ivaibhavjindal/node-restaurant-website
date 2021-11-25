const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favoriteSchema = new Schema(
  {
    dishes: [{ type: Schema.Types.ObjectId, ref: "Dish" }],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, //add createdAt and updatedAt timestamps
  }
);

var Favorites = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorites;
