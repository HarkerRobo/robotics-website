const mongoose = require('../db')
const Round = require('../models/round')

const promises = []
const tournament_id = process.argv[2]
console.log('Tournament Id:', tournament_id)

for (var i = 0; i < 50; i++)
{
  const promise = Round.create({
    tournament: tournament_id,
    number: i,
    blue: {
      team1: {
        number: 1000,
      },
      team2: {
        number: 1000,
      },
      team3: {
        number: 1000,
      },
    },
    red: {
      team1: {
        number: 1000,
      },
      team2: {
        number: 1000,
      },
      team3: {
        number: 1000,
      },
    },
  })
  promises.push(promise)
}

Promise.all(promises)
.then(() => console.log("Done!"))
.catch(console.error)
