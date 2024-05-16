const httpMocks = require('node-mocks-http')
const path = require('path')
const { board } = require('../src/controller/drawController')

describe('drawController', () => {
  it('should send drawingBoard.html file if user session exists', async () => {
    const req = httpMocks.createRequest({
      session: {
        user: {},
      },
    })
    const res = httpMocks.createResponse({
      eventEmitter: require('events').EventEmitter,
    })
    res.sendFile = jest.fn((path) => path)

    await board(req, res)

    expect(res.sendFile).toHaveBeenCalledWith(
      path.join(__dirname, '..', './src/public/html', 'drawingBoard.html')
    )
  })

  it('should redirect to / if no user session exists', async () => {
    const req = httpMocks.createRequest({
      session: {},
    })
    const res = httpMocks.createResponse({
      eventEmitter: require('events').EventEmitter,
    })
    res.redirect = jest.fn()

    await board(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/')
  })
})
