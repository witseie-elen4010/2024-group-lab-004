const express = require('express')
const Router = require('./routes/router')

const app = express()

app.use(express.json())
app.use(express.static(`${__dirname}/public`))

app.use('/', Router)

module.exports = app
