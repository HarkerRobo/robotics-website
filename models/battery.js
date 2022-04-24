const mongoose = require("../db");

const BatterySchema = new mongoose.Schema({
    id: {
        type: String,
        index: true,
    },
    cycles: {
        type: Number,
        index: true,
    },
});

const Battery = mongoose.model("Battery", BatterySchema);

module.exports = Battery;
