const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Success')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const ConvertDBObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

//API 1
app.get('/players/', async (request, response) => {
  const getPlayersDetails = `
  SELECT 
  *
  FROM
  cricket_team
  `
  const b = await db.all(getPlayersDetails)
  response.send(b.map(i => ConvertDBObjectToResponseObject(i)))
})

// API 2
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const addPlayerDetails = `
      INSERT INTO
      cricket_team( player_name, jersey_number, role)
      VALUES(
        '${playerName}',
         ${jerseyNumber},
        '${role}')`
  const addDetails = await db.run(addPlayerDetails)
  response.send('Player Added to Team')
})

//API 3
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getplayerDetailsQuery = `
      SELECT 
          *
      FROM
          cricket_team
      WHERE 
          player_id = ${playerId}`
  const getDetails = await db.get(getplayerDetailsQuery)
  response.send(ConvertDBObjectToResponseObject(getDetails))
})

// API 4
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const details = request.body
  const {playerName, jerseyNumber, role} = details
  const updatePlayerQuery = `
        UPDATE 
            cricket_team
        SET 
            player_name = '${playerName}',
            jersey_number = ${jerseyNumber},
            role = '${role}'
        WHERE player_id = ${playerId}`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//API 5
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
      DELETE FROM
          cricket_team
      WHERE
          player_id = ${playerId}`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
