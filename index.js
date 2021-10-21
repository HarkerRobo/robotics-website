'use strict'

console.log()
console.log()
console.log('--- PROCESS INITIALIZED ---')
console.log('Time:', Date.now())

global.__base = __dirname + '/'
console.log("__base:", __base)

const express = require('express'),
    ejs = require('ejs'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    compression = require('compression'),
    http = require('http'),
    https = require('https'),
    spdy = require('spdy'),

    memberRouter = require('./routers/member'),
    hackathonRouter = require('./routers/hackathon'),
    photosRouter = require('./routers/photos'),
    blogsRouter = require('./routers/blogs'),
    batteryRouter = require("./routers/battery"),
    Url = require("./models/url"),

    config = require('./config.json'),
    request = require("request"),
    { google } = require('googleapis'),
    youtube = google.youtube('v3'),

    busboy = require('connect-busboy');


function getTimeFormatted() {
    return moment().format('MMMM Do YYYY, h:mm:ss a') + ' (' + Date.now() + ')'
}

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('env', 'production')
app.set('case sensitive routing', true);
if (config.server.production) app.set('trust proxy', 1)

// http://cwe.mitre.org/data/definitions/693

if (config.server.production)
    app.use((req, res, next) => {
        if (req.secure)
            next();
        else
            res.redirect('https://' + req.headers.host + req.url);
    });

app.use(busboy())
app.use(redirectTrailingSlash);
app.use(require('helmet')())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('static'))
app.use(compression())
app.use(logRequests)
app.use(logErrors)
app.use(clientErrorHandler)


//TODO: Route mobile

// use routers
if (config.server.runInternal) app.use('/member', memberRouter)
if (config.server.runInternal) app.use('/scoutdata', require('./routers/scoutdata'))
app.use("/battery", batteryRouter);
app.use('/blog', blogsRouter)

app.locals.GoogleClientID = config.google.clientIDs[config.google.displayID]
app.locals.config = config
app.locals.ranks = require('./helpers/ranks.json')

app.use('/hackathon', hackathonRouter)
    //app.use('/photos', photosRouter)

app.get("/", (req, res) => {
    res.render("new/pages/index.ejs");
})

app.get("/about", (req, res) => {
    res.render("new/pages/about.ejs");
});

app.get("/calendar", (req, res) => {
    res.render("new/pages/calendar.ejs");
});

app.get("/members", (req, res) => {
    res.render("new/pages/member.ejs");
})

app.get("/outreach", (req, res) => {
    res.render("new/pages/outreach.ejs");
});

app.get("/pastleadership", (req, res) => {
    res.render("new/pages/pastleadership.ejs");
});

app.get("/contact", (req, res) => {
    res.render("new/pages/contact.ejs", {
        sitekey: config.captcha.sitekey
    });
})

app.get("/sponsor", (req, res) => {
    res.render("new/pages/sponsor.ejs");
})

app.get('/privacy', function(req, res) {
    res.render('pages/privacy')
})

app.get("/media", (req, res) => {
    res.render("new/pages/media.ejs");
});

app.get("/schedule", (req, res) => {
    res.send("115 649 1671 1619 973 5026 1351 254 3476 2168 2910 604 5104 4499 971 5460 1690 2102 3256 5507 8736 3374 6328 114 3647 670 3538 8033 846 5940 1868 4414 1700 2135 1072 8 1678 3859 1671 5419 2659 254 4499 2102 3374 5026 3476 8033 114 1868 115 5104 670 604 5507 2659 5940 1351 1690 5419 5460 3256 1700 8 1678 973 3859 1072 2168 3538 2135 846 6328 649 1619 3647 4414 8736 2910 3256 8 971 5940 254 5026 1072 1671 604 3476 4499 115 3647 1351 3859 2102 1700 1690 2168 973 5104 8736 114 1619 846 1678 3374 2910 5460 6328 2135 5507 1868 670 5419 2659 3538 8033 649 4414 971 3374 8736 1351 8 5460 254 1690 115 5026 6328 3647 2168 604 1619 971 4499 1678 5507 2659 973 649 1072 5419 846 1700 2135 5940 114 8033 3859 2102 3476 1671 3256 670 4414 3538 2910 5026 1868 5104 1690 649 254 2135 5940 115 1678 8 971 8033 6328 846 604 670 973 2102 2910 8736 2659 1619 1072 3476 5507 3859 5104 3256 3647 3374 1351 1868 4499 2168 5460 114 5419 3538 1671 4414 2910 5940 1700 5507 5026 2102 604 3256 1690 846 649 3538 3859 6328 973 3476 3374 5460 8736 115 3647 1072 8033 5419 2168 4499 8 670 1700 1868 1678 254 114 2659 4414 2135 1351 971 1619 1671 5104 5419 5507 2910 5026 8 649 604 3374 4414 5940 3647 973 1868 8033 1619 1690 254 1671 1700 6328 1351 1072 2102 3538 115 670 2168 1678 971 3256 2659 5104 5460 8736 4499 2135 846 3859 8 3476 114 1690 1072 3374 1868 3256 1671 2168 2135 2102 3647 254 973 5507 4414 3538 5104 5419 604 115 2659 3476 1700 5940 5460 1619 846 5026 670 3859 1351 649 114 1678 2910 6328 8033 4499 8736 973 5419 971 3476 1868 2135 670 1690 649 1700 3374 5460 846 4499 5507 4414 115 604 8 3538 2102 2168 1619 114 1072 254 5026 3647 971 5104 8033 2910 2659 3256 3859 1351 1671 5940 1678 6328 8736 2102 114 5419 115 3374 1619 971 3859 5460 1868 5026 604 1072 5940 1690 1671 670 2910 4414 8033 973 1351 5507 2168 3476 8 5104 1678 649 3647 846 254 8736 4499 3538 1700 3256 6328 5026 2659 2135 604");
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

app.use(async(req, res, next) => {

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
    var captcha_res = req.body["g-recaptcha-response"]
    if (captcha_res === undefined || captcha_res === '' || captcha_res === null) {
        res.render("new/pages/contact.ejs", {
            message: "Please complete the captcha.",
            sitekey: config.captcha.sitekey
        })
    } else {
        var captcha_url = "https://www.google.com/recaptcha/api/siteverify?secret=" + config.captcha.secret + "&response=" + captcha_res + "&remoteip=" + req.connection.remoteAddress

        request(captcha_url, function(error, response, body) {
            body = JSON.parse(body);

            if (body.success !== undefined && !body.success) {
                res.render("new/pages/contact.ejs", {
                    message: "Captcha failed.",
                    sitekey: config.captcha.sitekey
                })
            } else {
                request({
                    url: config.contacturl,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    json: {
                        text: `*Email*: ${req.body.email}\n*Name*: ${req.body.name}\n*Organization*: ${req.body.organization}\n*Topic*: ${req.body.topic}\n*Message:* ${req.body.message}`
                    }
                }, function(err, resp, body) {});
                res.render("new/pages/contact.ejs", {
                    message: "Thank you for contacting us!",
                    sitekey: config.captcha.sitekey
                })
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

app.get('/summersignup', function(req, res) {
    res.redirect('https://forms.gle/hUUqJxHaUHzd8UrD6');
});

app.get('*', function(req, res, next) {
    res.status(404)
    res.errCode = 404
    next('URL ' + req.originalUrl + ' Not Found')
})

let request_id = 0

function redirectTrailingSlash(req, res, next) {
    if (req.url != "/" && req.url.slice(-1) == "/" && req.url.indexOf("attendance") != -1) {
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
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    req.request_id = request_id
    request_id++

    console.log()
    console.log(`--- NEW REQUEST: ${req.request_id} ---`)
    console.log(`[REQ ${req.request_id}] Time: ${ moment().format('MMMM Do YYYY, h:mm:ss a')} (${Date.now()})`)
    console.log(`[REQ ${req.request_id}] IP: ${ip}`)
    console.log(`[REQ ${req.request_id}] Request: ${req.method} ${req.originalUrl}`)
    console.log(`[REQ ${req.request_id}] req.body =`, req.body);
    next()
}

app.use(errorHandler)

function logErrors(err, req, res, next) {
    console.error(err.stack)
    next(err)
}

function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).render('pages/error', { statusCode: 500, error: 'Something failed!' })
    } else {
        next(err)
    }
}

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err)
    }
    res.status(res.errCode || err.status || 500)
    res.render('pages/error', { statusCode: res.errCode || err.status || 500, error: err })
}

process.on('unhandledRejection', (reason, p) => {
    console.log('[ERROR] Unhandled Rejection:', p);
})


const port = config.server.port || 5000
const server = app.listen(port, () => {
    console.log()
    console.log("--- WEBSERVER ON ---")
    console.log("Listening at http://" + config.server.domain + ':' + port)
    console.log()
}).on('error', (err) => {
    console.error('Connection error:', err);
})