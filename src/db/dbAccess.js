const db = require('./database')

exports.saveDrawing = async (gameID, username, user_id, turn, data) => {
  const query =
    'INSERT INTO drawings (gameID, username, user_id, turn, data) VALUES ($1, $2, $3, $4, $5)'
  const values = [gameID, username, user_id, turn, data]
  try {
    const result = await db.query(query, values)
    res.json({ message: 'Drawing saved' })
  } catch (error) {
    res.status(404).json({ message: 'Drawing not saved' })
  }
}

exports.newGame = async (names) => {
  // Create an object to map names to user fields
  const game = {}
  for (let i = 0; i < names.length; i++) {
    game[`user${i + 1}`] = names[i]
  }

  // Insert the new game into the database
  db.query(
    'INSERT INTO games SET ? RETURNING gameID',
    game,
    (error, results) => {
      if (error) throw error

      // Return the gameID of the newly created game
      console.log(`Created game with ID: ${results.insertId}`)
      return results.insertId
    }
  )
}

// fix the joinRoom to send in a username
// socket ID is needed for sending messages and shit

