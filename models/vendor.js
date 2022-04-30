// Premade vendors for easy autofill when creating PRs

const mongoose = require("../db");

const vendorSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        address: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
