'use strict'

const express = require('express'),
  router = express.Router()

router.get('/', (req, res) => {
  res.render('pages/member/scouting')
})

module.exports = router
