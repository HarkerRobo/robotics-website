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
  User = require('../models/user'),
  nodemailer = require('nodemailer'),
  xss = require('xss'),
  smtpConfig = require('../config.json')["automail"],
  transporter = nodemailer.createTransport(smtpConfig),
  csrf = require('csurf'),
  csrfProtection = csrf({ cookie: true })

const safeString = (str) => {
  return (typeof str === 'undefined' ? "" : str)
}

const toNumber = (num, err) => {
  var res = parseInt(num, 10)
  return isNaN(res) ? err.toString() : res
}
const toDollarAmount = (num, err) => {
  var res = parseFloat(num, 10).toFixed(2)
  return res==="NaN" ? err.toString() : res
}
const mapToNumber = (arr, err) => {
  return Array.isArray(arr) ? arr.map((x) => {
    return toNumber(x, err)
  }) : toNumber(arr, err)
}
const mapToDollarAmount = (arr, err) => {
  return Array.isArray(arr) ? arr.map((x) => {
    return toDollarAmount(x, err)
  }) : toDollarAmount(arr, err)
}
const deleteBlanks = (arr) => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (typeof arr[i] === 'undefined' || arr[i] === null || arr[i] === '') arr.splice(i, 1)
  }
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
            if (data.aud === config.GoogleClientID) {
              req.session.auth = { loggedin: true, token: token, info: data }
              console.log(data.name + ' (' + data.email + ')')

              if (config.users.superadmins.includes(data.email.toLowerCase())) {
                req.session.auth.level = 4
                console.log('Superadmin status granted')
                res.status(200).end()
              }
              else {
                // find the user with the email
                User.findOne({ email: data.email }, (err, user) => {
                  if (err){
                    req.session.auth.level = 0
                    return
                  }
                  // if the user can't be found in db, put user in db w/ level 0
                  if (user==null) {
                    User.create({ email: data.email.toLowerCase() }, () => {
                      req.session.auth.level = 0
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

/*router.get('/challenges', function (req, res) {
  res.render('pages/member/challenges')
})

router.get('/volunteer', function (req, res) {
  res.render('pages/member/volunteer')
})*/

router.get('/', function (req, res) {
  res.render('pages/member/index')
})

router.get('/resources', function(req, res){
  res.render('pages/member/resources')
})

// must be harker student to see below pages
router.all('/*', function (req, res, next) {
  if (req.auth.level >= 1) {
    next()
  } else {
    res.render('pages/member/error', { statusCode: 401, error: "Must be authenticated as harker student."})
  }
})

/*router.get('/wiki', function (req, res) {
  res.render('pages/member/wiki')
})*/

router.get('/purchase', function (req, res) {
  res.redirect('purchase/list_my')
})

router.get('/purchase/view/:purchase_id', function (req, res) {
  Purchase.findOne({ purchase_id: req.params.purchase_id }, (err, purchase) => {
    if (err || purchase==null) res.render('pages/member/error', { statusCode: 404, error: ( err ? err : "Purchase not found" ) })
    else res.render('pages/member/purchase/view', { purchase: purchase, creation: purchase._id.getTimestamp().toDateString(), total: purchase.totalCost() })
  })
})

router.get('/purchase/list_object/:filter', function (req, res) {
  if (req.params.filter === 'my') {
    Purchase.find({ submitted_by: req.auth.info.email }, (err, purchases) => {
      if (err) {
        res.status(500).json({ success: false, error: { message: err } })
        return
      }
      let map = {}
      purchases.forEach((e) => {
        map[e.purchase_id] = JSON.parse(JSON.stringify(e))
        map[e.purchase_id].total_cost = e.totalCost()
      })
      res.send(map)
    })
  }
  else if (req.params.filter === 'admin') {
    Purchase.find({ $or: [{approval: 0}, {approval: 3}] }, (err, purchases) => {
      if (err) {
        res.status(500).json({ success: false, error: { message: err } })
        return
      }
      let map = {}
      purchases.forEach((e) => {
        map[e.purchase_id] = JSON.parse(JSON.stringify(e))
        map[e.purchase_id].total_cost = e.totalCost()
      })
      res.send(map)
    })
  }
  else if (req.params.filter === 'mentor') {
    Purchase.find({ approval: 2 }, (err, purchases) => {
      if (err) {
        res.status(500).json({ success: false, error: { message: err } })
        return
      }
      let map = {}
      purchases.forEach((e) => {
        map[e.purchase_id] = JSON.parse(JSON.stringify(e))
        map[e.purchase_id].total_cost = e.totalCost()
      })
      res.send(map)
    })
  }
  else {
    Purchase.find({}, (err, purchases) => {
      if (err) {
        res.status(500).json({ success: false, error: { message: err } })
        return
      }
      let map = {}
      purchases.forEach((e) => {
        map[e.purchase_id] = JSON.parse(JSON.stringify(e))
        map[e.purchase_id].total_cost = e.totalCost()
      })
      res.send(map)
    })
  }
})

router.get('/purchase/list_object/', function (req, res) {
  Purchase.find({}, (err, purchases) => {
    if (err) {
      res.status(500).json({ success: false, error: { message: err } })
      return
    }
    let map = {}
    purchases.forEach((e) => {
      map[e.purchase_id] = JSON.parse(JSON.stringify(e))
      map[e.purchase_id].total_cost = e.totalCost()
    })
    res.send(map)
  })
})

router.get('/purchase/list/', function (req, res) {
  res.render('pages/member/purchase/list', { filter: 'all' })
})

router.get('/purchase/list_my', function (req, res) {
  res.render('pages/member/purchase/list', { filter: 'my' })
})

router.get('/purchase/create', csrfProtection, function (req, res) {
  res.render('pages/member/purchase/create', { csrfToken: req.csrfToken() })
})

const xss_array = function(arr) {
  let res = arr
  if (typeof arr === 'string') {
    res = [res]
  }
  for (let i = 0; i < res.length; i++) {
    res[i] = xss(res[i])
  }
  return res
}

router.post('/purchase/create', csrfProtection, function (req, res) {
  if (req.body.part_url === ""&&
      req.body.part_number === ""&&
      req.body.part_name === ""&&
      req.body.subsystem === ""&&
      req.body.price_per_unit === ""&&
      req.body.quantity === "") {
    req.body.part_url =
      req.body.part_number =
      req.body.part_name =
      req.body.subsystem =
      req.body.quantity = []
  }
  if (req.body.part_url[0] === ""&&
          req.body.part_number[0] === ""&&
          req.body.part_name[0] === ""&&
          req.body.subsystem[0] === ""&&
          req.body.part_url[0] === ""&&
          !req.body.price_per_unit[0]&&
          !req.body.quantity[0]) {
    req.body.part_url.shift()
    req.body.part_number.shift()
    req.body.part_name.shift()
    req.body.subsystem.shift()
    req.body.price_per_unit.shift()
    req.body.quantity.shift()
  }
  Purchase.create({
    subteam: xss(safeString(req.body.subteam)),
    vendor: xss(safeString(req.body.vendor)),
    vendor_phone: xss(safeString(req.body.vendor_phone)),
    vendor_email: xss(safeString(req.body.vendor_email)),
    vendor_address: xss(safeString(req.body.vendor_address)),
    reason_for_purchase: xss(safeString(req.body.reason_for_purchase)),
    part_url: xss_array(req.body.part_url),
    part_number: xss_array(req.body.part_number),
    part_name: xss_array(req.body.part_name),
    subsystem: xss_array(req.body.subsystem),
    price_per_unit: xss_array(mapToDollarAmount(req.body.price_per_unit, 0)),
    quantity: xss_array(mapToNumber(req.body.quantity, 0)),
    shipping_and_handling: xss_array(toDollarAmount(req.body.shipping_and_handling, 0)),
    tax: xss(toDollarAmount(req.body.tax, 0)),
    submitted_by: safeString(req.auth.info.email),
  }, (err, purchase) => {
    if (err) {
      console.error(err)
      res.render('pages/member/error', { statusCode: 500, error: err })
      return
    }
    transporter.sendMail({
      from: 'HarkerRobotics1072 Purchase System', // sender address
      to: 'harker1072@gmail.com', // list of receivers
      subject: 'Purchase Request has been created!', // Subject line
      text: 'Purchase Request can be found here: https://robodev.harker.org/member/purchase/view/' + purchase.purchase_id, // plaintext body
    }, (err) => {
      res.redirect('view/' + purchase.purchase_id)
      if (err) console.error(err)
      else console.log("Email sent!")
    })
  });
})

router.get('/purchase/edit/:purchase_id', function (req, res) {
  Purchase.findOne({ purchase_id: req.params.purchase_id }, (err, purchase) => {
    if (err || purchase==null) res.render('pages/member/error', { statusCode: 404, error: ( err ? err : "Purchase not found" ) })
    else if (purchase.submitted_by.toLowerCase() === req.auth.info.email.toLowerCase() && purchase.approval <= 1) res.render('pages/member/purchase/edit', { purchase: purchase })
    else res.render('pages/member/purchase/view', { purchase: purchase })
  })
})

router.post('/purchase/edit/:purchase_id', function (req, res) {
  if (req.body.part_url === ""&&
      req.body.part_number === ""&&
      req.body.part_name === ""&&
      req.body.subsystem === ""&&
      req.body.part_url === ""&&
      !req.body.price_per_unit&&
      !req.body.quantity) {
    req.body.part_url =
      req.body.part_number =
      req.body.part_name =
      req.body.subsystem =
      req.body.price_per_unit =
      req.body.quantity = []
  }
  else if (req.body.part_url[0] === ""&&
          req.body.part_number[0] === ""&&
          req.body.part_name[0] === ""&&
          req.body.subsystem[0] === ""&&
          req.body.part_url[0] === ""&&
          !req.body.price_per_unit[0]&&
          !req.body.quantity[0]) {
    req.body.part_url.shift()
    req.body.part_number.shift()
    req.body.part_name.shift()
    req.body.subsystem.shift()
    req.body.price_per_unit.shift()
    req.body.quantity.shift()
  }

  Purchase.findOneAndUpdate({ purchase_id: req.params.purchase_id }, {
    subteam: xss(safeString(req.body.subteam)),
    vendor: xss(safeString(req.body.vendor)),
    vendor_phone: xss(safeString(req.body.vendor_phone)),
    vendor_email: xss(safeString(req.body.vendor_email)),
    vendor_address: xss(safeString(req.body.vendor_address)),
    reason_for_purchase: xss(safeString(req.body.reason_for_purchase)),
    part_url: xss_array(req.body.part_url),
    part_number: xss_array(req.body.part_number),
    part_name: xss_array(req.body.part_name),
    subsystem: xss_array(req.body.subsystem),
    price_per_unit: xss_array(mapToDollarAmount(req.body.price_per_unit, 0)),
    quantity: xss_array(mapToNumber(req.body.quantity, 0)),
    shipping_and_handling: xss_array(toDollarAmount(req.body.shipping_and_handling, 0)),
    tax: xss(toDollarAmount(req.body.tax,0)),
    submitted_by: safeString(req.auth.info.email),
    approval: 0,
  }, (err, purchase) => {
    if (err) {
      console.error(err)
      res.render('pages/member/error', { statusCode: 500, error: err })
      return
    }
    transporter.sendMail({
      from: 'HarkerRobotics1072 Purchase System', // sender address
      to: 'harker1072@gmail.com', // list of receivers
      subject: 'Purchase Request has been edited!', // Subject line
      text: 'Purchase Request can be found here: https://robodev.harker.org/member/purchase/view/' + req.params.purchase_id, // plaintext body
    }, (err) => {
      if (err) console.error(err)
      else console.log("Email sent!")
      res.redirect('../view/' + purchase.purchase_id)
    })
  })
})


// must be an admin to see below pages
router.all('/*', function (req, res, next) {
  if (req.auth.level >= 2) {
    next()
  } else {
    res.render('pages/member/error', { statusCode: 401, error: "You must have higher clearance to reach this page."})
  }
})

router.get('/purchase/admin', function (req, res) {
  res.render('pages/member/purchase/list', { filter: 'admin' })
})

router.post('/purchase/admin/approve/:id', function (req, res) {
  let query = {}
  // if mentor
  if (req.auth.level == 3 || (req.auth.level == 4 && req.body.mentor === 'true')) {
    query.approval = 4
    query.mentor_comments = safeString(req.body.comments)
    query.mentor_username = safeString(req.auth.info.email)
    query.mentor_date_approved = new Date()
  }
  // if admin
  else {
    query.approval = 2
    query.admin_comments = safeString(req.body.comments)
    query.admin_username = safeString(req.auth.info.email)
    query.admin_date_approved = new Date()
  }
  Purchase.findOneAndUpdate({ purchase_id: req.params.id } , query, function(err, purchase) {
    if (err){
      res.status(500).json({ success: 'false', error: { message: err }})
      return
    }
    if (purchase==null) {
      res.status(404).json({ success: 'false', error: { message: 'Purchase not found' }})
      return
    }
    res.status(200).send()
  })
})

router.post('/purchase/admin/reject/:id', function (req, res) {
  let query = {}
  // if mentor
  if (req.auth.level == 3 || (req.auth.level == 4 && req.body.mentor === 'true')) {
    query.approval = 3
    query.mentor_comments = safeString(req.body.comments)
    query.mentor_username = safeString(req.auth.info.email)
    query.mentor_date_approved = new Date()
  }
  // if admin
  else {
    query.approval = 1
    query.admin_comments = safeString(req.body.comments)
    query.admin_username = safeString(req.auth.info.email)
    query.admin_date_approved = new Date()
  }
  Purchase.findOneAndUpdate({ purchase_id: req.params.id }, query, function(err, purchase) {
    if (err){
      res.status(500).json({ success: 'false', error: { message: err }})
      return
    }
    if (purchase==null) {
      res.status(404).json({ success: 'false', error: { message: 'Purchase not found' }})
      return
    }
    res.status(200).send()
  })
})

/*router.get('/photos', function (req, res) {
  res.render('pages/member/photos')
})*/

// must be an mentor to see below pages
router.all('/*', function (req, res, next) {
  if (req.auth.level >= 3) {
    next()
  } else {
    res.render('pages/member/error', { statusCode: 401, error: "You must have higher clearance to reach this page."})
  }
})

router.get('/purchase/mentor', function (req, res) {
  res.render('pages/member/purchase/list', { filter: 'mentor' })
})

// must be an superadmin to see below pages
router.all('/*', function (req, res, next) {
  if (req.auth.level >= 4) {
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
  if (newlevel>=4) {
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
