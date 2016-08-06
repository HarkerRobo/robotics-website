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
  next()
})

router.get('/', function (req, res) {
  res.render('pages/index')
  console.log('Request: /')
})

router.get('/hackathon', function (req, res) {
  res.render('pages/hackathon')
  console.log('Request: /hackathon')
})

module.exports = router
