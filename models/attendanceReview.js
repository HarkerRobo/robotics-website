const mongoose = require("../db")

const ReviewSchema = new mongoose.Schema({
    email: {
        type: String
    },
    rating: {
        type: Number
    },
    entryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Entry"
    }
});

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;