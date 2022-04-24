const mongoose = require("../db");

// Schema for a robotics tournament
const tournamentSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

tournamentSchema.statics.getCurrentTournament = function () {
    return new Promise((resolve, reject) => {
        this.findOne({
            startDate: { $lt: new Date() },
            endDate: { $gt: new Date() },
        })
            .then((tournament) => {
                if (tournament !== null) resolve(tournament);
                else reject("No tournament is currently active");
            })
            .catch(reject);
    });
};

const Tournament = mongoose.model("Tournament", tournamentSchema);

module.exports = Tournament;
