const mongoose = require("../db");

const purchaseSchema = mongoose.Schema({
    /*
    Subteam:
      undefined - N/A
      0 - Mechanial   (Mech)
      1 - Electrical  (E)
      2 - Programming (Software)
      3 - Operational (Ops)
  */
    subteam: Number,
    vendor: String,
    vendor_phone: String,
    vendor_email: String,
    vendor_address: String,
    reason_for_purchase: String,
    part_url: [String],
    part_number: [String],
    part_name: [String],
    subsystem: [String],
    price_per_unit: [Number],
    quantity: [Number],
    shipping_and_handling: [Number],
    submitted_by: String,
    approval: {
        type: Number,
        default: 0,
    },
    admin_comments: String,
    mentor_comments: String,
});

const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;
