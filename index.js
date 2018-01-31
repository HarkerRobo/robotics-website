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

  config = require('./config.json')

function getTimeFormatted() {
  return moment().format('MMMM Do YYYY, h:mm:ss a') + ' (' + Date.now() + ')'
}

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('env', 'development')
if (config.server.production) app.set('trust proxy', 1)

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
if (config.server.runInternal) app.use('/member', memberRouter)
if (config.blog.runBlog) app.use('/blog', blogsRouter)

app.locals.GoogleClientID = config.google.clientIDs[config.google.displayID]
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


const port = config.server.port || 80
app.listen(port, () => {
  console.log()
  console.log("--- WEBSERVER ON ---")
  console.log("Listening at http://" + config.server.domain + ':' + port)
  console.log()
})
