"use strict";

// view documentation in /doc/scouting.md
// https://github.com/HarkerRobo/robotics-website/blob/main/doc/scouting.md

const bodyParser = require("body-parser");
const express = require("express"),
    router = express.Router(),
    io = require("socket.io")(),
    ranks = require("../../helpers/ranks.json"),
    scoutingRanks = {
        sergeant: 10,
        private: 0,
    },
    User = require("../../models/user"),
    Tournament = require("../../models/tournament"),
    Round = require("../../models/round");

class ScoutingError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.message = message;
    }
    sendTo(res) {
        res.status(this.code).json({
            success: false,
            error: {
                message: this.message,
            },
        });
    }
}

const handleScoutingError = (req, res, status, context) => (error) => {
    console.error(
        `[REQ ${req.request_id}] [ERROR] `,
        error instanceof Error ? error.stack : error
    );
    if (error instanceof ScoutingError) error.sendTo(res);
    else
        res.status(status || 500).json({
            success: false,
            error: {
                message: error,
                context: context || "",
            },
        });
};

router.get("/", (req, res) => {
    res.render("pages/member/scouting");
});

/*
  "Request Spot"
  Clients call this route for each round to "get a spot" on the scouting team
  Gives information about tournament and scouting position
  More documentation at Routes > Request Spot
*/
router.get("/request/:round", (req, res) => {
    const round = parseInt(req.params.round, 10);
    if (isNaN(round)) {
        return new ScoutingError(422, "Round must be an integer").sendTo(res);
    }
    // Find current tournament
    Tournament.getCurrentTournament()
        .then((tournament) => {
            return Round.findOne({
                tournament: tournament._id,
                number: round,
            }).populate("tournament");
        })
        .then((round) => {
            if (round == null) {
                throw new ScoutingError(404, "Round does not exist");
            }
            const tournament = round.tournament;
            const tournament_info = {
                year: tournament.year,
                name: tournament.name,
                id: tournament._id,
            };

            // if is already sergeant
            if (
                typeof round.sergeant === "string" &&
                round.sergeant.toLowerCase() ===
                    req.auth.info.email.toLowerCase()
            ) {
                res.send({
                    tournament: tournament_info,
                    scouting: {
                        round: round.number,
                        rank: scoutingRanks.sergeant,
                        team: 0,
                        blue: false,
                    },
                });
                return;
            }

            // if the user is already a set as a private
            console.log(
                "[DEBUG] foundEmail =",
                round.findEmail(req.auth.info.email)
            );
            if (round.findEmail(req.auth.info.email)) {
                return round
                    .requestSpot(req.auth.info.email)
                    .then((spot) => {
                        res.send({
                            tournament: tournament_info,
                            scouting: {
                                round: round.number,
                                rank: scoutingRanks.private,
                                team: spot.team,
                                blue: spot.blue,
                            },
                        });
                    })
                    .catch(() => new ScoutingError(409, "Scouting is full"));
            }

            // if the user can be a sergeant and the sergeant hasn't been set yet
            if (req.auth.level >= ranks.scouting_sergeants && !round.sergeant) {
                round.sergeant = req.auth.info.email;
                return (
                    round
                        .save()
                        //.then(() => Round.setRoundAwatingScouts(tournament._id, round.number))
                        .then(() => {
                            res.send({
                                tournament: tournament_info,
                                scouting: {
                                    round: round.number,
                                    rank: scoutingRanks.sergeant,
                                    team: 0,
                                    blue: false,
                                },
                            });
                        })
                );
            }

            // if the user can't be a sergeant and sergeant hasn't been set yet
            return round.requestSpot(req.auth.info.email).then((spot) => {
                res.send({
                    tournament: tournament_info,
                    scouting: {
                        round: round.number,
                        rank: scoutingRanks.private,
                        team: spot.team,
                        blue: spot.blue,
                    },
                });
            });
        })
        .catch(
            handleScoutingError(
                req,
                res,
                500,
                `GET /member/request/${req.params.round}`
            )
        );
});

async function findTeamRounds(number, tournament_id) {
    if (!tournament_id) {
        tournament_id = await Tournament.getCurrentTournament();
    }

    let res = [];
    await Round.find({
        "red.team1.number": number,
        tournament: tournament_id,
    }).then((rounds) => {
        for (const round of rounds) {
            res.push({
                roundNumber: round.number,
                blue: false,
                teamPlacementNumber: 1,
            });
        }
    });
    await Round.find({
        "red.team2.number": number,
        tournament: tournament_id,
    }).then((rounds) => {
        for (const round of rounds) {
            res.push({
                roundNumber: round.number,
                blue: false,
                teamPlacementNumber: 2,
            });
        }
    });
    await Round.find({
        "red.team3.number": number,
        tournament: tournament_id,
    }).then((rounds) => {
        for (const round of rounds) {
            res.push({
                roundNumber: round.number,
                blue: false,
                teamPlacementNumber: 3,
            });
        }
    });
    await Round.find({
        "blue.team1.number": number,
        tournament: tournament_id,
    }).then((rounds) => {
        for (const round of rounds) {
            res.push({
                roundNumber: round.number,
                blue: true,
                teamPlacementNumber: 1,
            });
        }
    });
    await Round.find({
        "blue.team2.number": number,
        tournament: tournament_id,
    }).then((rounds) => {
        for (const round of rounds) {
            res.push({
                roundNumber: round.number,
                blue: true,
                teamPlacementNumber: 2,
            });
        }
    });
    await Round.find({
        "blue.team3.number": number,
        tournament: tournament_id,
    }).then((rounds) => {
        for (const round of rounds) {
            res.push({
                roundNumber: round.number,
                blue: true,
                teamPlacementNumber: 3,
            });
        }
    });
    return res;
}

async function getDataOnTeam(teamNumber, tournament) {
    if (!tournament) {
        tournament = await Tournament.getCurrentTournament();
    }
    console.log("teamNumber:", teamNumber);
    const rounds = await findTeamRounds(teamNumber, tournament);
    const totalRounds = rounds.length;

    const dataList = [];
    console.log(rounds);
    for (const round of rounds) {
        //console.log(round)
        const roundFound = await Round.findOne({
            tournament,
            number: round.roundNumber,
        });
        const toData =
            roundFound[round.blue ? "blue" : "red"][
                "team" + round.teamPlacementNumber
            ].data;
        if (typeof toData !== "undefined") {
            if (typeof toData === "string") {
                try {
                    dataList.push(JSON.parse(toData));
                } catch (e) {
                    // do nothing
                }
            } else if (typeof toData === "object") {
                dataList.push(toData);
            }
        }
    }

    console.log("dataList:", dataList);

    let res = {
        team: teamNumber,
        numberRounds: dataList.length,
        scale: {
            max: 0,
            total: 0,
        },
        homeSwitch: {
            max: 0,
            total: 0,
        },
        awaySwitch: {
            max: 0,
            total: 0,
        },
        vault: {
            max: 0,
            total: 0,
        },
        startingPosition: {
            left: 0,
            right: 0,
            middle: 0,
        },
        auton: {
            crossedLine: 0,
            scale: 0,
            homeSwitch: 0,
            awaySwitch: 0,
            vault: 0,
        },
        finish: {
            totalPlatform: 0,
            climb: {
                total: 0,
                totalUsingRamp: 0,
            },
            hasRamp: false,
            hasBar: false,
        },
        comments: [],
    };

    for (let data of dataList) {
        console.log("[DEBUG] checkpoint a");
        if (typeof data == "string") {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.log("[WARN] could not parse data");
                res.numberRounds--;
                continue;
            }
        }
        if (typeof data !== "object") {
            res.numberRounds--;
            continue;
        }

        let teleop = data["teleop-actions"];
        if (typeof teleop === "string") {
            try {
                teleop = JSON.parse(teleop);
            } catch (e) {
                console.log("[WARN] could not parse teleop");
                res.numberRounds--;
                continue;
            }
        }

        let auton = data["auton-actions"];
        if (typeof auton === "string") {
            try {
                auton = JSON.parse(auton);
            } catch (e) {
                console.log("[WARN] could not parse auton");
                res.numberRounds--;
                continue;
            }
        }

        // place blocks
        let homeSwitch = 0;
        let scale = 0;
        let awaySwitch = 0;
        let vault = 0;

        console.log("auton", auton);
        for (const auton_action of auton) {
            const action = auton_action.action;
            console.log("action", action);
            if (action == "0_0_0") {
                res.auton.homeSwitch++;
                homeSwitch++;
            } else if (action == "0_0_1") {
                res.auton.scale++;
                scale++;
            } else if (action == "0_0_2") {
                res.auton.awaySwitch++;
                awaySwitch++;
            } else if (action == "0_0_3") {
                res.auton.vault++;
                vault++;
            }
        }

        console.log("teleop", teleop);
        for (const teleop_action of teleop) {
            const action = teleop_action.action;

            console.log("action", action);
            if (action == "0_0_0") homeSwitch++;
            else if (action == "0_0_1") scale++;
            else if (action == "0_0_2") awaySwitch++;
            else if (action == "0_0_3") vault++;
        }

        console.log("homeSwitch", homeSwitch);

        res.homeSwitch.total += homeSwitch;
        res.homeSwitch.max = Math.max(res.homeSwitch.max, homeSwitch);

        res.scale.total += scale;
        res.scale.max = Math.max(res.scale.max, scale);

        res.awaySwitch.total += awaySwitch;
        res.awaySwitch.max = Math.max(res.awaySwitch.max, awaySwitch);

        res.vault.total += vault;
        res.vault.max = Math.max(res.vault.max, vault);

        // crossed auton line and ended on platform
        if (data.crossed_line == true || data.crossed_line == "true")
            res.auton.crossedLine++;
        if (data.end_platform == true || data.end_platform == "true")
            res.finish.totalPlatform++;

        // start position
        data.start_position = parseInt(data.start_position);
        if (isNaN(data.start_position)) {
            // do nothing
        } else if (data.start_position < -33) {
            res.startingPosition.left++;
        } else if (data.start_position > 33) {
            res.startingPosition.right++;
        } else {
            res.startingPosition.middle++;
        }

        const lift = data.lift;

        // lift
        if (lift == 1 || lift == 2) {
            res.finish.hasRamp = true;
        } else if (lift == 3) {
            res.finish.climb.total++;
            res.finish.climb.totalUsingRamp++;
        } else if (lift == 4) {
            res.finish.climb.total++;
        } else if (lift == 5) {
            res.finish.hasBar++;
            res.finish.climb.total++;
        }

        // comments
        res.comments.push(data.comments);
    }

    // setting averages
    if (res.numberRounds == 0) {
        res.scale.average =
            res.homeSwitch.average =
            res.awaySwitch.average =
            res.vault.average =
                0;
    } else {
        console.log("numberRounds", res.numberRounds);
        res.scale.average = res.scale.total / res.numberRounds;
        res.homeSwitch.average = res.homeSwitch.total / res.numberRounds;
        res.awaySwitch.average = res.awaySwitch.total / res.numberRounds;
        res.vault.average = res.vault.total / res.numberRounds;
    }

    // setting preferred starting position
    if (
        res.startingPosition.left > res.startingPosition.right &&
        res.startingPosition.left > res.startingPosition.middle
    )
        res.startingPosition.preferred = "left";
    else if (
        res.startingPosition.right > res.startingPosition.left &&
        res.startingPosition.right > res.startingPosition.middle
    )
        res.startingPosition.preferred = "right";
    else if (
        res.startingPosition.middle > res.startingPosition.left &&
        res.startingPosition.middle > res.startingPosition.right
    )
        res.startingPosition.preferred = "middle";
    else res.startingPosition.preferred = "unclear";

    return res;
}

/*
  "Upload Data"
  Clients call this route for each round to upload the data they collected
  More documentation at Routes > Upload Data
*/
router.post("/upload", bodyParser.json(), (req, res) => {
    Promise.resolve()
        .then(() => {
            // check if headers are set
            if (typeof req.body.headers !== "object") {
                throw new ScoutingError(
                    422,
                    `POST body headers not set (req.body.headers = ${req.body.headers})`
                );
            }
            if (typeof req.body.headers.email !== "string") {
                req.body.headers.email = req.auth.info.email;
                // throw new ScoutingError(422, `Email not set in POST body headers (req.body.headers.email = ${req.body.headers.email})`)
            }
            req.body.headers.rank = parseInt(req.body.headers.rank, 10);
            if (isNaN(req.body.headers.rank)) {
                throw new ScoutingError(
                    422,
                    `Rank not set in POST body headers (req.body.headers.rank = ${req.body.headers.rank})`
                );
            }
            req.body.headers.round = parseInt(req.body.headers.round, 10);
            if (isNaN(req.body.headers.round)) {
                throw new ScoutingError(
                    422,
                    `Round number not set in POST body headers (req.body.headers.round = ${req.body.headers.round})`
                );
            }
            if (typeof req.body.headers.tournament_id !== "string") {
                throw new ScoutingError(
                    422,
                    `Tournament id not set in POST body headers (req.body.headers.tournament_id = ${req.body.headers.tournament_id})`
                );
            }
            req.body.headers.team = parseInt(req.body.headers.team, 10);
            if (isNaN(req.body.headers.team)) {
                throw new ScoutingError(
                    422,
                    `Team number not set in POST body headers (req.body.headers.team = ${req.body.headers.team})`
                );
            }

            if (!req.body.data) {
                throw new ScoutingError(422, "POST body data not set");
            }

            // check if email in headers matches my email
            if (
                req.body.headers.email.toLowerCase() !==
                    req.auth.info.email.toLowerCase() &&
                req.auth.info.level < ranks.scouting_sergeants
            ) {
                throw new ScoutingError(
                    403,
                    "Email does not match login email"
                );
            }
        })
        // find the user with said email
        .then(() =>
            User.findOne({ email: req.body.headers.email.toLowerCase() })
        )
        .then((user) => {
            if (user == null) {
                return new ScoutingError(
                    422,
                    `User with email ${req.body.headers.email} does not exist`
                );
            }
            if (
                user.authorization < ranks.scouting_sergeants &&
                req.body.headers.rank > scoutingRanks.private
            ) {
                return new ScoutingError(
                    401,
                    `User is not authorized as a scouting sergeant`
                );
            }
        })
        // find the tournament and round
        .then(() => Tournament.findById(req.body.headers.tournament_id))
        .then((tournament) =>
            Round.findOne({
                tournament: tournament._id,
                number: req.body.headers.round,
            })
        )
        // check if user requested this side and round
        .then((round) => {
            if (round == null)
                throw new ScoutingError(
                    404,
                    `Round number ${req.body.headers.round} does not exist in tournament with id ${req.body.headers.tournament_id}`
                );

            // if the user is a sergeant
            if (req.body.headers.rank == scoutingRanks.sergeant) {
                // check if they registered as a sergeant
                if (
                    round.sergeant.toLowerCase() ===
                    req.auth.info.email.toLowerCase()
                ) {
                    round.sergeant_data = req.body.data;
                    return round.save();
                } else
                    throw new ScoutingError(
                        401,
                        `User was not a sergeant for round ${round.number} in tournament with id ${req.body.headers.tournament_id}`
                    );
            }

            // if the user is a private, check the spot
            else {
                if (
                    req.body.headers.blue === true ||
                    req.body.headers.blue === "true"
                ) {
                    var team;
                    if (round.blue.team1.number === req.body.headers.team)
                        team = "team1";
                    else if (round.blue.team2.number === req.body.headers.team)
                        team = "team2";
                    else if (round.blue.team3.number === req.body.headers.team)
                        team = "team3";
                    else
                        throw new ScoutingError(
                            409,
                            `Team with number ${req.body.headers.team} not found in round ${round.number} in tournament with id ${req.body.headers.tournament_id}`
                        );

                    if (round.blue[team].data && !req.body.headers.forceUpload)
                        throw new ScoutingError(
                            409,
                            `Data has already been uploaded for team ${req.body.headers.team} on round ${round.number} in tournament with id ${req.body.headers.tournament_id}`
                        );
                    round.blue[team].data = req.body.data;
                } else if (
                    req.body.headers.blue === false ||
                    req.body.headers.blue === "false"
                ) {
                    var team;
                    if (round.red.team1.number === req.body.headers.team)
                        team = "team1";
                    else if (round.red.team2.number === req.body.headers.team)
                        team = "team2";
                    else if (round.red.team3.number === req.body.headers.team)
                        team = "team3";
                    else
                        throw new ScoutingError(
                            409,
                            `Team with number ${req.body.headers.team} not found in round ${round.number} in tournament with id ${req.body.headers.tournament_id}`
                        );

                    if (round.red[team].data && !req.body.headers.forceUpload)
                        throw new ScoutingError(
                            409,
                            `Data has already been uploaded for team ${req.body.headers.team} on round ${round.number} in tournament with id ${req.body.headers.tournament_id}`
                        );
                    round.red[team].data = req.body.data;
                } else
                    throw new ScoutingError(
                        422,
                        "Blue not set in POST body headers"
                    );
                return round.save();
            }
        })
        .then(() => {
            res.send("200 OK");
        })
        .catch(
            handleScoutingError(req, res, 500, `POST /member/scouting/upload`)
        );
});

router.get("/data", (req, res) => {
    if (req.query.team)
        getDataOnTeam(req.query.team).then((data) => {
            res.render("pages/member/scoutingReview", { data });
        });
    else res.render("pages/member/scoutingGetTeam");
});

router.get("/data/:team", (req, res) => {
    getDataOnTeam(req.params.team).then((data) => {
        res.render("pages/member/scoutingReview", { data });
    });
});

module.exports = router;
