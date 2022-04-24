const mongoose = require("../db");

// Schema for a shortened url
const urlSchema = mongoose.Schema(
    {
        path: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        uses: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Url = mongoose.model("Url", urlSchema);

module.exports = Url;
