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
  Purchase = require('../../models/purchase'),
  User = require('../../models/user'),
  nodemailer = require('nodemailer'),
  xss = require('xss'),
  smtpConfig = config["automail"],
  transporter = nodemailer.createTransport(smtpConfig),
  csrf = require('csurf'),
  csrfProtection = csrf({ cookie: true }),
  ranks = require('../../helpers/ranks.json')

const toNumber = (num, err) => {
  var res = parseInt(num, 10)
  return isNaN(res) ? err.toString() : res
}

const validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
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
  req.auth = req.session.auth
  if (!req.auth) {
    req.auth = { loggedin: false }
  }
  res.locals.auth = req.auth
  next()
})

// https://developers.google.com/identity/sign-in/web/backend-auth
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
        if (err) { console.log('Error:', err); return res.sendStatus(400);  }
        console.log()
        console.log('---API TOKEN REQUESTED---')

        result.on('data', (d) => { data += d }).on('end', (d) => {
          data = JSON.parse(data)
          if (result.statusCode === 200) {
            if (config.GoogleClientID.includes(data.aud)) {
              req.session.auth = { loggedin: true, token: token, info: data }
              console.log(data.name + ' (' + data.email + ')')

              if (config.users.superadmins.includes(data.email.toLowerCase())) {
                req.session.auth.level = ranks.superadmin
                console.log('Superadmin status granted')
                res.status(200).end()
              }
              else {
                // find the user with the email
                User.findOne({ email: data.email.toLowerCase() }, (err, user) => {
                  if (err){
                    console.error('An error occured while finding the user:', err)
                    req.session.destroy()
                  }
                  // if the user can't be found in db, put user in db w/ level 0
                  else if (user==null) {
                    User.create({ email: data.email.toLowerCase() }, () => {
                      if (data.hd === 'students.harker.org' || data.hd === 'staff.harker.org') {
                        req.session.auth.level = ranks.harker_student
                      }
                      else req.session.auth.level = ranks.none
                      res.status(200).send()
                    })
                  }
                  else {
                    req.session.auth.level = user.authorization
                    res.status(200).send()
                  }
                })
              }
            } else {
              res.status(400).end('Token does match Google Client ID')
            }
          } else {
            res.status(400).end('Invalid Token')
          }
        })
      }).on('error', (e) => {
        console.error(e);
      })
      request.end()
  } else {
    res.status(400).send('Bad Request: No token')
  }
  console.log()
})

router.delete('/token', function (req, res) {
  req.session.destroy(function(err) {
    if (err) res.status(500).json({ success: false, error: { message: err } })
    else res.status(200).end()
  })
})

// must be logged in to see below pages
router.all('/*', function (req, res, next) {
  if (req.auth.loggedin) {
    console.log('Auth: ' + req.auth.info.name + ' (' + req.auth.info.email + ')')
    console.log('Auth level: ' + req.auth.level)
    next()
  } else {
    res.render('pages/member/login')
  }
})

router.use('/purchase', require('./purchase'))
router.use('/scouting', require('./scouting'))
router.use('/parts', require('./parts'))

router.get('/', function (req, res) {
  res.render('pages/member/index')
})

router.get('/resources', function(req, res){
  res.render('pages/member/resources')
})

// must be an superadmin to see below pages
router.all('/*', function (req, res, next) {
  if (req.auth.level >= ranks.superadmin) {
    next()
  } else {
    res.render('pages/member/error', { statusCode: 401, error: "You must have higher clearance to reach this page."})
  }
})

router.get('/userman', function (req, res) {
  res.render('pages/member/users')
})

router.post('/userman/setuserauth', function (req, res) {
  const email = xss(req.body.email)
  const newlevel = toNumber(xss(req.body.level), 0)
  if (!validateEmail(email)) {
    res.status(400).json({ success: 'false', error: { message: 'Email not valid' }})
    return
  }
  if (newlevel>=ranks.superadmin) {
    res.status(400).json({ success: 'false', error: { message: 'Authorization level too high' }})
    return
  }
  // updates or inserts a user with given auth level and email
  User.updateOne({ email: email }, { email: email, authorization: newlevel }, { upsert: true, setDefaultsOnInsert: true}, function(err, user) {
    if (err){
      res.status(500).json({ success: 'false', error: { message: err }})
      return
    }
    if (user==null) {
      res.status(404).json({ success: 'false', error: { message: 'User not found' }})
      return
    }
    res.status(200).send()
  })
})

router.get('/userman/userswithauth/:level', function (req, res) {
  User.find({ authorization: req.params.level }, function(err, users) {
    if (err){
      res.status(500).json({ success: 'false', error: { message: err }})
      return
    }
    let result = []
    for (const user of users) {
      result.push(user.email)
    }
    res.json(result)
  })
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
