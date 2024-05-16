const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

const {
  rooms,
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
const { afterEach } = require('node:test')

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
  afterEach(() => {
    rooms['room1'] = {}
  })
})
// describe('generateRoomId', () => {
//   it('should generate a room id', () => {
//     const roomId = generateRoomId()
//     expect(roomId).toHaveLength(8)
//   })
// })
// describe('getImposter', () => {
//   it('should get an imposter', () => {
//     const room = {
//       leaderboard: { user1: 1, user2: 2 },
//       members: ['user1', 'user2'],
//     }
//     const imposter = getImposter(room)
//     expect(room.members).toContain(imposter)
//   })
// })
// describe('generateUniqueOrders', () => {
//   it('should generate unique orders', () => {
//     const orders = generateUniqueOrders(3)
//     expect(orders).toHaveLength(3)
//   })

//   // Add more tests for other functions here...
// })

