'use strict'

const express = require('express'),

  https = require('https'),
  session = require('../../helpers/session'),
  cookieParser = require('cookie-parser'),
  nodemailer = require('nodemailer'),
  xss = require('xss'),
  csrf = require('csurf'),
  {OAuth2Client} = require('google-auth-library'),

  Purchase = require('../../models/purchase'),
  User = require('../../models/user'),

  config = require(__base + 'config.json'),
  ranks = require('../../helpers/ranks.json'),
  auth = require('../../helpers/auth'),
  router = express.Router(),
  smtpConfig = config.automail,
  transporter = nodemailer.createTransport(smtpConfig),
  csrfProtection = csrf({ cookie: true }),
  client = new OAuth2Client(config.google.clientIDs)

const toNumber = (num, err) => {
  var res = parseInt(num, 10)
  return isNaN(res) ? err.toString() : res
}

const validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

router.use(cookieParser())
router.use(session)

router.use(auth.sessionAuth)

// https://developers.google.com/identity/sign-in/web/backend-auth
async function verifyIdToken(token) {
  return (await client.verifyIdToken({
      idToken: token,
      audience: config.google.clientIDs,
  })).getPayload();

  /*return new Promise((resolve, reject) => {

    let data = ""
    const req_path = `/oauth2/v3/tokeninfo?id_token=${token}`
    console.log('[API TOKEN] path: ', req_path)
    let request = https.request({
        hostname: 'www.googleapis.com',
        port: 443,
        path: req_path,
        method: 'GET'
      }, (result, err) => {
        if (err) {
          reject(err)
          return
        }

        result.on('data', (d) => { data += d }).on('end', (d) => {

          data = JSON.parse(data)
          console.log('[DATA]', data)

          console.log()
          console.log('---API TOKEN REQUESTED---')
          console.log('[API TOKEN]', data.name + ' (' + data.email + ')')

          if (result.statusCode !== 200) {
            reject('Invalid Token')
            return
          }

          if (!config.google.clientIDs.includes(data.aud)) {
            reject('Token does match Google Client ID')
            return
          }

          resolve(data)
      })
    }).on('error', reject)
    request.end()
  })
  */
}

// https://developers.google.com/identity/sign-in/web/backend-auth
// handles google sign-in tokens given from client
//
// req.body.idtoken - the given idtoken
// req.body.android - (optional) whether the given phone is an android
router.post('/token', function (req, res) {

  let token = req.body.idtoken
  if (!token) {
    res.status(422).send('No token given (must be given in POST body as `idtoken`)')
    return
  }

  // send to google
  verifyIdToken(token)
  .then(async data => {
    console.log(`[REQ ${req.request_id}] [TOKEN]`, data)

    req.session.auth = {
      loggedin: true,
      token: token,
      info: data,
    }

    // if email is in superadmins list, grant superadmin access
    if (config.users.superadmins.includes(data.email.toLowerCase())) {
      console.log('Superadmin status granted for', data.email.toLowerCase())
      
      const existingUser = await User.findOne({email: data.email.toLowerCase()})
      if(existingUser) {
        req.session.auth.level = ranks.superadmin
        res.status(200).end()
        return;
      }

      User.create({ email: data.email.toLowerCase(), authorization: ranks.superadmin}).then(() => {
        req.session.auth.level = ranks.superadmin
        res.status(200).end()
      });

      return;
    }

    // find the user with the email
    return User.findOne({ email: data.email.toLowerCase() })
    .then(user => {



      // if the user can't be found in db, put user in db
      if (user==null) {

        // if the user has a harker email, allow them the rank of harker student
        // otherwise give them default rank
        let authorization = ranks.none
        if (data.hd === 'students.harker.org' || data.hd === 'staff.harker.org')
            authorization = ranks.harker_student

        User.create({ email: data.email.toLowerCase(), authorization })
        .then(() => {
          req.session.auth.level = authorization
          res.status(200).send()
        })

      }

      // if the user can be found, give appropriate authorization
      else {
        req.session.auth.level = user.authorization
        res.status(200).send()
      }
    })

    // if there is an error, report and destroy the session
    .catch(err => {
      console.error(`[REQ ${req.request_id}] [ERROR] find user with email (token):`, err)
      res.status(401).send(err.toString())
      req.session.destroy()
    })
  })
  .catch(err => {
    console.error(`[REQ ${req.request_id}] [ERROR] validate token:`, err)
    req.session.destroy(() => {
      res.status(400).send(err.toString())
    })
  })

  console.log()
})

// logs the user out from the session on the backend
// does not log the user out from the google auth session
router.delete('/token', function (req, res) {
  req.session.destroy(function(err) {
    if (err) res.status(500).json({ success: false, error: { message: err } })
    else res.status(200).end()
  })
})

// must be logged in to see below pages
router.all('/*', function (req, res, next) {
  if (req.auth.loggedin) {
    console.log(`[REQ ${req.request_id}] Auth: \n\tName: ${req.auth.info.name} \n\tEmail: ${req.auth.info.email} \n\tLevel: ${req.auth.level}`)
    next()
  } else {
    res.render('pages/member/login')
  }
})

router.use('/purchase', require('./purchase'))
router.use('/scouting', require('./scouting'))
router.use('/parts', require('./parts'))
router.use("/attendance", require("./attendance"))

router.get('/', function (req, res) {
  res.render('pages/member/index')
})

router.get('/resources', function(req, res){
  res.render('pages/member/resources')
})

// must be an superadmin to see below pages
router.all('/*', function (req, res, next) {
  if (req.auth.level >= ranks.superadmin) next()
  else res.render('pages/member/error', {
    statusCode: 401,
    error: "You must have higher clearance to reach this page."
  })
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
