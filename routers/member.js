'use strict'

const express = require('express'),
  router = express.Router(),
  moment = require('moment'),
  https = require('https'),
  session = require('express-session'),
  config = require(__base + 'config.json'),
  MongoStore = require('connect-mongo')(session)

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
}))

router.use(function logRequest(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  console.log()
  console.log('--- NEW REQUEST ---')
  console.log('Time:', moment().format('MMMM Do YYYY, h:mm:ss a'), '(' + Date.now() + ')')
  console.log('IP: ', ip)
  console.log('Request:', req.originalUrl)
  console.log('Router: member.js')
  if (req.session.auth === undefined) {
    req.session.auth = { loggedin: false }
  }
  next()
})

router.get('/login', function (req, res) {
  res.render('pages/member/login', { loggedin: req.session.auth.loggedin })
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
      }, (result) => {
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
                req.session.auth.level = 1
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

router.all('/*', function (req, res, next) {
  if (req.session.auth.loggedin) {
    next()
  } else {
    res.redirect('/member/login')
  }
})

router.get('/register', function (req, res) {
  res.render('pages/member/register')
})

router.get('/', function (req, res) {
  res.redirect('login')
})

router.get('/*', function (req, res, next) {
  res.status(404)
  res.errCode = 404
  next('URL ' + req.originalUrl + ' Not Found')
})

router.use(logErrors)
router.use(clientErrorHandler)
router.use(errorHandler)

function logErrors(err, req, res, next) {
  console.error(err.stack)
  next(err)
}

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(500).render('pages/member/error', { statusCode: 500, error: 'Something failed!' })
  } else {
    next(err)
  }
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(res.errCode || err.status || 500)
  res.render('pages/member/error', { statusCode: res.errCode || err.status || 500, error: err })
}

module.exports = router
