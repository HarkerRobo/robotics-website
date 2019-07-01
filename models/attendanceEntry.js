const mongoose = require("../db");

const EntrySchema = new mongoose.Schema({
    email: {
        type: String,
    },
    checkIn: {
        type: Date
    },
    checkOut: {
        type: Date
    }
});

const Entry = mongoose.model("Entry", EntrySchema);

module.exports = Entry;
