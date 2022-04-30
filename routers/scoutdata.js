const bodyParser = require("body-parser");
const express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    Tournament = require("../models/tournament"),
    Round = require("../models/round");

router.get("/all", (req, res) => {
    (async () => {
        const tournament = await Tournament.getCurrentTournament();

        const rounds = await Round.find({ tournament }).exec();
        res.json(rounds);
    })().catch((e) => {
        console.error(e);
        res.status(500).send(e.toString());
    });
});

function tsvfmt(json) {
    if (typeof json !== "string") json = JSON.stringify(json);
    return json.replace(/\t/g, "    ");
}

router.get("/tsv", (req, res) => {
    (async () => {
        const tournament = await Tournament.getCurrentTournament();

        const rounds = await Round.find({ tournament }).exec();
        if (req.query.tsv) {
            res.header(
                "Content-Type",
                "text/tab-separated-values; charset=utf-8"
            );
        } else {
            res.header("Content-Type", "text; charset=utf-8");
        }
        res.write(
            "match\tteam\tcolor\tnumber\tscout\tstartpos\tcrossedline\tendplatform\tlift\tauton switch\tauton scale\tauton vault\tteleop switch\tteleop scale\tteleop vault\tcomments"
        );
        for (let round of rounds) {
            for (let k of [
                "red,team1",
                "red,team2",
                "red,team3",
                "blue,team1",
                "blue,team2",
                "blue,team3",
            ]) {
                const [color, team] = k.split(",");
                const data = round[color][team];
                if (!data.data) continue;
                const d = data.data;
                if (typeof d["auton-actions"] === "string")
                    d["auton-actions"] = JSON.parse(d["auton-actions"]);
                if (typeof d["teleop-actions"] === "string")
                    d["teleop-actions"] = JSON.parse(d["teleop-actions"]);
                d.comments = (d.comments || "")
                    .replace(/\n/g, "\\n")
                    .replace(/\t/g, "\\t");
                try {
                    d.comments = JSON.parse(d.comments);
                } catch (e) {
                    // ignore
                }
                res.write(
                    `\n${round.number}\t${team}\t${color}\t${data.number}\t${data.scout}\t${d.start_position}\t${d.crossed_line}` +
                        `\t${d.end_platform}\t${d.lift}` +
                        `\t${
                            d["auton-actions"].filter(
                                (a) =>
                                    a.action == "0_0_0" || a.action == "0_0_2"
                            ).length
                        }` +
                        `\t${
                            d["auton-actions"].filter(
                                (a) => a.action == "0_0_1"
                            ).length
                        }` +
                        `\t${
                            d["auton-actions"].filter(
                                (a) => a.action == "0_0_3"
                            ).length
                        }` +
                        `\t${
                            d["teleop-actions"].filter(
                                (a) =>
                                    a.action == "0_0_0" || a.action == "0_0_2"
                            ).length
                        }` +
                        `\t${
                            d["teleop-actions"].filter(
                                (a) => a.action == "0_0_1"
                            ).length
                        }` +
                        `\t${
                            d["teleop-actions"].filter(
                                (a) => a.action == "0_0_3"
                            ).length
                        }` +
                        `\t${d.comments
                            .replace(/\n/g, "\\n")
                            .replace(/\t/g, "\\t")}`
                );
            }
        }
        res.status(200).end();
    })().catch((e) => {
        console.error(e);
        res.status(500).send(e.toString());
    });
});

module.exports = router;
