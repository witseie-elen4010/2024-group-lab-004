const db = require('../db/database')

exports.createUserAccount = async (req, res) => {
  const { username, password } = req.body
  const query = 'INSERT INTO users (username, password) VALUES ($1, $2)'
  const values = [username, password]

  try {
    const result = await db.query(query, values)
    return res.redirect('/draw')
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
