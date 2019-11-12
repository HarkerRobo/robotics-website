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
  Url = require("./models/url"),

  config = require('./config.json'),
  request = require("request");

function getTimeFormatted() {
  return moment().format('MMMM Do YYYY, h:mm:ss a') + ' (' + Date.now() + ')'
}

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('env', 'production')
app.set('case sensitive routing', true);
if (config.server.production) app.set('trust proxy', 1)

// http://cwe.mitre.org/data/definitions/693

app.use((req, res, next) => {
  if(req.secure)
    next();
  else
    res.redirect('https://' + req.headers.host + req.url);
});

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

app.get("/media", (req, res) => {
  res.render("new/pages/media.ejs");
});

app.get("/contact", (req, res) => {
  res.render("new/pages/contact.ejs");
})

app.get("/sponsor", (req, res) => {
  res.render("new/pages/sponsor.ejs");
})

app.get('/privacy', function (req, res) {
  res.render('pages/privacy')
})

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

app.use( async (req, res, next) => {

  if(req.originalUrl.substring(1).indexOf("/") >= 0) {
    next();
  } else {
    const test = await Url.findOne({path: req.originalUrl.substring(1)});
    if(test) {
      console.log("REDIRect");
      test.update({$inc: {uses: 1}}).exec();
      // console.log(test);
      res.redirect(test.url);
    } else {
      console.log("teehee");
      next();
    }
  }
});
/** end **/


app.post("/contact", (req, res) => {
  request({
    url: "https://hooks.slack.com/services/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",
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    json: {
      text: `*Email*: ${req.body.email}\n*Name*: ${req.body.name}\n*Organization*: ${req.body.organization}\n*Topic*: ${req.body.topic}\n*Message:* ${req.body.message}`
    }
  });
  res.render("new/pages/contact.ejs", {
    message: "Thank you for contacting us!"
  })
});
/*app.get('/photos', function (req, res) {
  res.render('pages/photos')
})*/

app.get('/summersignup', function (req, res) {
  res.redirect('https://forms.gle/hUUqJxHaUHzd8UrD6');
});

app.get('*', function (req, res, next) {
  res.status(404)
  res.errCode = 404
  next('URL ' + req.originalUrl + ' Not Found')
})

let request_id = 0

function redirectTrailingSlash(req, res, next) {
  if(req.url != "/" && req.url.slice(-1) == "/" && req.url.indexOf("attendance") != -1) { 
    if(req.method == "POST") {
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


const port = config.server.port || 80
const server = app.listen(port, () => {
  console.log()
  console.log("--- WEBSERVER ON ---")
  console.log("Listening at http://" + config.server.domain + ':' + port)
  console.log()
}).on('error', (err) => {
  console.error('Connection error:', err);
})
