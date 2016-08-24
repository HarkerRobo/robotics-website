'use strict'

const express = require('express'),
  router = express.Router(),
  moment = require('moment')

app.use(compression())

router.use(function logRequest(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  console.log()
  console.log('--- NEW REQUEST ---')
  console.log('Time:', moment().format('MMMM Do YYYY, h:mm:ss a'), '(' + Date.now() + ')')
  console.log('IP: ', ip)
  console.log('Request:', req.originalUrl)
  next()
})

router.get('/member/login', function (req, res) {
  res.render('pages/member/login')
})

router.get('/member/register', function (req, res) {
  res.render('pages/member/register')
})

router.get('/member/', function (req, res) {
  res.render('pages/member/index')
})

router.get('/member/*', function (req, res, next) {
  res.status(404)
  res.errCode = 404
  req.member = 'true'
  next('URL ' + req.originalUrl + ' Not Found')
})

router.get('/hackathon', function (req, res) {
  res.render('pages/hackathon')
})

router.get('/about', function (req, res) {
  res.render('pages/about')
})

router.get('/photos', function (req, res) {
  res.render('pages/photos')
})

router.get('/', function (req, res) {
  res.render('pages/index')
})

router.get('*', function (req, res, next) {
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

module.exports = router
