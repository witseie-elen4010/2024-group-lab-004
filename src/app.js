const express = require('express')
const bodyParser = require('body-parser')
const Router = require('./routes/router')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.json())
app.use(express.static(`${__dirname}/public`))

app.use('/', Router)

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  })
})

module.exports = app
