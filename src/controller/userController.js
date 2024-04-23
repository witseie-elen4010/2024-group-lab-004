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

exports.checkUserAccount = async (req, res) => {
  const { username, password } = req.body
  const query = 'SELECT * FROM users WHERE username = $1 AND password = $2'
  const values = [username, password]
  try {
    const result = await db.query(query, values)

    if (result.rowCount === 0) {
      res.redirect('/login/?loginError=true')
    } else {
      return res.redirect('/draw')
    }
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
