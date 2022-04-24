// FIRST ARGUMENT: ID FOR THE EVENT ON TBA
// SECOND ARGUMENT: OBJECTID FOR THE EVENT ON LOCAL DATABASE

// TBA = The Blue Alliance
// https://www.thebluealliance.com

const args = process.argv.slice(2);
const db = require("../db");
const Round = require("../models/round");

const event = args[0]; // the id for the event on TBA
const apiKey = require("../config.json").TBA.apiKey;
const tournament_id = args[1]; // the ObjectId for the tournament in robotics-website database

const options = {
    host: "www.thebluealliance.com",
    port: 443,
    path: `https://www.thebluealliance.com/api/v3/event/${event}/matches?apikey=${apiKey}`,
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "X-TBA-Auth-Key": apiKey,
    },
};

const req = require("https").request(options, (res) => {
    let data = "";
    res.on("data", (d) => {
        data += d;
    });

    res.on("end", () => {
        console.log(data);

        if (res.statusCode !== 200) {
            console.error("There was an error");
            console.error(data);
            process.exit(1);
        }

        data = JSON.parse(data);

        let promises = [];

        for (const round of data) {
            if (round.set_number != "1") continue;

            const round_number = round.match_number;
            const blues = round.alliances.blue.team_keys;
            const reds = round.alliances.red.team_keys;

            promises.push(
                Round.create({
                    tournament: tournament_id,
                    number: round_number,
                    red: {
                        team1: {
                            number: parseInt(reds[0].slice(3)),
                        },
                        team2: {
                            number: parseInt(reds[1].slice(3)),
                        },
                        team3: {
                            number: parseInt(reds[2].slice(3)),
                        },
                    },
                    blue: {
                        team1: {
                            number: parseInt(blues[0].slice(3)),
                        },
                        team2: {
                            number: parseInt(blues[1].slice(3)),
                        },
                        team3: {
                            number: parseInt(blues[2].slice(3)),
                        },
                    },
                })
            );
        }

        Promise.all(promises).then(() => {
            console.log("Done!");
            process.exit(0);
        });
    });
});

req.on("error", (e) => {
    console.error("[ERROR]", e);
});

req.end();
