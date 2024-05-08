const express = require('express')
const welcomeController = require('../controller/welcomeController')
const userController = require('../controller/userController')
const drawController = require('../controller/drawController')
const dbController = require('../controller/dbController')

const router = express.Router()

router.route('/').get(welcomeController.welcome)
router.route('/draw').get(drawController.board)
router.route('/login').get(welcomeController.login)
router.route('/landing').get(welcomeController.landing)
router.route('/register').post(userController.createUserAccount)
router.route('/login').post(userController.checkUserAccount)
router.route('/history').get(userController.history)
router.route('/fetchGames').get(dbController.fetchGames)
router.route('/fetchPrompts').get(dbController.fetchPrompts)
router.route('/guest').get(userController.guest)
router.route('/logout').get(userController.logout)
router.route('/getUser').get(userController.getUser)

module.exports = router
