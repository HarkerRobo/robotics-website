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
  port = 80,

  logsRouter = require('./routers/logs'),
  memberRouter = require('./routers/member'),
  hackathonRouter = require('./routers/hackathon'),
  photosRouter = require('./routers/photos'),

  config = require('./config.json')

function getTimeFormatted() {
  return moment().format('MMMM Do YYYY, h:mm:ss a') + ' (' + Date.now() + ')'
}

console.log('Constants made at:', getTimeFormatted())

mongoose.connect('mongodb://127.0.0.1/test', (err) => {
  console.log('Database live on port', port, 'at', getTimeFormatted())
})

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('env', 'development')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('static'))
app.use(compression())
app.use(logRequests)
app.use(logErrors)
app.use(clientErrorHandler)



// letsencrypt-express
var lex = require('letsencrypt-express').create({
  // set to https://acme-v01.api.letsencrypt.org/directory in production
  server: 'staging'

  // If you wish to replace the default plugins, you may do so here
  , challenges: { 'http-01': require('le-challenge-fs').create({ webrootPath: '/tmp/acme-challenges' }) }
  , store: require('le-store-certbot').create({ webrootPath: '/tmp/acme-challenges' })

  , approveDomains: approveDomains
});

function approveDomains(opts, certs, cb) {
  // This is where you check your database and associated
  // email addresses with domains and agreements and such


  // The domains being approved for the first time are listed in opts.domains
  // Certs being renewed are listed in certs.altnames
  if (certs) {
    opts.domains = certs.altnames;
  }
  else {
    opts.email = config['email'];
    opts.agreeTos = true;
  }

  // NOTE: you can also change other options such as `challengeType` and `challenge`
  // opts.challengeType = 'http-01';
  // opts.challenge = require('le-challenge-fs').create({});

  cb(null, { options: opts, certs: certs });
}

/*var LEX = require('letsencrypt-express')

var DOMAIN = config['domain']
console.log("DOMAIN:", DOMAIN)
var EMAIL = config['email']
console.log("EMAIL:", EMAIL)

var lex = LEX.create({
  configDir: require('os').homedir() + '/letsencrypt/etc'
, approveRegistration: function (hostname, approve) { // leave `null` to disable automatic registration
    if (hostname === DOMAIN) { // Or check a database or list of allowed domains
      approve(null, {
        domains: [DOMAIN]
      , email: EMAIL
      , agreeTos: true
      })
    }
  }
})*/



//TODO: Route mobile

// use routers
app.use(function(req, res, next) {
  console.log(app.locals.auth);
  next();
})
app.use('/logs', logsRouter)
app.use('/member', memberRouter)
app.use('/hackathon', hackathonRouter)
app.use('/photos', photosRouter)


// '/' router
app.get('/about', function (req, res) {
  res.render('pages/about')
})

app.get('/photos', function (req, res) {
  res.render('pages/photos')
})

app.get('/', function (req, res) {
  res.render('pages/index')
})

app.get('*', function (req, res, next) {
  res.status(404)
  res.errCode = 404
  next('URL ' + req.originalUrl + ' Not Found')
})


// functions
function logRequests(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  console.log()
  console.log('--- NEW REQUEST ---')
  console.log('Time:', moment().format('MMMM Do YYYY, h:mm:ss a'), '(' + Date.now() + ')')
  console.log('IP: ', ip)
  console.log('Request:', req.originalUrl)
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

// create server
if (config['httpsCapable']===true) {

  /*http.createServer(LEX.createAcmeResponder(lex, function redirectHttps(req, res) {
      res.setHeader('Location', 'https://' + req.headers.host + req.url);
      res.statusCode = 302; // use 307 if you want to redirect requests with POST, DELETE or PUT action.
      res.end('<!-- Hello Developer Person! Please use HTTPS instead -->');
    })).listen(80);

    spdy.createServer(lex.httpsOptions, LEX.createAcmeResponder(lex, app)).listen(443);*/

    // handles acme-challenge and redirects to https
    require('http').createServer(lex.middleware(require('redirect-https')())).listen(80, function () {
      console.log("Listening for ACME http-01 challenges on", this.address());
    });



    var app = require('express')();
    app.use('/', function (req, res) {
      res.end('Hello, World!');
    });

    // handles your app
    require('https').createServer(lex.httpsOptions, lex.middleware(app)).listen(443, function () {
      console.log("Listening for ACME tls-sni-01 challenges and serve app on", this.address());
    });

} else {
  lex.onRequest = app

  lex.listen([80], [443, 5001], function () {
    const protocol = ('requestCert' in this) ? 'https': 'http'
    console.log("Listening at " + protocol + '://' + config['domain'] + ':' + this.address().port)
  })
}
