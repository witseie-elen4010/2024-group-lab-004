const { TextEncoder, TextDecoder } = require('util')

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

const request = require('supertest')
const express = require('express')
const path = require('path')
const welcomeController = require('../src/controller/welcomeController')

// Create a function to set up the app with a given session
const createTestApp = (session) => {
  const app = express()
  app.use((req, res, next) => {
    req.session = session // Mock session
    next()
  })
  app.get('/landing', welcomeController.landing)
  app.get('/login', welcomeController.login)
  app.get('/welcome', welcomeController.welcome)
  return app
}

describe('welcomeController', () => {
  describe('GET /login', () => {
    it('should return login.html', async () => {
      const app = express()
      app.get('/login', welcomeController.login)

      const res = await request(app).get('/login')

      expect(res.status).toBe(200)
      expect(res.type).toBe('text/html')
      expect(res.text).toContain('<!DOCTYPE html>') // Optionally, check the content
    })
  })

  describe('GET /welcome', () => {
    it('should return welcome.html', async () => {
      const app = express()
      app.get('/welcome', welcomeController.welcome)

      const res = await request(app).get('/welcome')

      expect(res.status).toBe(200)
      expect(res.type).toBe('text/html')
      expect(res.text).toContain('<!DOCTYPE html>') // Optionally, check the content
    })
  })

  describe('GET /landing', () => {
    it('should redirect to login if no session user', async () => {
      const app = createTestApp({}) // Empty session
      const res = await request(app)
        .get('/landing')
        .set('Accept', 'application/json')

      expect(res.status).toBe(302)
      expect(res.header.location).toBe('/')
    })

    it('should return landingPage.html if session user exists', async () => {
      const app = createTestApp({ user: { username: 'testUser' } }) // Mock session user
      const res = await request(app)
        .get('/landing')
        .set('Accept', 'application/json')

      expect(res.status).toBe(200)
      expect(res.type).toBe('text/html')
      expect(res.text).toContain('<!DOCTYPE html>') // Optionally, check the content
    })
  })

  describe('waitForSession middleware', () => {
    it('should reload session if not loaded', (done) => {
      const app = express()
      app.use((req, res, next) => {
        req.session = {
          isLoaded: false,
          reload: jest.fn((callback) => callback(null)),
        }
        next()
      })
      app.use(welcomeController.waitForSession)
      app.get('/test', (req, res) => res.sendStatus(200))

      request(app)
        .get('/test')
        .end((err, res) => {
          expect(res.status).toBe(200)
          done()
        })
    })

    it('should handle session reload error', (done) => {
      const app = express()
      app.use((req, res, next) => {
        req.session = {
          isLoaded: false,
          reload: jest.fn((callback) =>
            callback(new Error('Session reload error'))
          ),
        }
        next()
      })
      app.use(welcomeController.waitForSession)
      app.get('/test', (req, res) => res.sendStatus(200))

      request(app)
        .get('/test')
        .end((err, res) => {
          expect(res.status).toBe(500)
          expect(res.text).toBe('An error occurred while reloading the session')
          done()
        })
    })

    it('should call next if session is already loaded', (done) => {
      const app = express()
      app.use((req, res, next) => {
        req.session = { isLoaded: true }
        next()
      })
      app.use(welcomeController.waitForSession)
      app.get('/test', (req, res) => res.sendStatus(200))

      request(app)
        .get('/test')
        .end((err, res) => {
          expect(res.status).toBe(200)
          done()
        })
    })
  })
})
