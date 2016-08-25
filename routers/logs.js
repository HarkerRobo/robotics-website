'use strict'

const express = require('express'),
  router = express.Router(),
  moment = require('moment'),
  compression = require('compression')

router.get('/', function(req, res) {
  res.render('pages/logs/logs')
})

module.exports = router
