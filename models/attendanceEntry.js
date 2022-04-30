const mongoose = require("../db");

const EntrySchema = new mongoose.Schema({
    email: {
        type: String,
        index: true,
    },
    checkIn: {
        type: Number,
        index: true,
    },
    checkOut: {
        type: Number,
    },
    subteams: {
        type: [String],
        required: false,
    },
});

const Entry = mongoose.model("Entry", EntrySchema);

module.exports = Entry;
