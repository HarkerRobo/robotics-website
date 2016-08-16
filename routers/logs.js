'use strict'

const express = require('express'),
  router = express.Router(),
  moment = require('moment')


router.use(function logRequest(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  console.log()
  console.log('--- NEW REQUEST ---')
  console.log('Time:', moment().format('MMMM Do YYYY, h:mm:ss a'), '(' + Date.now() + ')')
  console.log('IP: ', ip)
  console.log('Request:', req.originalUrl)
  console.log('Router: logs.js')
  next()
})


router.get('/', function(req, res) {
  res.render('pages/logs/logs')
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
