'use strict'

console.log()
console.log()
console.log('--- PROCESS INITIALIZED ---')
console.log('Time:', Date.now())

const express = require('express'),
  ejs = require('ejs'),
  app = express(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  moment = require('moment'),
  mainRouter = require('./routers/main'),
  port = 80

function getTimeFormatted() {
  return moment().format('MMMM Do YYYY, h:mm:ss a') + ' (' + Date.now() + ')'
}

console.log('Constants made at:', getTimeFormatted())

mongoose.connect('mongodb://127.0.0.1/test', (err) => {
  console.log('Database live on port', port, 'at', getTimeFormatted())
})

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('static'))
app.use('/', mainRouter)

app.listen(port, (err) => {
  console.log('Website live on port', port, 'at', getTimeFormatted())
})
