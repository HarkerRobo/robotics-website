const mongoose = require('../db')
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);

const purchaseSchema = mongoose.Schema({
  purchase_number: {
    type: Number,
    required: true,
    default: -1,
  },
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
  /*
    approval:
      0 - awaiting admin approval
      1 - admin rejected
      2 - admin approved, awaiting mentor approval
      3 - mentor rejected
      4 - mentor approved
  */
  approval: {
    type: Number,
    default: 0,
  },
  admin_comments: {
    type: String,
    default: '',
  },
  admin_username: String,
  admin_date_approved: Date,
  mentor_comments: {
    type: String,
    default: '',
  },
  mentor_date_approved: Date,
  locked: {
    type: Boolean,
    default: true,
  },
})

purchaseSchema.plugin(autoIncrement.plugin, { model: 'Purchase', field: 'purchase_id' });

const Purchase = mongoose.model('Purchase', purchaseSchema)

module.exports = Purchase
