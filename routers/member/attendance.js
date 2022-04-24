const express = require("express"),
    https = require("https"),
    session = require("../../helpers/session"),
    cookieParser = require("cookie-parser"),
    nodemailer = require("nodemailer"),
    xss = require("xss"),
    csrf = require("csurf"),
    { OAuth2Client } = require("google-auth-library"),
    request = require("request");

(User = require("../../models/user")),
    (Entry = require("../../models/attendanceEntry"));
Review = require("../../models/attendanceReview");

(config = require(__base + "config.json")),
    (ranks = require("../../helpers/ranks.json")),
    (auth = require("../../helpers/auth")),
    (router = express.Router()),
    (smtpConfig = config.automail),
    (transporter = nodemailer.createTransport(smtpConfig)),
    (csrfProtection = csrf({ cookie: true })),
    (subteams = require("../../helpers/subteams.json"));

const crypto = require("crypto");

router.use(cookieParser());
router.use(session);

router.use(auth.sessionAuth);

router.use(express.json({ extended: true }));

router.all("/*", function (req, res, next) {
    if (req.auth.level >= ranks.harker_student) {
        next();
    } else {
        res.render("pages/member/error", {
            statusCode: 401,
            error: "Must be a Harker Student to use the attendance system.",
        });
    }
});

router.get("/", async (req, res) => {
    const todayCheckIns = await Entry.find({
        email: req.auth.info.email.toLowerCase(),
        checkOut: null,
        checkIn: {
            $gte: getToday().getTime(),
        },
    }).exec();
    console.log(todayCheckIns);
    res.render("attendance/pages/member.ejs", {
        checkedIn: !!todayCheckIns.length,
        subteams: subteams,
    });
});

router.get("/checkout", async (req, res) => {
    const todayCheckIns = await Entry.find({
        email: req.auth.info.email.toLowerCase(),
        checkOut: null,
        checkIn: {
            $gte: getToday().getTime(),
            $lte: getTomorrow().getTime(),
        },
    }).exec();
    if (!todayCheckIns.length) {
        throw new Error("You are not checked in.");
    }
    todayCheckIns[0].checkOut = Date.now();
    await todayCheckIns[0].save();
    res.json({ success: "done" });
});

router.get("/scanner", auth.verifyRank(ranks.lead), (req, res) => {
    res.render("attendance/pages/scanner.ejs");
});

router.get("/qrcode", (req, res) => {
    const username = req.auth.info.email.slice(0, -20);
    let newUserName = "";
    for (let i = 0; i < username.length * 2; i++) {
        if (i % 2) {
            newUserName += username[parseInt(i / 2)];
        } else {
            newUserName += crypto.randomBytes(2).toString("hex");
        }
    }
    const usernameBase64 = Buffer.from(newUserName).toString("base64");
    const usernameWithRandom = usernameBase64 + "%" + Date.now();
    const qrData = Buffer.from(usernameWithRandom).toString("base64");
    res.json({
        data: qrData,
    });
});

router.get("/attendance", auth.verifyRank(ranks.lead), (req, res) => {
    res.render("attendance/pages/attendance.ejs");
});

router.post("/qrcode", auth.verifyRank(ranks.lead), async (req, res) => {
    try {
        let dbUser;
        let scanTime;
        let subteams = [];
        try {
            let qr = req.body.qr.split("%");
            subteams = qr[1].split(",");
            const decodedQrData = Buffer.from(qr[0], "base64").toString(
                "ascii"
            );
            scanTime = Number(decodedQrData.split("%")[1]);
            const usernameWithoutRandom = decodedQrData.split("%")[0];
            const decodedUsername = Buffer.from(
                usernameWithoutRandom,
                "base64"
            ).toString("ascii");
            const username = decodedUsername
                .split("")
                .filter((char, index) => index % 5 == 4)
                .join("");
            dbUser = await User.findOne({
                email: username.toLowerCase() + "@students.harker.org",
            }).exec();
            console.log("Attendance scan from " + dbUser.email);
            console.log(scanTime);

            if (!dbUser)
                //check null
                throw new Error();
        } catch (e) {
            console.error(e);
            res.status(400).json({ error: "Invalid QR data." });
            return;
        }

        if (
            dbUser.authorization > req.auth.level &&
            req.auth.level != ranks.checkin_tablet
        )
            throw new Error("You are not authorized to scan this user.");

        if (new Date() - scanTime > 1000 * 60 * 60 * 24 * 365)
            // 1 year expiry
            throw new Error("Expired QR Code.");

        const todayCheckIns = await Entry.find({
            email: dbUser.email,
            checkOut: null,
            checkIn: {
                $gte: getToday().getTime(),
                $lte: getTomorrow().getTime(),
            },
        }).exec();

        if (req.body.checkIn) {
            if (todayCheckIns.length) {
                throw new Error("You are already checked in.");
            }
            console.log("Creating new Attendance Entry");
            await Entry.create({
                email: dbUser.email,
                checkIn:
                    /*new Date().getTimezoneOffset() * -60 * 1000 +*/ Date.now(),
                checkOut: null,
                subteams: subteams,
            });
        } else {
            if (!todayCheckIns.length) {
                throw new Error("You are not checked in.");
            }
            console.log("Ending Attendence Entry");
            todayCheckIns[0].checkOut =
                /*new Date().getTimezoneOffset() * -60 * 1000 + */ Date.now();
            await todayCheckIns[0].save();
        }

        res.json({
            success: true,
            name: dbUser.name,
            username: dbUser.email.replace("@students.harker.org", ""),
        });
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: e.message });
    }
});

router.get(
    "/attendanceEntries",
    auth.verifyRank(ranks.lead),
    async (req, res) => {
        if (
            !req.query.count ||
            !Number.isInteger(+req.query.count) ||
            (req.query.date && Number.isNaN(Date.parse(req.query.date)))
        ) {
            res.status(400).json({ error: "Invalid query" });
            return;
        }

        if (!req.query.date) req.query.date = new Date();
        const maxDate = new Date(Date.parse(req.query.date));
        const count = +req.query.count;

        const testEntries = await (req.query.username
            ? Entry.find({
                  checkIn: { $lte: maxDate.getTime() },
                  email: req.query.username + "@students.harker.org",
              })
            : Entry.find({ checkIn: { $lte: maxDate.getTime() } })
        )
            .sort({ checkOut: -1 })
            .limit(count)
            .exec();
        if (!testEntries.length) {
            res.json({});
            return;
        }
        const lastDate = convertTimeToDate(
            new Date(testEntries[testEntries.length - 1].checkIn)
        );
        const realEntries = await (req.query.username
            ? Entry.find({
                  checkIn: {
                      $lte: maxDate.getTime(),
                      $gte: lastDate.getTime(),
                  },
                  email: req.query.username + "@students.harker.org",
              })
            : Entry.find({
                  checkIn: {
                      $lte: maxDate.getTime(),
                      $gte: lastDate.getTime(),
                  },
              })
        ).sort({ checkOut: -1, email: 1 });

        const dateMap = {};
        for (entry of realEntries) {
            const dateStamp = convertTimeToDate(
                new Date(entry.checkIn)
            ).toISOString();
            if (!dateMap[dateStamp]) {
                dateMap[dateStamp] = [];
            }
            // console.log(dateStamp);
            // console.log(entry.checkIn);
            const review = await Review.findOne({
                email: req.auth.info.email,
                entryId: entry._id,
            });

            dateMap[dateStamp].push({
                id: entry._id,
                email: entry.email,
                checkIn: new Date(entry.checkIn),
                checkOut: entry.checkOut ? new Date(entry.checkOut) : null,
                review: review ? review.rating : null,
            });
        }
        res.json(dateMap);
    }
);

router.post("/review", auth.verifyRank(ranks.lead), async (req, res) => {
    if (
        !req.body.id ||
        !(req.body.rating || req.body.rating === 0) ||
        Number.isNaN(Number(req.body.rating))
    ) {
        res.status(400).json({ error: "invalid query" });
        return;
    }
    const entry = await Entry.findById(req.body.id);
    if (entry == null) {
        res.json({ error: "invalid query" });
    }
    const existingReview = await Review.findOne({
        email: req.auth.info.email,
        entryId: req.body.id,
    });
    if (existingReview) {
        if (existingReview.rating == req.body.rating) {
            await Review.remove({ _id: existingReview._id });
            res.json({ success: "unreviewed" });
            return;
        } else {
            existingReview.rating = req.body.rating;
            await existingReview.save();
        }
    } else {
        const rating = await Review.create({
            email: req.auth.info.email,
            attendanceEmail: entry.email,
            rating: req.body.rating,
            entryId: req.body.id,
        });
    }
    res.json({ success: "reviewed" });
});

router.get(
    "/photos/:username",
    auth.verifyRank(ranks.lead),
    async (req, res) => {
        request(
            `${config.photos.host}/${req.params.username}.jpg?auth=${config.photos.auth}`
        ).pipe(res);
    }
);

router.get(
    "/attendance/:username",
    auth.verifyRank(ranks.lead),
    async (req, res) => {
        const positiveRatings = await Review.find({
            attendanceEmail:
                req.params.username.toLowerCase() + "@students.harker.org",
            rating: 1,
        }).count();
        const neutralRatings = await Review.find({
            attendanceEmail:
                req.params.username.toLowerCase() + "@students.harker.org",
            rating: 0,
        }).count();
        const negativeRatings = await Review.find({
            attendanceEmail:
                req.params.username.toLowerCase() + "@students.harker.org",
            rating: -1,
        }).count();
        res.render("attendance/pages/member_attendance.ejs", {
            username: req.params.username.toLowerCase(),
            positiveRatings: positiveRatings,
            neutralRatings: neutralRatings,
            negativeRatings: negativeRatings,
        });
    }
);

router.post(
    "/attendance/:id",
    auth.verifyRank(ranks.lead),
    async (req, res) => {
        if (
            (req.body.startTime &&
                Number.isNaN(Date.parse(new Date(req.body.startTime)))) ||
            (req.body.endTime &&
                Number.isNaN(Date.parse(new Date(req.body.endTime)))) ||
            (!req.body.startTime && !req.body.endTime)
        ) {
            res.status(400).json({ error: "invalid query" });
            return;
        }
        const entry = await Entry.findOne({
            _id: req.params.id,
        });
        if (entry == null) {
            res.status(404).end("Attendance entry not found");
            return;
        }
        await entry.update({
            checkIn: mergeDateAndTime(
                entry.checkOut || entry.checkIn,
                req.body.startTime
            ),
            checkOut: mergeDateAndTime(
                entry.checkIn || entry.checkOut,
                req.body.endTime
            ),
        });
        res.json({ success: "updated" }).end();
    }
);

router.get(
    "/attendance/export/:date",
    auth.verifyRank(ranks.lead),
    async (req, res) => {
        if (
            !req.params.date ||
            Number.isNaN(Date.parse(new Date(Number(req.params.date))))
        ) {
            res.status(400).json({ error: "invalid query" });
            return;
        }
        req.params.date = Number(req.params.date);
        const startTime = convertTimeToDate(new Date(req.params.date));
        const endTime = getNextDay(startTime);
        const entries = await Entry.find({
            checkIn: {
                $gte: startTime.getTime(),
                $lte: endTime.getTime(),
            },
        });
        res.end(
            generateCSV(
                ["Username", "Check In Time", "Check Out Time"],
                entries.map((entry) => [
                    entry.email.split("@students.harker.org")[0],
                    get12HourTime(entry.checkIn && new Date(entry.checkIn)),
                    get12HourTime(entry.checkOut && new Date(entry.checkOut)),
                    // Number(entry.email.substring(0, 2)) > 22 ? "Camper" : "Helper"
                ])
            )
        );
    }
);

router.get(
    "/attendance/exportAll/:date",
    auth.verifyRank(ranks.lead),
    async (req, res) => {
        if (
            !req.params.date ||
            Number.isNaN(Date.parse(new Date(Number(req.params.date))))
        ) {
            res.status(400).json({ error: "invalid query" });
            return;
        }
        req.params.date = Number(req.params.date) + 1000 * 60 * 60 * 24;
        console.log(new Date(req.params.date));
        const startTime = convertTimeToDate(new Date(req.params.date));
        console.log(startTime);
        const endTime = new Date(Date.now());
        const entries = await Entry.find({
            checkIn: {
                $gte: startTime.getTime(),
                $lte: endTime.getTime(),
            },
        }).sort({ checkIn: 1 });
        res.end(
            generateCSV(
                ["Username", "Date", "Check In Time", "Check Out Time"],
                entries.map((entry) => [
                    entry.email.split("@students.harker.org")[0],
                    convertTimeToDate(new Date(entry.checkIn))
                        .toDateString()
                        .substr(4),
                    get12HourTime(entry.checkIn && new Date(entry.checkIn)),
                    get12HourTime(entry.checkOut && new Date(entry.checkOut)),
                    // Number(entry.email.substring(0, 2)) > 22 ? "Camper" : "Helper"
                ])
            )
        );
    }
);

function mergeDateAndTime(date, time) {
    if (time == null) return null;
    date = new Date(date);
    time = new Date(time);
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes(),
        time.getSeconds()
    ).getTime();
}

function convertTimeToDate(time) {
    return new Date(time.getFullYear(), time.getMonth(), time.getDate());
}

function getNextDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

function getToday() {
    return convertTimeToDate(new Date());
}

function getTomorrow() {
    return getNextDay(getToday());
}

function get12HourTime(time) {
    return time
        ? (time.getHours() % 12) +
              ":" +
              pad(time.getMinutes()) +
              (time.getHours() < 12 ? " AM" : " PM")
        : "None";
}

function pad(number) {
    return number < 10 ? "0" + number : number;
}

function generateCSV(keys, lines) {
    return `${keys.map((key) => `${key}`).join(",")}\n${lines
        .map((values) => values.map((value) => JSON.stringify(value)).join(","))
        .join("\n")}`;
}

module.exports = router;
