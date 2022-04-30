const mongoose = require("../db");

const BatteryScanSchema = new mongoose.Schema({
    id: {
        type: String,
        index: true,
    },
    scanTime: {
        type: Number,
        index: true,
    },
});

const BatteryScan = mongoose.model("BatteryScan", BatteryScanSchema);

module.exports = BatteryScan;
