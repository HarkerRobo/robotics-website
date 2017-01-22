'use strict'

const express = require('express'),
  router = express.Router(),
  moment = require('moment'),
  compression = require('compression'),
  https = require('https'),
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  config = require(__base + 'config.json'),
  MongoStore = require('connect-mongo')(session),
  Purchase = require('../models/purchase'),
  nodemailer = require('nodemailer'),
  smtpConfig = require('../config.json')["automail"],
  transporter = nodemailer.createTransport(smtpConfig)



const toNumber = (num, err) => {
  var res = parseInt(num, 10)
  return isNaN(res) ? err : res
}
const mapToNumber = (arr, err) => {
  return Array.isArray(arr) ? arr.map((x) => {
    return toNumber(x, err)
  }) : toNumber(arr, err)
}
const deleteBlanks = (arr) => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (typeof arr[i] === 'undefined' || arr[i] === null || arr[i] === '') arr.splice(i, 1)
  }
}

router.use(cookieParser())

// DO NOT USE WITHOUT STORE: CAUSES MEMORY LEAKS
// For more information, go to https://github.com/expressjs/session#compatible-session-stores
router.use(session({
  store: new MongoStore({
    url: `mongodb://localhost/robotics-website`
  }),
  secure: true,
  secret: config['cookieSecret'],
  name: config['cookieName'],
  resave: false,
  saveUninitialized: false,
  httpOnly: false
}))

router.use(function (req, res, next) {
  if (!req.session.auth) {
    req.session.auth = { loggedin: false }
  }
  res.locals.auth = req.session.auth
  next()
})

router.post('/token', function (req, res) {
  let token = req.body.idtoken
  if (token !== undefined) {

    // validate token

    // send to google
    let data = ""
    let request = https.request(
      {
        hostname: 'www.googleapis.com',
        port: 443,
        path: '/oauth2/v3/tokeninfo?id_token='+token,
        method: 'GET'
      }, (result, err) => {
        if (err) { return res.sendStatus(400); console.log('Error:', err) }
        console.log()
        console.log('---API TOKEN REQUESTED---')
        console.log('statusCode:', result.statusCode)
        console.log('headers:', result.headers)
        console.log()

        result.on('data', (d) => { data += d }).on('end', (d) => {
          console.log('DATA:', data)
          data = JSON.parse(data)
          if (result.statusCode === 200) {
            if (data.aud === config.GoogleClientID) {
              if (data.hd !== undefined && data.hd === "students.harker.org") {
                if (req.app.locals.admins.includes(data.email.toLowerCase())){
                  req.session.auth.level = 2
                }
                else {
                  req.session.auth.level = 1
                }
              }
              req.session.auth.loggedin = true
              req.session.auth.token = token
              req.session.auth.info = data
              res.status(200).end()
            } else {
              req.session.auth = { loggedin: false }
              res.status(400).end('Token does match Google Client ID')
            }
          } else {
            req.session.auth = { loggedin: false }
            res.status(400).end('Invalid Token')
          }
        })
      }).on('error', (e) => {
        console.error(e);
      })
      request.end()
  } else {
    req.session.auth = { loggedin: false }
    res.status(400).send('Bad Request: No token')
  }
})

router.delete('/token', function (req, res) {
  req.session.auth = { loggedin: false }
  res.status(200).end()
})

// must be logged in to see below pages
router.all('/*', function (req, res, next) {
  if (req.session.auth.loggedin) {
    next()
  } else {
    res.render('pages/member/login')
  }
})

router.get('/challenges', function (req, res) {
  res.render('pages/member/challenges')
})

router.get('/volunteer', function (req, res) {
  res.render('pages/member/volunteer')
})

router.get('/', function (req, res) {
  res.render('pages/member/index')
})

// must be harker student to see below pages
router.all('/*', function (req, res, next) {
  if (req.session.auth.level >= 1) {
    next()
  } else {
    res.render('pages/member/error', { statusCode: 401, error: "Must be authenticated as harker student."})
  }
})

router.get('/resources', function(req, res){
  res.render('pages/member/resources')
})

router.get('/wiki', function (req, res) {
  res.render('pages/member/wiki')
})

router.get('/purchase', function (req, res) {
  res.render('pages/member/purchase/list', { filter: 'my' })
})

router.get('/purchase/view/:purchase_id', function (req, res) {
  Purchase.findById(req.params.purchase_id, (err, purchase) => {
    if (err || purchase==null) res.render('pages/member/error', { statusCode: 404, error: ( err ? err : "Purchase not found" ) })
    else res.render('pages/member/purchase/view', { purchase: purchase })
  })
})

router.get('/purchase/list_object/:filter', function (req, res) {
  if (req.params.filter === 'my') {
    Purchase.find({ submitted_by: req.session.auth.info.email }, (err, purchases) => {
      let map = {}
      purchases.forEach((e) => { map[e._id] = e })
      res.send(map)
    })
  }
  else {
    Purchase.find({}, (err, purchases) => {
      let map = {}
      purchases.forEach((e) => { map[e._id] = e })
      res.send(map)
    })
  }
})

router.get('/purchase/list_object/', function (req, res) {
  Purchase.find({}, (err, purchases) => {
    let map = {}
    purchases.forEach((e) => { map[e._id] = e })
    res.send(map)
  })
})

router.get('/purchase/list/', function (req, res) {
  res.render('pages/member/purchase/list', { filter: 'all' })
})

router.get('/purchase/list_my', function (req, res) {
  res.render('pages/member/purchase/list', { filter: 'my' })
})

router.get('/purchase/create', function (req, res) {
  res.render('pages/member/purchase/create')
})

router.post('/purchase/create', function (req, res) {
  if (req.body.part_url[0] === "") {
    req.body.part_url.shift()
    req.body.part_number.shift()
    req.body.part_name.shift()
    req.body.subsystem.shift()
    req.body.price_per_unit.shift()
    req.body.quantity.shift()
  }
  else if (req.body.part_url === "") {
    req.body.part_url =
      req.body.part_number =
      req.body.part_name =
      req.body.subsystem =
      req.body.price_per_unit =
      req.body.quantity = []
  }
  req.body.part_url === ""
  Purchase.create({
    subteam: req.body.subteam,
    vendor: req.body.vendor,
    vendor_phone: req.body.vendor_phone,
    vendor_email: req.body.vendor_email,
    vendor_address: req.body.vendor_address,
    reason_for_purchase: req.body.reason_for_purchase,
    part_url: req.body.part_url,
    part_number: req.body.part_number,
    part_name: req.body.part_name,
    subsystem: req.body.subsystem,
    price_per_unit: mapToNumber(req.body.price_per_unit, 0),
    quantity: mapToNumber(req.body.quantity, 0),
    shipping_and_handling: toNumber(req.body.shipping_and_handling),
    submitted_by: req.session.auth.info.email,
  }, (err, purchase) => {
    if (err) {
      console.error(err)
      res.render('pages/member/error', { statusCode: 500, error: err })
      return
    }
    transporter.sendMail({
      from: 'HarkerRobotics1072 Purchase System', // sender address
      to: 'harker1072@gmail.com', // list of receivers
      subject: 'Purchase Order has been created!', // Subject line
      text: 'Purchase Order can be found here: https://robodev.harker.org/member/purchase/view/' + req.params.purchase_id, // plaintext body
    }, (err) => {
      console.error(err)
    })
    res.redirect('../view/' + purchase._id)
  });
})

router.get('/purchase/edit/:purchase_id', function (req, res) {

  Purchase.findById(req.params.purchase_id, (err, purchase) => {
    if (err || purchase==null) res.render('pages/member/error', { statusCode: 404, error: ( err ? err : "Purchase not found" ) })
    else if (purchase.submitted_by === req.session.auth.info.email) res.render('pages/member/purchase/edit', { purchase: purchase })
    else res.render('pages/member/purchase/view', { purchase: purchase })
  })
})

router.post('/purchase/edit/:purchase_id', function (req, res) {
  if (req.body.part_url[0] === "") {
    req.body.part_url.shift()
    req.body.part_number.shift()
    req.body.part_name.shift()
    req.body.subsystem.shift()
    req.body.price_per_unit.shift()
    req.body.quantity.shift()
  }
  else if (req.body.part_url === "") {
    req.body.part_url =
      req.body.part_number =
      req.body.part_name =
      req.body.subsystem =
      req.body.price_per_unit =
      req.body.quantity = []
  }
  req.body.part_url === ""
  Purchase.findByIdAndUpdate(req.params.purchase_id, {
    subteam: req.body.subteam,
    vendor: req.body.vendor,
    vendor_phone: req.body.vendor_phone,
    vendor_email: req.body.vendor_email,
    vendor_address: req.body.vendor_address,
    reason_for_purchase: req.body.reason_for_purchase,
    part_url: req.body.part_url,
    part_number: req.body.part_number,
    part_name: req.body.part_name,
    subsystem: req.body.subsystem,
    price_per_unit: mapToNumber(req.body.price_per_unit, 0),
    quantity: mapToNumber(req.body.quantity, 0),
    shipping_and_handling: toNumber(req.body.shipping_and_handling),
    submitted_by: req.session.auth.info.email,
  }, (err, purchase) => {
    if (err) {
      console.error(err)
      res.render('pages/member/error', { statusCode: 500, error: err })
      return
    }
    transporter.sendMail({
      from: 'HarkerRobotics1072 Purchase System', // sender address
      to: 'harker1072@gmail.com', // list of receivers
      subject: 'Purchase Order has been edited!', // Subject line
      text: 'Purchase Order can be found here: https://robodev.harker.org/member/purchase/view/' + req.params.purchase_id, // plaintext body
    }, (err) => {
      console.error(err)
    })
    res.redirect('../view/' + purchase._id)
  });
})


// must be an admin to see below pages
router.all('/*', function (req, res, next) {
  if (req.session.auth.level >= 2) {
    next()
  } else {
    res.render('pages/member/error', { statusCode: 401, error: "You must have higher clearance to reach this page."})
  }
})

router.get('/purchase/admin', function (req, res) {
  res.render('pages/member/purchase/admin')
})

router.get('/photos', function (req, res) {
  res.render('pages/member/photos')
})

router.get('/*', function (req, res, next) {
  res.status(404)
  res.errCode = 404
  next('URL ' + req.originalUrl + ' Not Found')
})

router.use(errorHandler)

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(res.errCode || err.status || 500)
  res.render('pages/member/error', { statusCode: res.errCode || err.status || 500, error: err })
}

module.exports = router
