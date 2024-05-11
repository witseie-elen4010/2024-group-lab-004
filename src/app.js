const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const Router = require('./routes/router')
const welcomeController = require('./controller/welcomeController')

const app = express()

app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))

app.use(express.json())
app.use(express.static(`${__dirname}/public`))

app.use(
  session({
    store: new pgSession({
      conString: `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, // Your Postgres connection string
    }),
    secret: `${process.env.SESSION_SECRET}`,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: 'auto',
      httpOnly: true,
      maxAge: 1800000, // Session expires after 30 minutes of inactivity
    },
  })
)

app.use('/', Router)

app.use(welcomeController.waitForSession)

app.all('*', (req, res, next) => {
  res.redirect('/')
})

module.exports = app
