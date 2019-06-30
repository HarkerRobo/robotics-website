const express = require('express'),

  https = require('https'),
  session = require('../../helpers/session'),
  cookieParser = require('cookie-parser'),
  nodemailer = require('nodemailer'),
  xss = require('xss'),
  csrf = require('csurf'),
  {OAuth2Client} = require('google-auth-library'),

  Purchase = require('../../models/purchase'),
  User = require('../../models/user'),

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


router.get("/scanner", (req, res) => {
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
    console.log(qrData);
    res.json({
        data: qrData
    });
});

router.post("/qrcode", (req, res) => {
    try {
        const decodedQrData = Buffer.from(req.body.qr, "base64").toString("ascii");
        const usernameWithoutRandom = decodedQrData.slice(0, -16);
        const decodedUsername = Buffer.from(usernameWithoutRandom, "base64").toString("ascii");
        const username = decodedUsername.split("").filter((char, index) => index % 5 == 4).join("");
        console.log(username);
        res.json({success: true});
    } catch(e) {
        res.json({success: false});
    }
});

module.exports = router;