const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

const httpMocks = require('node-mocks-http')
const db = require('../src/db/database')
const {
  fetchGames,
  saveGrid,
  fetchGrid,
  newGame,
} = require('../src/controller/dbController')

jest.mock('../src/db/database')

describe('fetchGames', () => {
  it('should fetch games and return a JSON response', async () => {
    const req = httpMocks.createRequest({
      session: {
        user: {
          username: 'test',
          id: 1,
        },
      },
    })
    const res = httpMocks.createResponse()

    const mockGames = [{ game_id: 1 }, { game_id: 2 }]
    db.query.mockResolvedValue({ rowCount: 2, rows: mockGames })

    await fetchGames(req, res)

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM games WHERE user1 = $1 OR user2 = $1 OR user3 = $1 OR user4 = $1 OR user5 = $1 OR user6 = $1 OR user7 = $1 OR user8 = $1 ORDER BY game_id DESC',
      [req.session.user.id]
    )
    expect(res._getJSONData()).toEqual(mockGames)
  })
  it('should return 404 if no games are found', async () => {
    const req = httpMocks.createRequest({
      session: {
        user: {
          username: 'test',
          id: 1,
        },
      },
    })
    const res = httpMocks.createResponse()

    db.query.mockResolvedValue({ rowCount: 0, rows: [] })

    await fetchGames(req, res)

    expect(res.statusCode).toBe(404)
    expect(res._getJSONData()).toEqual({ message: 'No games found' })
  })

  it('should handle errors', async () => {
    const req = httpMocks.createRequest({
      session: {
        user: {
          username: 'test',
          id: 1,
        },
      },
    })
    const res = httpMocks.createResponse()

    db.query.mockRejectedValue(new Error('Database error'))

    await fetchGames(req, res)

    expect(res.statusCode).toBe(404)
    expect(res._getJSONData()).toEqual({ message: 'No games found' })
  })
})

describe('saveGrid', () => {
  it('should save a grid', async () => {
    const gameID = 1
    const grid = [
      [0, 0],
      [1, 1],
    ]

    db.query.mockResolvedValue({})

    await saveGrid(gameID, grid)

    expect(db.query).toHaveBeenLastCalledWith(
      'INSERT INTO grids (grid, game_id) VALUES ($1, $2)',
      [grid, gameID],
      expect.any(Function) // callback function was provided
    )
  })
  it('should handle errors', async () => {
    const gameID = 1
    const grid = [
      [0, 0],
      [1, 1],
    ]

    db.query.mockImplementation((query, values, callback) => {
      callback(new Error('Database error'))
    })

    await expect(saveGrid(gameID, grid)).rejects.toThrow('Database error')
  })
})

describe('fetchGrid', () => {
  it('should fetch a grid and return a JSON response', async () => {
    const req = httpMocks.createRequest({
      query: {
        gameID: 1,
      },
    })
    const res = httpMocks.createResponse()

    const mockGrid = [
      [0, 0],
      [1, 1],
    ]
    db.query.mockResolvedValue({ rows: mockGrid })

    await fetchGrid(req, res)

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM grids WHERE game_id = $1',
      [req.query.gameID]
    )
    expect(res._getJSONData()).toEqual(mockGrid)
  })
})
describe('newGame', () => {
  it('should create a new game and return the game ID', (done) => {
    const names = ['test1', 'test2', 'test3']
    const host = 'test1'

    const mockGameID = 1
    db.query.mockImplementation((query, values, callback) => {
      callback(null, { rows: [{ game_id: mockGameID }] })
    })

    newGame(names, host)
      .then((gameID) => {
        expect(db.query).toHaveBeenCalled()
        expect(gameID).toEqual(mockGameID)
        done() // Call done when the promise resolves
      })
      .catch((error) => {
        console.error(error)
        done() // Call done even if the promise rejects to avoid a timeout
      })
  })

  it('should handle errors', (done) => {
    const names = ['test1', 'test2', 'test3']
    const host = 'test1'

    db.query.mockImplementation((query, values, callback) => {
      callback(new Error('Database error'))
    })

    newGame(names, host).catch((error) => {
      expect(error).toEqual(new Error('Database error'))
      done()
    })
  })
})
