const express = require('express')
const welcomeController = require('../controller/welcomeController')

const router = express.Router()

router.route('/').get(welcomeController.welcome)
router.route('/:id').get()
router.route('/').post()

module.exports = router
