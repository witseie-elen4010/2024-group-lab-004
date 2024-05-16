// adminController.test.js
const httpMocks = require('node-mocks-http')
const adminController = require('../src/controller/adminController')
const path = require('path')

describe('admin', () => {
  it('should redirect to / if user session is missing', async () => {
    const req = httpMocks.createRequest({
      session: {},
    })

    const res = httpMocks.createResponse()

    await adminController.admin(req, res)

    expect(res._getRedirectUrl()).toBe('/')
  })

  it('should redirect to /logout if user is not an admin', async () => {
    const req = httpMocks.createRequest({
      session: {
        user: {
          id: 1,
          username: 'testUser',
        },
      },
    })

    const res = httpMocks.createResponse()

    await adminController.admin(req, res)

    expect(res._getRedirectUrl()).toBe('/logout')
  })

  it('should send the admin.html file if user is an admin', async () => {
    const req = httpMocks.createRequest({
      session: {
        user: {
          id: parseInt(process.env.ADMIN_ID, 10), // Make sure this is a number
          username: process.env.ADMIN_NAME,
        },
      },
    })

    const res = httpMocks.createResponse()
    res.sendFile = jest.fn()

    await adminController.admin(req, res)

    expect(res.sendFile).toHaveBeenCalledWith(
      path.join(__dirname, '../src/public/html', 'admin.html')
    )
  })
})
