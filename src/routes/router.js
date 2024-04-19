const express = require('express')
const welcomeController = require('../controller/welcomeController')
const drawController = require('../controller/drawController')

const router = express.Router()

router.route('/').get(welcomeController.welcome)
router.route('/draw').get(drawController.board)
router.route('/:id').get()
router.route('/').post()

module.exports = router
