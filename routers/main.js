const express = require('express'),
  router = express.Router(),
  ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress


router.use(function logRequest(req, res, next) {
  console.log("Time: ", Date.now())
  console.log("IP: ", ip)
  next()
})

app.get('/', function (req, res) {
  res.render('pages/index')
})

app.get('/hackathon', function (req, res) {
  res.render('pages/hackathon')
})

module.exports = router
