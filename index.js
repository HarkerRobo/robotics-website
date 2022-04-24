"use strict";

console.log();
console.log();
console.log("--- PROCESS INITIALIZED ---");
console.log("Time:", Date.now());

global.__base = __dirname + "/";
console.log("__base:", __base);

const express = require("express"),
    ejs = require("ejs"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    moment = require("moment"),
    compression = require("compression"),
    http = require("http"),
    https = require("https"),
    spdy = require("spdy"),
    memberRouter = require("./routers/member"),
    hackathonRouter = require("./routers/hackathon"),
    photosRouter = require("./routers/photos"),
    blogsRouter = require("./routers/blogs"),
    batteryRouter = require("./routers/battery"),
    Url = require("./models/url"),
    config = require("./config.json"),
    request = require("request"),
    { google } = require("googleapis"),
    youtube = google.youtube("v3"),
    busboy = require("connect-busboy");

function getTimeFormatted() {
    return moment().format("MMMM Do YYYY, h:mm:ss a") + " (" + Date.now() + ")";
}

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("env", "production");
app.set("case sensitive routing", true);
if (config.server.production) app.set("trust proxy", 1);

// http://cwe.mitre.org/data/definitions/693

if (config.server.production)
    app.use((req, res, next) => {
        if (req.secure) next();
        else res.redirect("https://" + req.headers.host + req.url);
    });

app.use(busboy());
app.use(redirectTrailingSlash);
app.use(require("helmet")());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("static"));
app.use(compression());
app.use(logRequests);
app.use(logErrors);
app.use(clientErrorHandler);

//TODO: Route mobile

// use routers
if (config.server.runInternal) app.use("/member", memberRouter);
if (config.server.runInternal)
    app.use("/scoutdata", require("./routers/scoutdata"));
app.use("/battery", batteryRouter);
app.use("/blog", blogsRouter);

app.locals.GoogleClientID = config.google.clientIDs[config.google.displayID];
app.locals.config = config;
app.locals.ranks = require("./helpers/ranks.json");

app.use("/hackathon", hackathonRouter);
//app.use('/photos', photosRouter)

app.get("/", (req, res) => {
    res.render("new/pages/index.ejs");
});

app.get("/about", (req, res) => {
    res.render("new/pages/about.ejs");
});

app.get("/calendar", (req, res) => {
    res.render("new/pages/calendar.ejs");
});

app.get("/members", (req, res) => {
    res.render("new/pages/member.ejs");
});

app.get("/outreach", (req, res) => {
    res.render("new/pages/outreach.ejs");
});

app.get("/pastleadership", (req, res) => {
    res.render("new/pages/pastleadership.ejs");
});

app.get("/contact", (req, res) => {
    res.render("new/pages/contact.ejs", {
        sitekey: config.captcha.sitekey,
    });
});

app.get("/sponsor", (req, res) => {
    res.render("new/pages/sponsor.ejs");
});

app.get("/privacy", function (req, res) {
    res.render("pages/privacy");
});

app.get("/media", (req, res) => {
    res.render("new/pages/media.ejs");
});

app.get("/schedule", (req, res) => {
    res.send(
        "3476 973 2910 3859 3374 1619 5507 2102 971 115 4499 2135 1351 5104 6328 5940 5026 1700 1671 5419 114 8033 2168 1690 2659 5460 254 4414 846 1868 670 1072 3538 3647 8736 8 1678 971 2910 604 649 1700 1690 5940 254 846 5460 3859 2168 2659 2135 6328 5026 670 114 8736 3476 4499 3647 5507 1868 3538 1619 2102 1678 8033 649 973 4414 1351 115 8 5419 604 3374 5104 1072 1671 2102 2910 5026 3647 5940 3476 115 973 1619 6328 4499 2659 8 1678 2135 5460 8736 5419 254 846 649 2168 5507 1671 3374 1351 1690 670 1868 114 8033 3538 4414 971 3859 1072 5104 1700 5460 604 1619 4499 5026 2135 1671 2102 846 114 1072 3476 1351 8 971 2659 5940 8736 2168 3374 1700 4414 604 1678 5104 973 8033 254 6328 115 2910 1690 3538 3859 649 1868 5507 5419 670 3647 4414 2102 2168 1072 973 604 1671 3374 8 1700 1678 4499 3647 1619 846 1351 3859 5419 114 6328 2135 3538 2910 5104 8033 5940 971 5507 670 2659 5026 3476 5460 115 8736 649 1868 1690 2102 254 4414 5104 5419 8033 2659 5940 3374 3538 3647 1700 973 670 5460 2135 8736 604 846 3476 6328 1690 4499 1868 1351 5507 2910 1072 114 649 3859 1619 1678 1671 5026 971 115 2168 8 254 4414 4499 3476 2135 604 2910 3859 1700 670 1072 114 5460 973 1868 5104 3538 846 971 1351 1678 8736 5940 1671 115 1619 8033 5507 5026 8 1690 254 3374 2102 649 5419 6328 3647 2168 1678 2659 5104 3476 8 604 3859 5026 8736 1868 6328 1671 3538 4414 5507 5460 846 2659 115 1700 8033 2910 670 2168 971 1619 5419 2102 3374 4499 114 1351 254 3647 649 5940 1072 2135 1690 973 5419 5026 1678 4414 670 2910 5507 3859 115 5104 846 3374 4499 2168 5460 1351 8033 2135 3647 1671 1690 971 6328 973 8 1868 1072 5940 1619 114 2659 1700 3538 604 254 3476 8736 6328 8033 2102 649 1351 1690 5460 971 3374 5026 2168 4414 5940 604 3647 115 114 5104 8 670 3476 1671 1868 1619 2910 2659 8736 2135 254 4499 846 1072 3538 1678 649 5419 1700 5507 973 3859 2102"
    );
});

/** shortlinks **/

// app.get("/intro", (req, res) => {
//   res.redirect("https://www.youtube.com/playlist?list=PL7Cpqic7wNE46H1Ndz03dwn_6nFvS9zyc");
// });

// app.get("/safetycontract", (req, res) => {
//   res.redirect("/img/media/direc/forms/RoboticsLabSafetyContract.pdf");
// });

// app.get("/1072roster", (req, res) => {
//   res.redirect("https://docs.google.com/spreadsheets/u/2/d/1Lua7IpreBmSZlf8dKEk6iljFpoun17RMcPn-4SOLpIc/edit?usp=sharing_eip&ts=5d8107da&urp=gmail_link");
// });

app.use(async (req, res, next) => {
    if (req.originalUrl.substring(1).indexOf("/") >= 0) {
        next();
    } else {
        const path = req.originalUrl.substring(1).toLowerCase();
        const test = await Url.findOne({ path });
        if (test) {
            console.log("REDIRect");
            test.update({ $inc: { uses: 1 } }).exec();
            // console.log(test);
            res.redirect(test.url);
        } else {
            next();
        }
    }
});
/** end **/

app.post("/contact", (req, res) => {
    var captcha_res = req.body["g-recaptcha-response"];
    if (
        captcha_res === undefined ||
        captcha_res === "" ||
        captcha_res === null
    ) {
        res.render("new/pages/contact.ejs", {
            message: "Please complete the captcha.",
            sitekey: config.captcha.sitekey,
        });
    } else {
        var captcha_url =
            "https://www.google.com/recaptcha/api/siteverify?secret=" +
            config.captcha.secret +
            "&response=" +
            captcha_res +
            "&remoteip=" +
            req.connection.remoteAddress;

        request(captcha_url, function (error, response, body) {
            body = JSON.parse(body);

            if (body.success !== undefined && !body.success) {
                res.render("new/pages/contact.ejs", {
                    message: "Captcha failed.",
                    sitekey: config.captcha.sitekey,
                });
            } else {
                request(
                    {
                        url: config.contacturl,
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        json: {
                            text: `*Email*: ${req.body.email}\n*Name*: ${req.body.name}\n*Organization*: ${req.body.organization}\n*Topic*: ${req.body.topic}\n*Message:* ${req.body.message}`,
                        },
                    },
                    function (err, resp, body) {}
                );
                res.render("new/pages/contact.ejs", {
                    message: "Thank you for contacting us!",
                    sitekey: config.captcha.sitekey,
                });
            }
        });
    }
});
// app.post("/contact", (req, res) => {
//   request({
//     url: config.contacturl,
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     json: {
//       text: `*Email*: ${req.body.email}\n*Name*: ${req.body.name}\n*Organization*: ${req.body.organization}\n*Topic*: ${req.body.topic}\n*Message:* ${req.body.message}`
//     }
//   }, function(err, resp, body) {
//   });
//   res.render("new/pages/contact.ejs", {
//     message: "Thank you for contacting us!",
//     sitekey: config.captcha.sitekey
//   })
// });
/*app.get('/photos', function (req, res) {
  res.render('pages/photos')
})*/

app.get("/summersignup", function (req, res) {
    res.redirect("https://forms.gle/hUUqJxHaUHzd8UrD6");
});

app.get("*", function (req, res, next) {
    res.status(404);
    res.errCode = 404;
    next("URL " + req.originalUrl + " Not Found");
});

let request_id = 0;

function redirectTrailingSlash(req, res, next) {
    if (
        req.url != "/" &&
        req.url.slice(-1) == "/" &&
        req.url.indexOf("attendance") != -1
    ) {
        if (req.method == "POST") {
            res.sendStatus(404).end();
        } else {
            res.redirect(req.url.slice(0, -1));
        }
    } else {
        next();
    }
}

// functions
function logRequests(req, res, next) {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    req.request_id = request_id;
    request_id++;

    console.log();
    console.log(`--- NEW REQUEST: ${req.request_id} ---`);
    console.log(
        `[REQ ${req.request_id}] Time: ${moment().format(
            "MMMM Do YYYY, h:mm:ss a"
        )} (${Date.now()})`
    );
    console.log(`[REQ ${req.request_id}] IP: ${ip}`);
    console.log(
        `[REQ ${req.request_id}] Request: ${req.method} ${req.originalUrl}`
    );
    console.log(`[REQ ${req.request_id}] req.body =`, req.body);
    next();
}

app.use(errorHandler);

function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}

function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).render("pages/error", {
            statusCode: 500,
            error: "Something failed!",
        });
    } else {
        next(err);
    }
}

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    res.status(res.errCode || err.status || 500);
    res.render("pages/error", {
        statusCode: res.errCode || err.status || 500,
        error: err,
    });
}

process.on("unhandledRejection", (reason, p) => {
    console.log("[ERROR] Unhandled Rejection:", p);
});

const port = config.server.port || 5000;
const server = app
    .listen(port, () => {
        console.log();
        console.log("--- WEBSERVER ON ---");
        console.log("Listening at http://" + config.server.domain + ":" + port);
        console.log();
    })
    .on("error", (err) => {
        console.error("Connection error:", err);
    });
