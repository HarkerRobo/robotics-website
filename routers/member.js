'use strict'

const express = require('express'),
  router = express.Router(),
  moment = require('moment'),
  session = require('express-session'),
  config = require(__base + 'config.json')
  //RedisStore = require('connect-redis')(express)


router.use(function logRequest(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  console.log()
  console.log('--- NEW REQUEST ---')
  console.log('Time:', moment().format('MMMM Do YYYY, h:mm:ss a'), '(' + Date.now() + ')')
  console.log('IP: ', ip)
  console.log('Request:', req.originalUrl)
  console.log('Router: member.js')
  next()
})


// DO NOT UPLOAD: CAUSES MEMORY LEAKS
// For more information, go to https://github.com/expressjs/session#compatible-session-stores
router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

//router.use(express.cookieParser())
/*router.use(expres.session({
  store: new RedisStore({
    host: 'localhost',
    port: 80,
    db: 2,
    pass
  })
}))*/


router.get('/login', function (req, res) {
  res.render('pages/member/login')
})

router.get('/register', function (req, res) {
  res.render('pages/member/register')
})

router.get('/', function (req, res) {
  res.render('pages/member/index')
})

router.get('/*', function (req, res, next) {
  res.status(404)
  res.errCode = 404
  next('URL ' + req.originalUrl + ' Not Found')
})

router.use(logErrors)
router.use(clientErrorHandler)
router.use(errorHandler)

function logErrors(err, req, res, next) {
  console.error(err.stack)
  next(err)
}

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(500).render('pages/member/error', { statusCode: 500, error: 'Something failed!' })
  } else {
    next(err)
  }
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(res.errCode || err.status || 500)
  res.render('pages/member/error', { statusCode: res.errCode || err.status || 500, error: err })
}

module.exports = router
