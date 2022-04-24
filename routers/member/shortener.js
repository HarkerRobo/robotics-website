const express = require("express"),
    https = require("https"),
    session = require("../../helpers/session"),
    cookieParser = require("cookie-parser"),
    nodemailer = require("nodemailer"),
    xss = require("xss"),
    csrf = require("csurf"),
    { OAuth2Client } = require("google-auth-library"),
    User = require("../../models/user"),
    Entry = require("../../models/attendanceEntry");
Review = require("../../models/attendanceReview");
Url = require("../../models/url");

(config = require(__base + "config.json")),
    (ranks = require("../../helpers/ranks.json")),
    (auth = require("../../helpers/auth")),
    (router = express.Router()),
    (smtpConfig = config.automail),
    (transporter = nodemailer.createTransport(smtpConfig)),
    (csrfProtection = csrf({ cookie: true }));

const crypto = require("crypto");

router.use(cookieParser());
router.use(session);

router.use(auth.sessionAuth);

router.use(express.json({ extended: true }));

router.all("/*", function (req, res, next) {
    if (req.auth.level >= ranks.director) {
        next();
    } else {
        res.render("pages/member/error", {
            statusCode: 401,
            error: "Must be a director to use the URL shortener.",
        });
        console.log(req.body);
    }
});

const notAllowed = [
    "about",
    "members",
    "outreach",
    "media",
    "contact",
    "sponsor",
    "privacy",
    "member",
    "blog",
    "calendar",
    "battery",
];

router.get("/", (req, res) => {
    res.render("pages/member/shortener");
});

router.post("/create", async (req, res) => {
    if (!req.body.url || !req.body.short)
        return res.json({ error: "Fill out all fields." }).end();
    if (!stringIsAValidUrl(req.body.url))
        return res.json({ error: "Invalid URL." }).end();
    if (!/[a-zA-Z][a-zA-Z0-9]+/g.test(req.body.short))
        return res.json({ error: "Invalid shortened URL." }).end();
    req.body.short = req.body.short.toLowerCase();
    if (notAllowed.indexOf(req.body.short) >= 0)
        return res.json({ error: "Short URL is an actual page." }).end();
    if (await Url.findOne({ path: req.body.short }))
        return res.json({ error: "Short URL already exists." }).end();
    await Url.create({
        path: req.body.short,
        url: req.body.url,
    });
    res.json({ success: "URL created." }).end();
});

router.get("/urls", async (req, res) => {
    res.json(
        await Url.find(
            {},
            { path: 1, url: 1, uses: 1, _id: 0, createdAt: 1, updatedAt: 1 }
        )
    );
});

router.post("/delete", async (req, res) => {
    if (!req.body.short) return res.json({ error: "Specify short URL" }).end();
    const url = await Url.findOne({ path: req.body.short });
    if (!url) return res.json({ error: "Short URL does not exist." }).end();
    await Url.deleteOne({ path: req.body.short });
    return res.json({ success: "URL was deleted." }).end();
});

//https://stackoverflow.com/questions/30931079/validating-a-url-in-node-js
const stringIsAValidUrl = (s) => {
    try {
        new URL(s);
        return true;
    } catch (err) {
        return false;
    }
};

module.exports = router;
