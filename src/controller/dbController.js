const db = require('../db/database')

// exports.fetchGames = async (req, res) => {
//   if (req.session.user) {
//     const query =
//       'SELECT * FROM games WHERE user1 = $1 OR user2 = $1 OR user3 = $1 OR user4 = $1 OR user5 = $1 OR user6 = $1 OR user7 = $1 OR user8 = $1'
//     const values = [req.session.user.id]
//     try {
//       const result = await db.query(query, values)
//       if (result.rowCount === 0) {
//         res.status(404).json({ message: 'No games found' })
//       } else {
//         res.json(result.rows)
//       }
//     } catch (error) {
//       res.status(404).json({ message: 'No games found' })
//     }
//   } else {
//     res.redirect('/') // Redirect to login if no session is found
//   }
// }

exports.fetchGames = async (req, res) => {
  const query =
    'SELECT * FROM games WHERE user1 = $1 OR user2 = $1 OR user3 = $1 OR user4 = $1 OR user5 = $1 OR user6 = $1 OR user7 = $1 OR user8 = $1 ORDER BY "gameID"'
  const values = [req.session.user.id]
  try {
    const result = await db.query(query, values)
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'No games found' })
    } else {
      res.json(result.rows)
    }
  } catch (error) {
    res.status(404).json({ message: 'No games found' })
  }
}

// exports.fetchPrompts = async (req, res) => {
//   if (req.session.user) {
//     const query = 'SELECT * FROM prompts WHERE "gameID" = $1'
//     const values = [req.query.gameId]
//     try {
//       const result = await db.query(query, values)
//       if (result.rowCount === 0) {
//         res.status(404).json({ message: 'No prompts found' })
//       } else {
//         res.json(result.rows)
//       }
//     } catch (error) {
//       res.status(404).json({ message: 'No prompts found' })
//     }
//   } else {
//     res.redirect('/') // Redirect to login if no session is found
//   }
// }

exports.fetchPrompts = async (req, res) => {
  const query = 'SELECT * FROM prompts WHERE "gameID" = $1'
  const values = [req.query.gameId]
  try {
    const result = await db.query(query, values)
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'No prompts found' })
    } else {
      res.json(result.rows)
    }
  } catch (error) {
    res.status(404).json({ message: 'No prompts found' })
  }
}

exports.fetchDrawings = async (req, res) => {
  try {
    const result = await exports.getDrawingsGame(req.query.gameId)

    if (result.length === 0) {
      res.status(404).json({ message: 'No prompts found' })
    } else {
      res.json(result)
    }
  } catch (error) {
    res.status(404).json({ message: 'No prompts found' })
  }
}

exports.saveDrawing = async (gameID, user_id, username, turn, data) => {
  const query =
    'INSERT INTO drawings (gameID, user_id, username, turn, data) VALUES ($1, $2, $3, $4, $5)'
  const values = [gameID, user_id, username, turn, data]

  db.query(query, values, (error) => {
    if (error) throw error
  })
}

exports.newGame = (names) => {
  return new Promise((resolve, reject) => {
    const game = {}
    game['gameName'] = 'some_default_game_name'
    game['gameDate'] = new Date()
    for (let i = 0; i < names.length; i++) {
      game[`user${i + 1}`] = names[i]
    }

    const keys = Object.keys(game)
      .map((key) => `"${key}"`)
      .join(', ')
    const values = Object.values(game)
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')

    const query = `INSERT INTO games (${keys}) VALUES (${placeholders}) RETURNING "gameID"`

    db.query(query, values, (error, results) => {
      if (error) {
        reject(error)
      } else {
        console.log(`Created game with ID: ${results.rows[0].gameID}`)
        resolve(results.rows[0].gameID)
      }
    })
  })
}

// Non-exported function
function getDrawings(query, values) {
  return new Promise((resolve, reject) => {
    db.query(query, values, (error, results) => {
      if (error) {
        reject(error)
      } else {
        resolve(results.rows)
      }
    })
  })
}

// Exported function for getting drawings by gameID
exports.getDrawingsGame = (gameID) => {
  if (!gameID) {
    return Promise.reject('No gameID provided')
  }
  const query = 'SELECT * FROM drawings WHERE gameID = $1'
  const values = [gameID]
  return getDrawings(query, values)
}

// Exported function for getting drawings by user_id
exports.getDrawingsUser = (user_id) => {
  if (!user_id) {
    return Promise.reject('No user_id provided')
  }
  const query = 'SELECT * FROM drawings WHERE user_id = $1'
  const values = [user_id]
  return getDrawings(query, values)
}
