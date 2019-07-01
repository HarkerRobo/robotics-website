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

        if(req.body.checkIn) {
            const todayCheckIns = await Entry.find({
                email: dbUser.email,
                checkOut: null,
                checkIn: {
                    $gte: getToday(),
                    $lte: getTomorrow()
                }
            }).exec();
            if(todayCheckIns.length) {
                throw new Error("You are already checked in.");
            }
            console.log("Creating new Attendance Entry")
            await Entry.create({
                email: dbUser.email,
                checkIn: Date.now(),
                checkOut: null
            });
        } else {
            const todayCheckIns = await Entry.findOne({
                email: dbUser.email,
                checkOut: null,
                checkIn: {
                    $gte: getToday(),
                    $lte: getTomorrow()
                }
            }).exec();
            if(!todayCheckIns) {
                throw new Error("You are not checked in.");
            }
            console.log("Ending Attendence Entry");
            todayCheckIns.checkOut = Date.now();
            await todayCheckIns.save();
        }

        res.json({"success": true});
    } catch(e) {
        res.json({"error": e.message});
    }
});

router.get("/attendence", auth.verifyRank(ranks.triumvirate), async (req, res) => {
    
})



function getToday() {
    return new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDay());
}

function getTomorrow() {
    return new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDay() + 1);
}

module.exports = router;