'use strict'

const express = require('express'),
  router = express.Router(),
  moment = require('moment'),
  https = require('https'),
  session = require('express-session'),
  config = require(__base + 'config.json'),
  RedisStore = require('connect-redis')(session)


router.use(function logRequest(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  console.log()
  console.log('--- NEW REQUEST ---')
  console.log('Time:', moment().format('MMMM Do YYYY, h:mm:ss a'), '(' + Date.now() + ')')
  console.log('IP: ', ip)
  console.log('Request:', req.originalUrl)
  console.log('Router: member.js')
  next()
})


// DO NOT USE WITHOUT STORE: CAUSES MEMORY LEAKS
// For more information, go to https://github.com/expressjs/session#compatible-session-stores
router.use(session({
  store: new RedisStore({
    disableTTL: true,
    logErrors: true
  }),
  secure: true,
  secret: config['cookieSecret'],
  name: config['cookieName'],
  resave: false,
  saveUninitialized: false,
}))

//router.use(express.cookieParser())
/*router.use(expres.session({
  store: new RedisStore({
    host: 'localhost',
    port: 80,
    db: 2,
    pass
  })
}))*/


router.get('/login', function (req, res) {
  res.render('pages/member/login')
})

router.get('/register', function (req, res) {
  res.render('pages/member/register')
})

router.post('/token', function (req, res) {
  let token = req.body.idtoken
  if (token !== undefined) {
    // validate token here

    let data = ""

    https.get('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token='+token, (result) => {
      console.log();
      console.log('---API TOKEN REQUESTED---')
      console.log('statusCode:', result.statusCode);
      console.log('headers:', result.headers);
      console.log()

      result.on('data', (d) => {
        data += d
      });

    }).on('error', (e) => {
      console.error(e);
    });
    console.log('DATA:', data)

    req.session.token = token
    res.statusCode(200).end()
  } else {
    res.status(400).send('Bad Request: No token')
  }

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
