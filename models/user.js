const mongoose = require('../db')

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  authorization: {
    type: Number,
    default: 0,
  },
})

const User = mongoose.model('User', userSchema)

module.exports = User
