const mongoose = require('../db')

const partSchema = mongoose.Schema({
  year: {
    required: true,
    type: Number,
    min: 1998,
    validate : {
      validator : Number.isInteger,
      message   : '{VALUE} is not an integer value'
    },
  },
  /*
    0 - comp robot
    1 - practice robot
    2 - offseason robot
  */
  robot_type: {
    required: true,
    type: Number,
    min: 0,
    max: 2,
    validate : {
      validator : Number.isInteger,
      message   : '{VALUE} is not an integer value'
    },
  },
  subassembly: {
    required: true,
    type: Number,
    min: 0,
    validate : {
      validator : Number.isInteger,
      message   : '{VALUE} is not an integer value'
    },
  },
  metal_type: {
    required: true,
    type: Number,
    min: 0,
    max: 9,
    validate : {
      validator : Number.isInteger,
      message   : '{VALUE} is not an integer value'
    },
  },
  specific_id: {
    required: true,
    type: Number,
    min: 0,
    max: 99,
    validate : {
      validator : Number.isInteger,
      message   : '{VALUE} is not an integer value'
    },
  },
  /*
    0 - not started
    5 - part completed
    10 - part on robot
  */
  part_status: {
    type: Number,
    default: 0,
    min: 0,
    max: 10,
    validate : {
      validator : Number.isInteger,
      message   : '{VALUE} is not an integer value'
    },
  },
  description: String,
  image: String,
  cadlink: String,
  author: {
    type: String,
    required: true,
  }
}, { timestamps: true })

const Part = mongoose.model('Part', partSchema)

module.exports = Part
