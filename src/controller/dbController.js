const db = require('../db/database')

exports.fetchGames = async (req, res) => {
  let query = ''
  let values = []
  if (
    req.session.user.username !== process.env.ADMIN_NAME ||
    req.session.user.id !== parseInt(process.env.ADMIN_ID, 10)
  ) {
    query =
      'SELECT * FROM games WHERE user1 = $1 OR user2 = $1 OR user3 = $1 OR user4 = $1 OR user5 = $1 OR user6 = $1 OR user7 = $1 OR user8 = $1 ORDER BY game_id DESC'
    values = [req.session.user.id]
  } else {
    query = 'SELECT * FROM games ORDER BY game_id DESC'
    values = []
  }

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

exports.saveGrid = async (gameID, grid) => {
  const query = 'INSERT INTO grids (grid, game_id) VALUES ($1, $2)'
  const values = [grid, gameID]
  db.query(query, values, (error) => {
    if (error) throw error
  })
}

exports.fetchGrid = async (req, res) => {
  const query = 'SELECT * FROM grids WHERE game_id = $1'
  const values = [req.query.gameID]
  try {
    const result = await db.query(query, values)
    if (result.length === 0) {
      res.status(404).json({ message: 'No grid found' })
    } else {
      res.json(result.rows)
    }
  } catch (error) {
    res.status(404).json(error)
  }
}

exports.newGame = (names) => {
  return new Promise((resolve, reject) => {
    const game = {}
    game['game_name'] = 'NEW'
    game['game_date'] = new Date()
    for (let i = 0; i < names.length; i++) {
      game[`user${i + 1}`] = names[i]
    }

    const keys = Object.keys(game)
      .map((key) => `"${key}"`)
      .join(', ')
    const values = Object.values(game)
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')

    const query = `INSERT INTO games (${keys}) VALUES (${placeholders}) RETURNING game_id`

    db.query(query, values, (error, results) => {
      if (error) {
        reject(error)
      } else {
        console.log(`Created game with ID: ${results.rows[0].game_id}`)
        resolve(results.rows[0].game_id)
      }
    })
  })
}
