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

  memberRouter = require('./routers/member'),
  hackathonRouter = require('./routers/hackathon'),
  photosRouter = require('./routers/photos'),
  blogsRouter = require('./routers/blogs'),

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

// http://cwe.mitre.org/data/definitions/693
app.use(require('helmet')())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('static'))
app.use(compression())
app.use(logRequests)
app.use(logErrors)
app.use(clientErrorHandler)


//TODO: Route mobile

// use routers
app.use(function(req, res, next) {
  console.log("req.body =", req.body);
  next();
})
if (config.runInternal) app.use('/member', memberRouter)
if (config.blog.runBlog) app.use('/blog', blogsRouter)

app.locals.GoogleClientID = config.GoogleClientIDs[config.GoogleClientIDDisplay]
app.locals.ranks = require('./helpers/ranks.json')

app.use('/hackathon', hackathonRouter)
//app.use('/photos', photosRouter)


// '/' router
app.get('/about', function (req, res) {
  res.render('pages/about')
})

/*app.get('/photos', function (req, res) {
  res.render('pages/photos')
})*/

app.get('/contact', function(req, res) {
  res.render('pages/contact')
})

app.get('/sponsorship', function(req, res) {
  res.render('pages/sponsorship')
})

app.get('/contact/map', function (req, res) {
  res.render('pages/map')
})

app.get('/contact/message', function (req, res) {
  res.render('pages/contactform')
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
// https://medium.com/@bohou/secure-your-nodejs-server-with-letsencrypt-for-free-f8925742faa9
if (config['httpsCapable']===true) {
  // letsencrypt-express
  function approveDomains(opts, certs, cb) {
    if (certs) {
      //opts.domains = certs.altnames;
      opts.domains = [config.domain]
      //opts.email = config['email'];
    }
    else {
      opts.email = config['email'];
      opts.agreeTos = true;
    }
    cb(null, { options: opts, certs: certs });
  }

  const lex = require('greenlock-express').create({
    server: config.httpsStaging ? 'staging' : 'https://acme-v01.api.letsencrypt.org/directory'

    // If you wish to replace the default plugins, you may do so here
    /*, challenges: { 'http-01': require('le-challenge-fs').create({ webrootPath: '/tmp/acme-challenges' }) }
    , store: require('le-store-certbot').create({ webrootPath: '/tmp/acme-challenges' })
    , app: app*/
    , approveDomains: approveDomains
  });

  // handles acme-challenge and redirects to https
  require('http').createServer(require('redirect-https')()).listen(80, function () {
    console.log()
    console.log("--- HTTP REDIRECT ON ---")
    console.log()
  });

  // handles your app
  require('https').createServer(lex.httpsOptions, lex.middleware(app)).listen(443, function () {
    console.log()
    console.log("--- HTTPS SERVER ON ---")
    console.log()
  });
} else {
  const port = config.port || 80
  app.listen(port, () => {
    console.log()
    console.log("--- WEBSERVER ON ---")
    console.log("Listening at http://" + config['domain'] + ':' + port)
    console.log()
  })
}
