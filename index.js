'use strict';

const express = require('express'),
  ejs = require('ejs'),
  app = express(),
  router = express.Router(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  main_port = process.env.port || 80,
  db_port = 27017;

mongoose.connect('mongodb://localhost:' + db_port + '/test');
console.log("Database live on port " + db_port);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('static'));

app.get('/', function (req, res) {
  res.render('pages/index');
});

app.get('/hackathon', function (req, res) {
  res.render('pages/hackathon');
});

app.listen(main_port);
console.log("Website live on port " + main_port);
