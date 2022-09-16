"use strict";

const express = require("express"),
    fs = require("fs"),
    Blog = require("../../models/blog"),
    https = require("https"),
    session = require("../../helpers/session"),
    cookieParser = require("cookie-parser"),
    nodemailer = require("nodemailer"),
    xss = require("xss"),
    csrf = require("csurf"),
    { OAuth2Client } = require("google-auth-library"),
    Purchase = require("../../models/purchase"),
    User = require("../../models/user"),
    config = require(__base + "config.json"),
    ranks = require("../../helpers/ranks.json"),
    auth = require("../../helpers/auth"),
    email = require("../../helpers/email"),
    router = express.Router(),
    smtpConfig = config.automail,
    transporter = nodemailer.createTransport(smtpConfig),
    csrfProtection = csrf({ cookie: true }),
    client = new OAuth2Client(config.google.clientIDs),
    request = require("request"),
    { google } = require("googleapis"),
    youtube = google.youtube("v3"),
    busboy = require("connect-busboy"),
    path = require("path"),
    fse = require("fs-extra"),
    cron = require("node-cron");

let MACHINING_FILES =
    require.main.filename.split("index.js")[0] + "/machining-files/";

const toNumber = (num, err) => {
    var res = parseInt(num, 10);
    return isNaN(res) ? err.toString() : res;
};

const validateEmail = (email) => {
    var re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

router.use(cookieParser());
router.use(session);

router.use(auth.sessionAuth);

// https://developers.google.com/identity/sign-in/web/backend-auth
async function verifyIdToken(token) {
    return (
        await client.verifyIdToken({
            idToken: token,
            audience: config.google.clientIDs,
        })
    ).getPayload();
}

cron.schedule(config.automail.cronPattern, async () => {
    let awaiting_prs = await Purchase.find({ approval: 2 });
    let n_requests = awaiting_prs.length;

    if (n_requests > 0) {
        let subject, to, text, html;

        if (n_requests == 1) {
            subject = "A purchase request is awaiting your approval.";
        } else {
            subject =
                n_requests + " purchase requests are awaiting your approval.";
        }

        to = config.users.mentor;
        text =
            subject +
            ` You can see all pending requests here:
http://${config.server.domain}/member/purchase/mentor`;

        html =
            subject +
            ` You can see all pending requests here:<br/>
<a href="http://${config.server.domain}/member/purchase/mentor">
http://${config.server.domain}/member/purchase/mentor</a>`;

        email.sendMail(config.automail.auth.email, to, subject, text, html);
    }
});

// https://developers.google.com/identity/sign-in/web/backend-auth
// handles google sign-in tokens given from client
//
// req.body.idtoken - the given idtoken
// req.body.android - (optional) whether the given phone is an android
router.post("/token", function (req, res) {
    let token = req.body.idtoken;
    if (!token) {
        res.status(422).send(
            "No token given (must be given in POST body as `idtoken`)"
        );
        return;
    }

    // send to google
    verifyIdToken(token)
        .then(async (data) => {
            console.log(`[REQ ${req.request_id}] [TOKEN]`, data);

            req.session.auth = {
                loggedin: true,
                token: token,
                info: data,
            };

            // if email is in superadmins list, grant superadmin access
            if (config.users.superadmins.includes(data.email.toLowerCase())) {
                console.log(
                    "Superadmin status granted for",
                    data.email.toLowerCase()
                );

                const existingUser = await User.findOne({
                    email: data.email.toLowerCase(),
                });
                if (existingUser) {
                    User.updateOne(
                        { email: data.email.toLowerCase() },
                        {
                            $set: {
                                firstName: data.given_name,
                                lastName: data.family_name,
                                name: data.name,
                            },
                        }
                    )
                        .then(() => {
                            req.session.auth.level = ranks.superadmin;
                            res.status(200).end();
                        })
                        .catch((err) => {
                            console.error(
                                `[REQ ${req.request_id}] [ERROR] could not update database user:`,
                                err
                            );
                            res.status(401).send(err.toString());
                            req.session.destroy();
                        });
                    // req.session.auth.level = ranks.superadmin
                    // res.status(200).end()
                }

                User.create({
                    email: data.email.toLowerCase(),
                    authorization: ranks.superadmin,
                    firstName: data.given_name,
                    lastName: data.family_name,
                    name: data.name,
                }).then(() => {
                    req.session.auth.level = ranks.superadmin;
                    res.status(200).end();
                });

                return;
            }

            // find the user with the email
            return (
                User.findOne({ email: data.email.toLowerCase() })
                    .then((user) => {
                        // console.log(data);

                        // if the user can't be found in db, put user in db
                        if (user == null) {
                            // if the user has a harker email, allow them the rank of harker student
                            // otherwise give them default rank
                            let authorization = ranks.none;
                            if (
                                data.hd === "students.harker.org" ||
                                data.hd === "staff.harker.org"
                            )
                                authorization = ranks.harker_student;

                            User.create({
                                email: data.email.toLowerCase(),
                                authorization,
                                firstName: data.given_name,
                                lastName: data.family_name,
                                name: data.name,
                            }).then(() => {
                                req.session.auth.level = authorization;
                                res.status(200).send();
                            });
                        } else {
                            // if the user can be found, give appropriate authorization
                            User.updateOne(
                                { email: data.email.toLowerCase() },
                                {
                                    $set: {
                                        firstName: data.given_name,
                                        lastName: data.family_name,
                                        name: data.name,
                                    },
                                }
                            )
                                .then(() => {
                                    req.session.auth.level = user.authorization;
                                    res.status(200).send();
                                })
                                .catch((err) => {
                                    console.error(
                                        `[REQ ${req.request_id}] [ERROR] could not update database user:`,
                                        err
                                    );
                                    res.status(401).send(err.toString());
                                    req.session.destroy();
                                });
                            // req.session.auth.level = user.authorization
                            // res.status(200).send()
                        }
                    })

                    // if there is an error, report and destroy the session
                    .catch((err) => {
                        console.error(
                            `[REQ ${req.request_id}] [ERROR] find user with email (token):`,
                            err
                        );
                        res.status(401).send(err.toString());
                        req.session.destroy();
                    })
            );
        })
        .catch((err) => {
            console.error(
                `[REQ ${req.request_id}] [ERROR] validate token:`,
                err
            );
            req.session.destroy(() => {
                res.status(400).send(err.toString());
            });
        });

    console.log();
});

// logs the user out from the session on the backend
// does not log the user out from the google auth session
router.delete("/token", function (req, res) {
    req.session.destroy(function (err) {
        if (err)
            res.status(500).json({ success: false, error: { message: err } });
        else res.status(200).end();
    });
});

// must be logged in to see below pages
router.all("/*", function (req, res, next) {
    if (req.auth.loggedin) {
        console.log(
            `[REQ ${req.request_id}] Auth: \n\tName: ${req.auth.info.name} \n\tEmail: ${req.auth.info.email} \n\tLevel: ${req.auth.level}`
        );
        next();
    } else {
        res.render("pages/member/login");
    }
});

router.use("/purchase", require("./purchase"));
router.use("/scouting", require("./scouting"));
router.use("/parts", require("./parts"));
router.use("/attendance", require("./attendance"));
router.use("/shortener", require("./shortener"));

router.get("/", function (req, res) {
    console.log(req.auth.info.email);
    res.render("pages/member/index", { name: req.auth.info.name });
});

router.get("/blog", (req, res) => {
    Blog.find({})
        .sort({ createdAt: "desc" })
        .limit(20)
        .then((posts) => {
            res.render("pages/blog", { posts: posts });
        });
});

router.get("/machining/getfiles", (req, res) => {
    fs.readdir(MACHINING_FILES, (err, files) => {
        if (!err) {
            res.json({ files: files });
        }
    });
});

router.get("/machining", (req, res) => {
    res.render("pages/member/machiningFiles", {
        statusMessage: "Upload Completed",
    });
});

// https://stackoverflow.com/questions/23691194/node-express-file-upload
router.post("/machining", (req, res) => {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on("file", function (fieldname, file, filename) {
        console.log("Uploading: " + filename);

        //Path where image will be uploaded
        fstream = fse.createWriteStream(MACHINING_FILES + filename);
        file.pipe(fstream);
        fstream.on("close", function () {
            console.log("Upload Finished of " + filename);
            res.render("pages/member/machiningFiles", {
                statusMessage: "Upload Completed",
            });
        });
    });
});

router.get("/training", (req, res) => {
    youtube.playlistItems.list(
        {
            key: config.google.secretKey,
            part: "id,snippet",
            playlistId: "PL7Cpqic7wNE4fiC5SfmtTijEwN_rZ-Su6",
        },
        (err, results) => {
            if (err) {
                console.log(err.message);
                res.render("pages/member/trainingResources");
            } else {
                let videoItems = results.data.items;
                let videoIdList = [];
                for (let video of videoItems) {
                    videoIdList.push(video.snippet.resourceId.videoId);
                }
                res.render("pages/member/trainingResources", {
                    idList: videoIdList,
                });
            }
        }
    );
});

router.get("/calendar", function (req, res) {
    res.render("pages/member/calendar");
});

router.get("/resources", function (req, res) {
    res.render("pages/member/resources");
});

// must be an superadmin to see below pages
router.all("/*", function (req, res, next) {
    if (req.auth.level >= ranks.superadmin) next();
    else
        res.render("pages/member/error", {
            statusCode: 401,
            error: "You must have higher authorization to reach this page.",
        });
});

function getUsersWithAuth(level) {
    return new Promise(async (resolve, reject) => {
        User.find({ authorization: level }, function (err, users) {
            if (err) {
                reject(err);
                return;
            }
            let result = [];
            for (const user of users) {
                result.push(user.email);
            }
            resolve(result);
        });
    });
}

router.get("/userman", async function (req, res) {
    res.render("pages/member/users", {
        director: await getUsersWithAuth("director"),
        triumvirate: await getUsersWithAuth("triumvirate"),
        mentor: await getUsersWithAuth("mentor"),
    });
});

router.post("/userman/setuserauth", function (req, res) {
    const email = xss(req.body.email);
    const newlevel = toNumber(xss(req.body.level), 0);
    if (!validateEmail(email)) {
        res.status(400).json({
            success: "false",
            error: { message: "Email not valid" },
        });
        return;
    }
    if (newlevel >= ranks.superadmin) {
        res.status(400).json({
            success: "false",
            error: { message: "Authorization level too high" },
        });
        return;
    }
    // updates or inserts a user with given auth level and email
    User.updateOne(
        { email: email },
        { email: email, authorization: newlevel },
        { upsert: true, setDefaultsOnInsert: true },
        function (err, user) {
            if (err) {
                res.status(500).json({
                    success: "false",
                    error: { message: err },
                });
                return;
            }
            if (user == null) {
                res.status(404).json({
                    success: "false",
                    error: { message: "User not found" },
                });
                return;
            }
            res.status(200).send();
        }
    );
});

router.get("/userman/userswithauth/:level", function (req, res) {
    getUsersWithAuth(req.params.level)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            res.status(500).json({ success: "false", error: { message: err } });
        });
    /*
  User.find({ authorization: req.params.level }, function(err, users) {
    if (err){
      res.status(500).json({ success: 'false', error: { message: err }})
      return
    }
    let result = []
    for (const user of users) {
      result.push(user.email)
    }
    res.json(result)
  })
  */
});

router.get("/*", function (req, res, next) {
    res.status(404);
    res.errCode = 404;
    next("URL " + req.originalUrl + " Not Found");
});

router.use(errorHandler);

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    res.status(res.errCode || err.status || 500);
    res.render("pages/member/error", {
        statusCode: res.errCode || err.status || 500,
        error: err,
    });
}

module.exports = router;
