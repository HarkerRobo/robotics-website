'use strict';

const express = require('express'),
  ejs = require('ejs'),
  app = express(),
  router = express.Router(),
  bodyParser = require('body-parser'),
  port = 80;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('static'));

app.get('/', function (req, res) {
  res.render('pages/index');
});

app.listen(port);
console.log("We're live on port " + port);
