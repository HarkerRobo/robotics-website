'use strict'

const express = require('express'),
  router = express.Router(),
  moment = require('moment'),
  compression = require('compression')

router.get('/', function(req, res) {
  res.render('pages/photos')
})

router.post('/test', function(req, res) {
  console.log("LOCALS:", req.app.locals)
  res.send("OK");
})


module.exports = router
