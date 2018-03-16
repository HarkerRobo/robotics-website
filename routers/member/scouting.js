'use strict'

// view documentation in /doc/scouting.md
// https://github.com/HarkerRobo/robotics-website/blob/main/doc/scouting.md

const express = require('express'),
  router = express.Router(),
  io = require('socket.io')(),

  ranks = require('../../helpers/ranks.json'),
  scoutingRanks = {
    sergeant: 10,
    private: 0,
  },

  User = require('../../models/user'),
  Tournament = require('../../models/tournament'),
  Round = require('../../models/round')


class ScoutingError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.message = message;
  }
  sendTo(res) {
    res.status(this.code).json({
      success: false,
      error: {
        message: this.message,
      },
    });
  }
}

const handleScoutingError = (req, res, status, context) => error => {
  console.error(`[REQ ${req.request_id}] [ERROR] `, error instanceof Error ? error.stack : error)
  if (error instanceof ScoutingError) error.sendTo(res, true)
  else res.status(status || 500).json({
    success: false,
    error: {
      message: error,
      context: context || "",
    },
  })
}

router.get('/', (req, res) => {
  res.render('pages/member/scouting')
})

/*
  "Request Spot"
  Clients call this route for each round to "get a spot" on the scouting team
  Gives information about tournament and scouting position
  More documentation at Routes > Request Spot
*/
router.get('/request/:round', (req, res) => {
  const round = parseInt(req.params.round, 10)
  if (isNaN(round)) {
    return (new ScoutingError(422, 'Round must be an integer' )).sendTo(res)
  }
  // Find current tournament
  Tournament.getCurrentTournament()
  .then(tournament => {
    return Round.findOne({
      tournament: tournament._id,
      number: round
    }).populate('tournament')
  })
  .then(round => {
    if (round == null) {
      throw new ScoutingError(404, 'Round does not exist')
    }
    const tournament = round.tournament;
    const tournament_info = {
      year: tournament.year,
      name: tournament.name,
      id: tournament._id
    }

    // TODO: this
    if (round.sergeant === req.auth.info.email) {
      res.send({
        tournament: tournament_info,
        scouting: {
          round: round.number,
          rank: scoutingRanks.sergeant
        }
      })
      return
    }

    // if the user can be a sergeant and the sergeant hasn't been set yet
    if (req.auth.level >= ranks.scouting_sergeants && typeof round.sergeant === undefined) {
      round.sergeant = req.auth.info.email
      return round.save()
      //.then(() => Round.setRoundAwatingScouts(tournament._id, round.number))
      .then(() => {
        res.send({
          tournament: tournament_info,
          scouting: {
            round: round.number,
            rank: scoutingRanks.sergeant
          }
        })
      })
    }
    // if the user is a private
    return round.requestSpot(req.auth.info.email)
    .then(spot => {
      res.send({
        tournament: tournament_info,
        scouting: {
          round: round.number,
          rank: scoutingRanks.private,
          team: spot.team,
          blue: spot.blue
        }
      })
    })
  })
  .catch(handleScoutingError(req, res, 500, `GET /member/request/${req.params.round}`))
})


/*
  "Upload Data"
  Clients call this route for each round to upload the data they collected
  More documentation at Routes > Upload Data
*/
router.post('/upload', (req, res) => {
  Promise.resolve()
  .then(() => {
    // check if headers are set
    if (!req.body.headers) {
      throw new ScoutingError(422, `POST body headers not set (req.body.headers = ${req.body.headers})`)
    }
    if (!req.body.headers.email) {
      throw new ScoutingError(422, `Email not set in POST body headers (req.body.headers.email = ${req.body.headers.email})`)
    }
    req.body.headers.rank = parseInt(req.body.headers.rank, 10)
    if (isNaN(req.body.headers.rank)) {
      throw new ScoutingError(422, `Rank not set in POST body headers (req.body.headers.rank = ${req.body.headers.rank})`)
    }
    req.body.headers.round = parseInt(req.body.headers.round, 10)
    if (isNaN(req.body.headers.round)) {
      throw new ScoutingError(422, `Round number not set in POST body headers (req.body.headers.round = ${req.body.headers.round})`)
    }
    if (typeof req.body.headers.tournament_id !== 'string') {
      throw new ScoutingError(422, `Tournament id not set in POST body headers (req.body.headers.tournament_id = ${req.body.headers.tournament_id})`)
    }
    req.body.headers.team = parseInt(req.body.headers.team, 10)
    if (isNaN(req.body.headers.team)) {
      throw new ScoutingError(422, `Team number not set in POST body headers (req.body.headers.team = ${req.body.headers.team})`)
    }

    if (!req.body.data) {
      throw new ScoutingError(422, 'POST body data not set')
    }

    // check if email in headers matches my email
    if (req.body.headers.email.toLowerCase() !== req.auth.info.email.toLowerCase() && req.auth.info.level < ranks.scouting_sergeants) {
      throw new ScoutingError(403, 'Email does not match login email')
    }
  })
  // find the user with said email
  .then(User.findOne({ email: req.body.headers.email.toLowerCase() }))
  .then(user => {
    if (user == null) {
      return new ScoutingError(422, `User with email ${req.body.headers.email} does not exist`)
    }
    if (user.authorization < ranks.scouting_sergeants && req.body.headers.rank > scoutingRanks.private ) {
      return new ScoutingError(401, `User is not authorized as a scouting sergeant`)
    }
  })
  // find the tournament and round
  .then(() => Tournament.findById(req.body.headers.tournament_id))
  .then(tournament => Round.findOne({
      tournament: tournament._id,
      number: req.body.headers.round,
  }))

  // check if user requested this side and round
  .then(round => {
    if (round == null) throw new ScoutingError(404, `Round number ${req.body.headers.round} does not exist in tournament with id ${req.body.headers.tournament_id}`)

    // if the user is a sergeant
    if (req.body.headers.rank == scoutingRanks.sergeant) {
      // check if they registered as a sergeant
      if (round.sergeant.toLowerCase() === req.auth.info.email.toLowerCase()) {
        round.sergeant_data = req.body.data
        return round.save()
      }
      else throw new ScoutingError(401, `User was not a sergeant for round ${round.number} in tournament with id ${req.body.headers.tournament_id}`)
    }

    // if the user is a private, check the spot
    else {
      if (req.body.headers.blue === true || req.body.headers.blue === "true") {
        if      (round.blue.team1.number === req.body.headers.team) round.blue.team1.data = req.body.data
        else if (round.blue.team2.number === req.body.headers.team) round.blue.team2.data = req.body.data
        else if (round.blue.team3.number === req.body.headers.team) round.blue.team3.data = req.body.data
        else throw new ScoutingError(422, `Team with number ${req.body.headers.team} not found in round ${round.number} in tournament with id ${req.body.headers.tournament_id}`)
      }
      else if (req.body.headers.blue === false || req.body.headers.blue === "false") {
        if      (round.red.team1.number === req.body.headers.team) round.red.team1.data = req.body.data
        else if (round.red.team2.number === req.body.headers.team) round.red.team2.data = req.body.data
        else if (round.red.team3.number === req.body.headers.team) round.red.team3.data = req.body.data
        else throw new ScoutingError(422, `Team with number ${req.body.headers.team} not found in round ${round.number} in tournament with id ${req.body.headers.tournament_id}`)
      }
      else throw new ScoutingError(422, 'Blue not set in POST body headers')
      return round.save()
    }
  })
  //.then(() => {res.end()})
  .catch(handleScoutingError(req, res, 500, `POST /member/scouting/upload`))
})

module.exports = router
