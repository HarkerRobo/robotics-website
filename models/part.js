const mongoose = require("../db");

const STATUSES = [0, 10, 20, 30];

const partSchema = mongoose.Schema(
    {
        year: {
            required: true,
            type: Number,
            min: 1998,
            validate: {
                validator: Number.isInteger,
                message: "{VALUE} is not an integer value",
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
            validate: {
                validator: Number.isInteger,
                message: "{VALUE} is not an integer value",
            },
        },
        subassembly: {
            required: true,
            type: Number,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "{VALUE} is not an integer value",
            },
        },
        metal_type: {
            required: true,
            type: Number,
            min: 0,
            max: 9,
            validate: {
                validator: Number.isInteger,
                message: "{VALUE} is not an integer value",
            },
        },
        specific_id: {
            required: true,
            type: Number,
            min: 0,
            max: 99,
            validate: {
                validator: Number.isInteger,
                message: "{VALUE} is not an integer value",
            },
        },
        /*
    0 - designed
    10 - released
    20 - machined
    30 - installed
  */
        part_status: {
            type: Number,
            default: 0,
            enum: STATUSES,
            validate: {
                validator: Number.isInteger,
                message: "{VALUE} is not an integer value",
            },
        },
        description: String,
        image: String,
        cadlink: String,
        quantity: {
            type: Number,
            default: 1,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "{VALUE} is not an integer value",
            },
        },
        author: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Part = mongoose.model("Part", partSchema);

module.exports = Part;
