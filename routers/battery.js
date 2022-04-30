const express = require("express"),
    https = require("https"),
    session = require("../helpers/session"),
    cookieParser = require("cookie-parser"),
    BatteryScan = require("../models/batteryScan"),
    Battery = require("../models/battery"),
    config = require(__base + "config.json"),
    ranks = require("../helpers/ranks.json"),
    auth = require("../helpers/auth"),
    router = express.Router();

router.use(cookieParser());
router.use(session);

router.use(auth.sessionAuth);

router.use(express.json({ extended: true }));

// router.all('/*', function (req, res, next) {
//     if (req.auth.level >= ranks.harker_student) {
//       next()
//     } else {
//         res.render('pages/member/error', { statusCode: 401, error: "Must be a Harker Student to use the battery system."})
//     }
// });

router.get("/", async (req, res, next) => {
    res.render("pages/battery/batteries.ejs");
});

router.get("/cycles", async (req, res, next) => {
    const batteries = await Battery.find({}).sort({ cycles: -1 });
    res.json(batteries);
});

router.post("/postScan", async (req, res, next) => {
    const split = req.body.data.split("__");
    const id = split[0];
    const scanTime = parseInt(split[1]);
    console.log(req.body);
    await BatteryScan.create({
        id,
        scanTime,
    });

    const battery = await Battery.findOne({ id });
    if (!battery) {
        await Battery.create({
            id: id,
            cycles: 1,
        });
    } else {
        battery.cycles++;
        await battery.save();
    }
    res.end("created");
});

module.exports = router;
