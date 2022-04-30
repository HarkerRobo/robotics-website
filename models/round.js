const mongoose = require("../db");

const stages = {
    not_started: 0,
    awaiting_scouts: 5,
    started: 10,
    ended: 15,
};

// https://github.com/HarkerRobo/robotics-website/blob/main/doc/scouting.md
// Schema for a round in a robotics tournament
const roundSchema = mongoose.Schema(
    {
        // the robotics tournament that the competition is in
        tournament: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tournament",
            required: true,
        },
        // the round number in the tournament
        number: {
            type: Number,
            required: true,
        },
        // the email of the squad leader for this round
        sergeant: String,
        sergeant_data: Object,
        // number: the team number of the specific team
        // scout: the email of the person scouting said team
        // data: the data given by the scout for that team
        blue: {
            team1: {
                scout: String,
                number: {
                    type: Number,
                    required: true,
                },
                data: Object,
            },
            team2: {
                scout: String,
                number: {
                    type: Number,
                    required: true,
                },
                data: Object,
            },
            team3: {
                scout: String,
                number: {
                    type: Number,
                    required: true,
                },
                data: Object,
            },
        },
        red: {
            team1: {
                scout: String,
                number: {
                    type: Number,
                    required: true,
                },
                data: Object,
            },
            team2: {
                scout: String,
                number: {
                    type: Number,
                    required: true,
                },
                data: Object,
            },
            team3: {
                scout: String,
                number: {
                    type: Number,
                    required: true,
                },
                data: Object,
            },
        },
        /*
    0 - not started
    5 - awaiting scouts
    10 - round started
    15 - round ended
  */
        stage: {
            type: Number,
            default: 0, //stages.not_started,
        },
    },
    { timestamps: true }
);

// TODO: use toLowerCase
roundSchema.methods.findEmail = function findEmail(email) {
    if (
        typeof this.red.team1.scout === "string" &&
        this.red.team1.scout.toLowerCase() === email.toLowerCase()
    ) {
        this.red.team1.scout = email;
        return {
            blue: false,
            team: this.red.team1.number,
        };
    }
    if (
        typeof this.red.team2.scout === "string" &&
        this.red.team2.scout.toLowerCase() === email.toLowerCase()
    ) {
        this.red.team2.scout = email;
        return {
            blue: false,
            team: this.red.team2.number,
        };
    }
    if (
        typeof this.red.team3.scout === "string" &&
        this.red.team3.scout.toLowerCase() === email.toLowerCase()
    ) {
        this.red.team3.scout = email;
        return {
            blue: false,
            team: this.red.team3.number,
        };
    }

    if (
        typeof this.blue.team1.scout === "string" &&
        this.blue.team1.scout.toLowerCase() === email.toLowerCase()
    ) {
        this.blue.team1.scout = email;
        return {
            blue: true,
            team: this.blue.team1.number,
        };
    }
    if (
        typeof this.blue.team2.scout === "string" &&
        this.blue.team2.scout.toLowerCase() === email.toLowerCase()
    ) {
        this.blue.team2.scout = email;
        return {
            blue: true,
            team: this.blue.team2.number,
        };
    }
    if (
        typeof this.blue.team3.scout === "string" &&
        this.blue.team3.scout.toLowerCase() === email.toLowerCase()
    ) {
        this.blue.team3.scout = email;
        return {
            blue: true,
            team: this.blue.team3.number,
        };
    }

    return false;
};

roundSchema.methods.requestSpot = function requestSpot(email) {
    const found = this.findEmail(email);

    if (found !== false) {
        return Promise.resolve(found);
    }

    if (typeof this.red.team1.scout === "undefined") {
        this.red.team1.scout = email;
        return this.save().then(() => {
            return {
                blue: false,
                team: this.red.team1.number,
            };
        });
    }
    if (typeof this.red.team2.scout === "undefined") {
        this.red.team2.scout = email;
        return this.save().then(() => {
            return {
                blue: false,
                team: this.red.team2.number,
            };
        });
    }
    if (typeof this.red.team3.scout === "undefined") {
        this.red.team3.scout = email;
        return this.save().then(() => {
            return {
                blue: false,
                team: this.red.team3.number,
            };
        });
    }

    if (typeof this.blue.team1.scout === "undefined") {
        this.blue.team1.scout = email;
        return this.save().then(() => {
            return {
                blue: true,
                team: this.blue.team1.number,
            };
        });
    }
    if (typeof this.blue.team2.scout === "undefined") {
        this.blue.team2.scout = email;
        return this.save().then(() => {
            return {
                blue: true,
                team: this.blue.team2.number,
            };
        });
    }
    if (typeof this.blue.team3.scout === "undefined") {
        this.blue.team3.scout = email;
        return this.save().then(() => {
            return {
                blue: true,
                team: this.blue.team3.number,
            };
        });
    }

    return Promise.reject("No spots available");
};

roundSchema.statics.setRoundAwatingScouts = function (tournament_id, round) {
    return new Promise((resolve, reject) => {
        this.updateMany(
            {
                tournament: tournament_id,
                number: { $ne: round },
                stage: { $gt: round.not_started },
            },
            { stage: stages.ended }
        )
            .then(() => {
                this.findOneAndUpdate(
                    { tournament: tournament_id, number: round },
                    { stage: stages.awaiting_scouts }
                )
                    .then(resolve)
                    .catch(reject);
            })
            .catch(reject);
    });
};

roundSchema.statics.setRoundStarted = function (tournament_id, round) {
    return new Promise((resolve, reject) => {
        this.updateMany(
            {
                tournament: tournament_id,
                number: { $ne: round },
                stage: { $gt: round.not_started },
            },
            { stage: stages.ended }
        )
            .then(() => {
                this.findOneAndUpdate(
                    { tournament: tournament_id, number: round },
                    { stage: stages.started }
                )
                    .then(resolve)
                    .catch(reject);
            })
            .catch(reject);
    });
};

roundSchema.statics.getCurrentRound = function (tournament_id) {
    return this.findOne({
        tournament: tournament_id,
        stage: { $gt: round.not_started, $lt: round.ended },
    });
};

const Round = mongoose.model("Round", roundSchema);

module.exports = Round;
