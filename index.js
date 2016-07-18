'use strict'

const express = require('express'),
  ejs = require('ejs'),
  app = express(),
  router = express.Router(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  port = 80

mongoose.connect('mongodb://127.0.0.1/test', (err) => {
  console.log('Database live on port ' + port)
})

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('static'))

app.get('/', function (req, res) {
  res.render('pages/index')
})

app.get('/hackathon', function (req, res) {
  res.render('pages/hackathon')
})

app.listen(port, (err) => {
  console.log('Website live on port ' + port)
})
