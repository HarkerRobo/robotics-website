const mongoose = require("../db")

const ReviewSchema = new mongoose.Schema({
    email: {
        type: String,
        index: true
    },
    rating: {
        type: Number
    },
    entryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Entry",
        index: true
    }
});

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;