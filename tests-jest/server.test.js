const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

const {
  rooms,
  server,
  generateAndAssignOrders,
  generateRoomId,
  getImposter,
  generateUniqueOrders,
  updateAndEmitOrders,
  determineResults,
  distributePrompts,
  distributeDrawings,
  createRoomGrid,
  updateGridSubmission,
  emitRoundOver,
  assignGameID,
} = require('../src/server')

jest.mock('../src/controller/dbController')

describe('generateAndAssignOrders', () => {
  it('should assign unique orders to each member', () => {
    rooms['room1'] = {
      members: ['Alice', 'Bob', 'Charlie'],
      orders: {},
    }

    const orders = generateAndAssignOrders('room1')
    const uniqueOrders = new Set(Object.values(orders))

    expect(Object.keys(orders)).toEqual(rooms['room1'].members)
    expect(uniqueOrders.size).toBe(rooms['room1'].members.length)
  })
  afterEach((done) => {
    rooms['room1'] = {}
    server.close(done)
  })
})

describe('generateRoomId', () => {
  it('should return a string', () => {
    const result = generateRoomId()
    expect(typeof result).toBe('string')
  })

  it('should return a string of length 8', () => {
    const result = generateRoomId()
    expect(result.length).toBe(8)
  })

  it('should not return the same value twice', () => {
    const result1 = generateRoomId()
    const result2 = generateRoomId()
    expect(result1).not.toBe(result2)
  })
})

describe('getImposter', () => {
  it('should return a member from the room', () => {
    const room = {
      leaderboard: { user1: 1, user2: 2, user3: 3 },
      members: ['user1', 'user2', 'user3'],
    }
    const result = getImposter(room)
    expect(room.members).toContain(result)
  })

  it('should set the imposterUsername to the returned member', () => {
    const room = {
      leaderboard: { user1: 1, user2: 2, user3: 3 },
      members: ['user1', 'user2', 'user3'],
    }
    const result = getImposter(room)
    expect(room.imposterUsername).toBe(result)
  })

  it('should return undefined if there are no members in the room', () => {
    const room = {
      leaderboard: {},
      members: [],
    }
    const result = getImposter(room)
    expect(result).toBeUndefined()
  })
})
describe('generateUniqueOrders', () => {
  it('should return an array', () => {
    const result = generateUniqueOrders(3)
    expect(Array.isArray(result)).toBe(true)
  })

  it('should return an array of length equal to the input parameter', () => {
    const result = generateUniqueOrders(3)
    expect(result.length).toBe(3)
  })

  it('should return an array with unique elements', () => {
    const result = generateUniqueOrders(3)
    const uniqueElements = result.flat()
    expect(uniqueElements.length).toBe(result.length * result[0].length)
  })

  it('should return an array where each element is an array of length equal to the input parameter', () => {
    const result = generateUniqueOrders(3)
    result.forEach((subArray) => {
      expect(subArray.length).toBe(3)
    })
  })

  it('should return an array where each sub-array contains unique elements', () => {
    const result = generateUniqueOrders(3)
    result.forEach((subArray) => {
      const uniqueElements = new Set(subArray)
      expect(uniqueElements.size).toBe(subArray.length)
    })
  })
})

