const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

const httpMocks = require('node-mocks-http')
const bcrypt = require('bcrypt')
const path = require('path')
const db = require('../src/db/database')
const {
  createUserAccount,
  checkUserAccount,
  history,
  exitHistory,
  guest,
  logout,
  getUser,
} = require('../src/controller/userController')

jest.mock('bcrypt')
jest.mock('../src/db/database')

describe('createUserAccount', () => {
  it('should create a user account and redirect to /landing', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/user',
      body: {
        username: 'test',
        password: 'password',
      },
      session: {}, // Add this line
    })

    const res = httpMocks.createResponse()

    const mockUser = { user_id: 1, username: 'test' }
    const hashedPassword = 'hashedpassword'

    bcrypt.hash.mockResolvedValue(hashedPassword)
    db.query.mockResolvedValueOnce({ rowCount: 1 })
    db.query.mockResolvedValueOnce({ rows: [mockUser] })

    await createUserAccount(req, res)

    expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 10)
    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO users (username, password) VALUES ($1, $2)',
      [req.body.username, hashedPassword]
    )
    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE username = $1',
      [req.body.username]
    )
    const compareUser = { id: mockUser.user_id, username: mockUser.username }
    expect(req.session.user).toEqual(compareUser)
    expect(res._getStatusCode()).toBe(302)
    expect(res._getRedirectUrl()).toBe('/landing')
  })

  it('should redirect to /login/?loginError=true if there is an error', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/user',
      body: {
        username: 'test',
        password: 'password',
      },
    })

    const res = httpMocks.createResponse()

    const error = new Error('Test error')
    bcrypt.hash.mockRejectedValue(error)

    await createUserAccount(req, res)

    expect(res._getRedirectUrl()).toBe('/login/?loginError=true')
  })
})

describe('checkUserAccount', () => {
  it('should redirect to /login if user does not exist', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/user/login',
      body: {
        username: 'nonexistent',
        password: 'password',
      },
    })

    const res = httpMocks.createResponse()

    db.query.mockResolvedValueOnce({ rowCount: 0 })

    await checkUserAccount(req, res)

    expect(res._getRedirectUrl()).toBe('/login/?loginError=true')
  })

  it('should redirect to /landing if password matches', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/user/login',
      body: {
        username: 'test',
        password: 'password',
      },
      session: {
        save: jest.fn((callback) => callback()),
      },
    })

    const res = httpMocks.createResponse()

    const mockUser = {
      user_id: 1,
      username: 'test',
      password: 'hashedpassword',
    }

    db.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockUser] })
    bcrypt.compare.mockResolvedValueOnce(true)

    await checkUserAccount(req, res)

    expect(res._getRedirectUrl()).toBe('/landing')
  })

  it('should redirect to /login if password does not match', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      url: '/user/login',
      body: {
        username: 'test',
        password: 'wrongpassword',
      },
    })

    const res = httpMocks.createResponse()

    const mockUser = {
      user_id: 1,
      username: 'test',
      password: 'hashedpassword',
    }

    db.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockUser] })
    bcrypt.compare.mockResolvedValueOnce(false)

    await checkUserAccount(req, res)

    expect(res._getRedirectUrl()).toBe('/login/?loginError=true')
  })
})

describe('history', () => {
  it('should send history.html file if user session exists', async () => {
    const req = httpMocks.createRequest({
      session: {
        user: { id: 1, username: 'test' },
      },
    })

    const res = httpMocks.createResponse({
      eventEmitter: require('events').EventEmitter,
    })
    res.sendFile = jest.fn()

    jest.spyOn(path, 'join').mockReturnValueOnce('mockPath/history.html')

    await history(req, res)

    expect(res.sendFile).toHaveBeenCalledWith('mockPath/history.html')
  })

  it('should redirect to / if no user session exists', async () => {
    const req = httpMocks.createRequest({
      session: {},
    })

    const res = httpMocks.createResponse({
      eventEmitter: require('events').EventEmitter,
    })
    res.sendFile = jest.fn()

    await history(req, res)

    expect(res._getRedirectUrl()).toBe('/')
  })
})

describe('exitHistory', () => {
  it('should redirect to /landing if user is not admin', async () => {
    const req = httpMocks.createRequest({
      session: {
        user: { id: 1, username: 'test' },
      },
    })

    const res = httpMocks.createResponse()

    await exitHistory(req, res)

    expect(res._getRedirectUrl()).toBe('/landing')
  })

  it('should redirect to /admin if user is admin', async () => {
    const req = httpMocks.createRequest({
      session: {
        user: {
          id: parseInt(process.env.ADMIN_ID, 10),
          username: process.env.ADMIN_NAME,
        },
      },
    })

    await console.log(req.session.user)

    const res = httpMocks.createResponse()

    await exitHistory(req, res)

    expect(res._getRedirectUrl()).toBe('/admin')
  })

  it('should redirect to / if no user session exists', async () => {
    const req = httpMocks.createRequest({
      session: {},
    })

    const res = httpMocks.createResponse()

    await exitHistory(req, res)

    expect(res._getRedirectUrl()).toBe('/')
  })
})

// Additional tests for guest
describe('guest', () => {
  it('should set session user and redirect to /landing', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/guest',
      query: {
        nickname: 'testUser',
      },
      session: {
        save: jest.fn().mockImplementation((cb) => {
          cb(null)
        }),
      },
    })

    const res = httpMocks.createResponse()

    await guest(req, res)

    expect(req.session.user).toEqual({
      id: -1,
      username: 'testUser',
    })
    expect(res._getRedirectUrl()).toBe('/landing')
  })

  it('should return 500 if session saving fails', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/guest',
      query: {
        nickname: 'testUser',
      },
      session: {
        save: jest.fn().mockImplementation((cb) => {
          cb(new Error('Test error'))
        }),
      },
    })

    const res = httpMocks.createResponse()

    await guest(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(res._getData()).toBe('An error occurred while saving the session')
  })
})

// Additional tests for logout
describe('logout', () => {
  it('should destroy the session and redirect to /', async () => {
    const req = httpMocks.createRequest({
      session: {
        destroy: jest.fn().mockImplementation((cb) => {
          cb(null)
        }),
      },
    })

    const res = httpMocks.createResponse()

    await logout(req, res)

    expect(res._getRedirectUrl()).toBe('/')
  })

  it('should return an error message if session destruction fails', async () => {
    const req = httpMocks.createRequest({
      session: {
        destroy: jest.fn().mockImplementation((cb) => {
          cb(new Error('Test error'))
        }),
      },
    })

    const res = httpMocks.createResponse()

    await logout(req, res)

    expect(res._getData()).toBe('Error logging out')
  })
})

// Additional tests for getUser
describe('getUser', () => {
  it('should return the session user', async () => {
    const req = httpMocks.createRequest({
      session: {
        user: {
          id: 1,
          username: 'testUser',
        },
      },
    })

    const res = httpMocks.createResponse()

    await getUser(req, res)

    expect(res._getJSONData()).toEqual({
      id: 1,
      username: 'testUser',
    })
  })
})
