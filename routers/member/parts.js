'use strict'

const express = require('express'),
  router = express.Router(),
  Part = require('../../models/part'),
  ranks = require('../../helpers/ranks.json'),
  auth = require('../../helpers/auth')

const verifyPartID = partID => {
  return new Promise((resolve, reject) => {
    const partIDRegex = /^(\d+)_(\d)(\d{2})$/g
    const result = partIDRegex.exec(partID)

    if(result === null) reject('Part ID is not valid')
    else resolve([
      parseInt(result[1],10),
      parseInt(result[2],10),
      parseInt(result[3],10)
    ])
  })
}

router.get('/create', (req, res) => {
  res.render('pages/member/parts/create')
})

router.get('/search', (req, res) => {
  res.render('pages/member/parts/search')
})

router.get('/id/:partid', auth.verifyRank(ranks.harker_student), (req, res) => {
  verifyPartID(req.params.partid)
  .then(partid => {

    var query = {
      subassembly: partid[0],
      metal_type: partid[1],
      specific_id: partid[2],
    }

    var year = parseInt(req.body.year, 10)
    if (!isNaN(year)) query.year = year

    var robot_type = parseInt(req.body.robot_type, 10)
    if (!isNaN(robot_type)) query.robot_type = robot_type

    Part.findOne(query)
    .lean()
    .then(part => {
      if (part === null) res.status(404).json({ success: false, error: { message: 'Part not found' } })
      else res.json(part)
    })
    .catch(err => {
      res.status(500).json({ success: false, error: { message: err } })
    })
  })
  .catch(() => {
    res.status(400).json({ success: false, error: { message: 'PartID does not match specified pattern' } })
  })
})

router.post('/id/:partid', auth.verifyRank(ranks.parts_whitelist), (req, res) => {
  verifyPartID(req.params.partid)
  .then(partid => {
    Part.find({
      year: req.body.year,
      robot_type: req.body.robot_type,
      subassembly: partid[0],
      metal_type: partid[1],
      specific_id: partid[2],
    })
    .then(testpart => {
      if (testpart.length > 0) {
        res.status(409).json({ success: false, error: { message: 'Part with the same specifications already exists.' } })
        return
      }
      Part.create({
        year: req.body.year,
        robot_type: req.body.robot_type,
        subassembly: partid[0],
        metal_type: partid[1],
        specific_id: partid[2],
        description: req.body.description,
        image: req.body.image,
        cadlink: req.body.cadlink,
        competition: req.body.competition,
        author: req.auth.info.email,
      })
      .then(part => {
        res.json(part)
      })
      .catch(err => {
        res.status(500).json({ success: false, error: { message: err } })
      })
    })
    .catch(err => {
      res.status(500).json({ success: false, error: { message: err } })
    })
  })
  .catch(err => {
    res.status(500).json({ success: false, error: { message: err } })
  })
})

module.exports = router
