const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

const httpMocks = require('node-mocks-http')
const bcrypt = require('bcrypt')
const db = require('../src/db/database')
const { createUserAccount } = require('../src/controller/userController')

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
