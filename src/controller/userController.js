const db = require('../db/database')
const path = require('path')

exports.createUserAccount = async (req, res) => {
  const { username, password } = req.body
  const query = 'INSERT INTO users (username, password) VALUES ($1, $2)'
  const values = [username, password]

  try {
    const result = await db.query(query, values)
    return res.redirect('/landing')
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
      req.session.user = {
        id: result.rows[0].user_id,
        username: result.rows[0].username,
      }
      return res.redirect('/landing')
    }
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

exports.history = async (req, res) => {
  if (req.session.user) {
    res.sendFile(
      path.join(__dirname, '..', './', 'public', 'html', 'history.html')
    )
  } else {
    res.redirect('/') // Redirect to login if no session is found
  }
}

exports.guest = async (req, res) => {
  req.session.user = {
    id: null,
    username: req.query.nickname,
  }
  return res.redirect('/landing')
}

exports.logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      // handle error
      res.send('Error logging out')
    } else {
      res.redirect('/')
    }
  })
}
