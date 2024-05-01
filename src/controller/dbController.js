const db = require('../db/database')

exports.fetchGames = async (req, res) => {
  if (req.session.user) {
    const query =
      'SELECT * FROM games WHERE user1 = $1 OR user2 = $1 OR user3 = $1 OR user4 = $1 OR user5 = $1 OR user6 = $1 OR user7 = $1 OR user8 = $1'
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
  } else {
    res.redirect('/') // Redirect to login if no session is found
  }
}

exports.fetchPrompts = async (req, res) => {
  if (req.session.user) {
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
  } else {
    res.redirect('/') // Redirect to login if no session is found
  }
}
