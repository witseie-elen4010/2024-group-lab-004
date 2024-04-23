const express = require('express')
const welcomeController = require('../controller/welcomeController')
const userController = require('../controller/userController')
const drawController = require('../controller/drawController')

const router = express.Router()

router.route('/').get(welcomeController.login)
router.route('/draw').get(drawController.board)
// router.route('/:id').get()
router.route('/register').post(userController.createUserAccount)
router.route('/login').post(userController.checkUserAccount)

module.exports = router
