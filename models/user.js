const mongoose = require("../db");

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    authorization: {
        type: Number,
        default: 0,
    },
    firstName: {
        type: String,
        required: false,
        default: "",
    },
    lastName: {
        type: String,
        required: false,
        default: "",
    },
    name: {
        type: String,
        required: false,
        default: "",
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
