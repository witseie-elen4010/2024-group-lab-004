const db = require('../db/database')
const path = require('path')
const bcrypt = require('bcrypt')
const saltRounds = 10

exports.createUserAccount = async (req, res) => {
  const { username, password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    const query = 'INSERT INTO users (username, password) VALUES ($1, $2)'
    const values = [username, hashedPassword]
    const result = await db.query(query, values)
    if (result.rowCount !== 0) {
      const query = 'SELECT * FROM users WHERE username = $1'
      const values = [username]
      const result = await db.query(query, values)
      req.session.user = {
        id: result.rows[0].user_id,
        username: result.rows[0].username,
      }
    }
    return res.redirect('/landing')
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

exports.checkUserAccount = async (req, res) => {
  const { username, password } = req.body

  try {
    const query = 'SELECT * FROM users WHERE username = $1'
    const values = [username]
    const result = await db.query(query, values)

    if (result.rowCount === 0) {
      res.redirect('/login/?loginError=true')
    } else {
      const hashedPassword = result.rows[0].password
      const match = await bcrypt.compare(password, hashedPassword)
      if (match) {
        req.session.user = {
          id: result.rows[0].user_id,
          username: result.rows[0].username,
        }
        return res.redirect('/landing')
      }
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
    id: -1,
    username: req.query.nickname,
  }
  req.session.save((err) => {
    if (err) {
      // handle error
      console.log(err)
      res.status(500).send('An error occurred while saving the session')
    } else {
      return res.redirect('/landing')
    }
  })
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

exports.getUser = async (req, res) => {
  res.json(req.session.user)
}
