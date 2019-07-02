const express = require('express'),

  https = require('https'),
  session = require('../../helpers/session'),
  cookieParser = require('cookie-parser'),
  nodemailer = require('nodemailer'),
  xss = require('xss'),
  csrf = require('csurf'),
  {OAuth2Client} = require('google-auth-library'),

  User = require('../../models/user'),
  Entry = require("../../models/attendanceEntry");
  Review = require("../../models/attendanceReview");

  config = require(__base + 'config.json'),
  ranks = require('../../helpers/ranks.json'),
  auth = require('../../helpers/auth'),
  router = express.Router(),
  smtpConfig = config.automail,
  transporter = nodemailer.createTransport(smtpConfig),
  csrfProtection = csrf({ cookie: true })

const crypto = require("crypto");

router.use(cookieParser())
router.use(session)

router.use(auth.sessionAuth)

router.use(express.json({extended: true}));

router.all('/*', function (req, res, next) {
    if (req.auth.level >= ranks.harker_student) {
      next()
    } else {
        res.render('pages/member/error', { statusCode: 401, error: "Must be a Harker Student to use the attendance system."})
    }
});

router.get("/", (req, res) => {
    res.render("attendance/pages/member.ejs");
});


router.get("/scanner", auth.verifyRank(ranks.director), (req, res) => {
    res.render("attendance/pages/scanner.ejs")
});


router.get("/qrcode", (req, res) => {
    const username = req.auth.info.email.slice(0, -20);
    let newUserName = "";
    for(let i = 0;i < username.length * 2;i ++) {
        if(i % 2) {
            newUserName += username[parseInt(i / 2)];
        } else {
            newUserName += crypto.randomBytes(2).toString("hex");
        }
    }
    const usernameBase64 = Buffer.from(newUserName).toString("base64");
    const usernameWithRandom = usernameBase64 + crypto.randomBytes(8).toString("hex");
    const qrData = Buffer.from(usernameWithRandom).toString("base64");
    res.json({
        data: qrData
    });
});

router.get("/attendance", (req, res) => {
    res.render("attendance/pages/attendance.ejs");
});

router.post("/qrcode", auth.verifyRank(ranks.director), async (req, res) => {
    try {
        let dbUser;
        try {
            const decodedQrData = Buffer.from(req.body.qr, "base64").toString("ascii");
            const usernameWithoutRandom = decodedQrData.slice(0, -16);
            const decodedUsername = Buffer.from(usernameWithoutRandom, "base64").toString("ascii");
            const username = decodedUsername.split("").filter((char, index) => index % 5 == 4).join("");
            dbUser = await User.findOne({email: username.toLowerCase() + "@students.harker.org"}).exec();
            console.log("Attendnace scan from " + dbUser.email);
            if(!dbUser) //check null
                throw new Error();
        } catch(e) {
            res.json({error: "Invalid QR data."});
        }

        const todayCheckIns = await Entry.find({
            email: dbUser.email,
            checkOut: null,
            checkIn: {
                $gte: getToday().getTime(),
                $lte: getTomorrow().getTime()
            }
        }).exec();

        if(req.body.checkIn) {
            if(todayCheckIns.length) {
                throw new Error("You are already checked in.");
            }
            console.log("Creating new Attendance Entry")
            await Entry.create({
                email: dbUser.email,
                checkIn: /*new Date().getTimezoneOffset() * -60 * 1000 +*/ Date.now(),
                checkOut: null
            });
        } else {
            if(!todayCheckIns) {
                throw new Error("You are not checked in.");
            }
            console.log("Ending Attendence Entry");
            todayCheckIns[0].checkOut = /*new Date().getTimezoneOffset() * -60 * 1000 + */Date.now();
            await todayCheckIns[0].save();
        }

        res.json({"success": true});
    } catch(e) {
        console.error(e);
        res.json({"error": e.message});
    }
});

router.get("/attendanceEntries", auth.verifyRank(ranks.triumvirate), async (req, res) => {
    if(!req.query.count || !Number.isInteger(+req.query.count) || (req.query.date && Number.isNaN(Date.parse(req.query.date)))) {
        res.json({"error": "Invalid query"});
        return;
    }

    if(!req.query.date) req.query.date = new Date();
    const maxDate = new Date(Date.parse(req.query.date));
    const count = +req.query.count;

    const testEntries = await Entry.find({checkIn: {$lte: maxDate.getTime()}})
                                   .sort({checkIn: -1})
                                   .limit(count)
                                   .exec();
    if(!testEntries.length) {
        res.json({});
        return;
    }
    const lastDate = convertTimeToDate(new Date(testEntries[testEntries.length - 1].checkIn));
    const realEntries = await Entry.find({
        checkIn: {
            $lte: maxDate.getTime(),
            $gte: lastDate.getTime()
        }
    })
    .sort({checkIn: -1, email: 1});

    const dateMap = {};
    realEntries.forEach((entry) => {
        const dateStamp = convertTimeToDate(new Date(entry.checkIn)).toISOString();

        if(!dateMap[dateStamp]) {
            dateMap[dateStamp] = [];
        }
        console.log(dateStamp);
        console.log(entry.checkIn);
        dateMap[dateStamp].push({
            email: entry.email,
            checkIn: new Date(entry.checkIn),
            checkOut: entry.checkOut ? new Date(entry.checkOut) : null
        });
    });
    res.json(dateMap);
})

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

module.exports = router;