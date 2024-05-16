const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

const {
  rooms,
  server,
  rounds,
  users,
  drawingSubmissions,
  publicRooms,
  inputDone,
  generateAndAssignOrders,
  getMessages,
  roomChecks,
  generateRoomId,
  getImposter,
  generateUniqueOrders,
  updateAndEmitOrders,
  determineResults,
  drawingSubmitted,
  createRoomGrid,
  updateGridSubmission,
  assignGameID,
} = require('../src/server')

const dbController = require('../src/controller/dbController')
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

describe('updateAndEmitOrders', () => {
  beforeEach(() => {
    rooms['room1'] = {
      members: ['Alice', 'Bob', 'Charlie'],
      orders: {},
    }
  })

  it('should assign unique orders to each member and emit them', () => {
    updateAndEmitOrders('room1')
    const orders = rooms['room1'].orders

    const uniqueOrders = Object.values(orders).flat()

    expect(Object.keys(orders)).toEqual(rooms['room1'].members)
    expect(uniqueOrders.length).toBe(
      rooms['room1'].members.length * rooms['room1'].members.length
    )

    Object.values(orders).forEach((order) => {
      const uniqueElements = new Set(order)
      expect(uniqueElements.size).toBe(order.length)
    })
  })

  afterEach(() => {
    rooms['room1'] = {}
  })
})

describe('determineResults', () => {
  it('should correctly determine the most voted user and if they are the imposter', () => {
    const room = {
      votes: { user1: 2, user2: 3, user3: 1 },
      leaderboard: { user1: 100, user2: 200, user3: 300 },
      imposterUsername: 'user2',
    }

    const result = determineResults(room)

    expect(result).toEqual({
      mostVotedUser: 'user2',
      votes: 3,
      isImposter: true,
      equalImposterVotes: false,
      imposter: 'user2',
    })
  })

  it('should correctly handle a tie in votes', () => {
    const room = {
      votes: { user1: 2, user2: 2, user3: 1 },
      leaderboard: { user1: 100, user2: 200, user3: 300 },
      imposterUsername: 'user1',
    }

    const result = determineResults(room)

    expect(result).toEqual({
      mostVotedUser: 'user1',
      votes: 2,
      isImposter: true,
      equalImposterVotes: true,
      imposter: 'user1',
    })
  })

  it('should correctly handle no votes', () => {
    const room = {
      votes: {},
      leaderboard: { user1: 100, user2: 200, user3: 300 },
      imposterUsername: 'user1',
    }

    const result = determineResults(room)

    expect(result).toEqual({
      mostVotedUser: null,
      votes: 0,
      isImposter: false,
      equalImposterVotes: false,
      imposter: 'user1',
    })
  })
})

describe('createRoomGrid', () => {
  it('should return an array', () => {
    const result = createRoomGrid(3)
    expect(Array.isArray(result)).toBe(true)
  })

  it('should return a 2D array with the specified size', () => {
    const size = 5
    const result = createRoomGrid(size)
    expect(result.length).toBe(size)
    result.forEach((subArray) => {
      expect(subArray.length).toBe(size)
    })
  })

  it('should fill the 2D array with objects', () => {
    const result = createRoomGrid(3)
    result.forEach((subArray) => {
      subArray.forEach((item) => {
        expect(typeof item).toBe('object')
      })
    })
  })

  it('should fill the 2D array with objects containing the correct properties', () => {
    const result = createRoomGrid(3)
    result.forEach((subArray) => {
      subArray.forEach((item) => {
        expect(item).toHaveProperty('type')
        expect(item).toHaveProperty('content')
        expect(item).toHaveProperty('member')
      })
    })
  })

  it('should fill the 2D array with objects containing null values', () => {
    const result = createRoomGrid(3)
    result.forEach((subArray) => {
      subArray.forEach((item) => {
        expect(item.type).toBeNull()
        expect(item.content).toBeNull()
        expect(item.member).toBeNull()
      })
    })
  })
})

describe('updateGridSubmission', () => {
  beforeEach(() => {
    rooms['room1'] = {
      members: ['Alice', 'Bob', 'Charlie'],
      orders: {
        Alice: [1, 2, 3],
        Bob: [2, 3, 1],
        Charlie: [3, 1, 2],
      },
      grid: createRoomGrid(3),
    }
    rounds['room1'] = 0
  })

  it('should update the grid correctly', () => {
    updateGridSubmission('room1', 'Alice', 'type1', 'content1', 'Alice')
    const grid = rooms['room1'].grid
    expect(grid[0][0]).toEqual({
      type: 'type1',
      content: 'content1',
      member: 'Alice',
    })
  })

  it('should not update the grid if the round does not exist', () => {
    rounds['room1'] = undefined
    updateGridSubmission('room1', 'Alice', 'type1', 'content1', 'Alice')
    const grid = rooms['room1'].grid
    expect(grid[0][0]).toEqual({
      type: null,
      content: null,
      member: null,
    })
  })

  it('should not update the grid if the order does not exist', () => {
    rooms['room1'].orders['Alice'] = undefined
    updateGridSubmission('room1', 'Alice', 'type1', 'content1', 'Alice')
    const grid = rooms['room1'].grid
    expect(grid[0][0]).toEqual({
      type: null,
      content: null,
      member: null,
    })
  })

  afterEach(() => {
    rooms['room1'] = {}
    rounds['room1'] = undefined
  })
})

describe('assignGameID', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be a function', () => {
    expect(typeof assignGameID).toBe('function')
  })

  it('should call dbController.newGame with correct arguments', async () => {
    const mockNewGame = jest.spyOn(dbController, 'newGame')
    mockNewGame.mockResolvedValue('game1')

    const roomID = 'room1'
    const allUserIDs = ['user1', 'user2']
    rooms[roomID] = { host: 'user1' }
    users.set('user1', { username: 'Alice' })

    await assignGameID(roomID, allUserIDs)

    expect(mockNewGame).toHaveBeenCalledWith(allUserIDs, 'Alice')
  })

  it('should assign the returned value from dbController.newGame to rooms[roomID].gameID', async () => {
    const mockNewGame = jest.spyOn(dbController, 'newGame')
    mockNewGame.mockResolvedValue('game1')

    const roomID = 'room1'
    const allUserIDs = ['user1', 'user2']

    await assignGameID(roomID, allUserIDs)

    expect(rooms[roomID].gameID).toBe('game1')
  })
})
// const distributePrompts = mock('../src/server', 'distributePrompts')
jest.mock('../src/server', () => ({
  ...jest.requireActual('../src/server'),
  distributePrompts: jest.fn(),
}))

describe('inputDone', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    rooms['room1'] = {
      members: ['Alice', 'Bob', 'Charlie'],
      prompts: {},
      orders: {
        id1: [1, 2, 3],
        Bob: [2, 3, 1],
        Charlie: [3, 1, 2],
      },
      grid: createRoomGrid(3),
    }
    rounds['room1'] = 1
    users.set('id1', { username: 'Alice' })
    users.set('id2', { username: 'Bob' })
    users.set('id3', { username: 'Charlie' })
  })

  afterEach(() => {
    rooms['room1'] = {}
    rounds['room1'] = undefined
    users.clear()
    jest.restoreAllMocks()
  })

  it('should call updateGridSubmission and result in the grid being changed', async () => {
    await inputDone({ roomId: 'room1', prompt: 'prompt1' }, 'id1')

    //expect grid to be truthy
    expect(rooms['room1'].grid).toBeTruthy()
  })
  it('should update the prompt field of rooms[roomID] with the correct value', async () => {
    await inputDone({ roomId: 'room1', prompt: 'new prompt' }, 'id1')
    expect(rooms['room1'].prompts['id1']).toBe('new prompt')
  })
})

describe('drawingSubmitted', () => {
  let socketID
  let data

  beforeEach(() => {
    socketID = 'socket1'
    data = { roomId: 'room1', image: 'image1' }
    rooms['room1'] = {
      members: ['Alice', 'Bob', 'Charlie'],
      orders: {
        id1: [1, 2, 3],
        Bob: [2, 3, 1],
        Charlie: [3, 1, 2],
      },
      grid: createRoomGrid(3),
    }
    users.set('socket1', { username: 'Alice' })
  })

  afterEach(() => {
    rooms['room1'] = {}
    users.clear()
    drawingSubmissions['room1'] = {}
  })

  it('should update drawingSubmissions correctly', () => {
    drawingSubmitted(data, socketID)
    expect(drawingSubmissions['room1']['socket1']).toBe('image1')
  })

  it('should call updateGridSubmission with correct parameters', () => {
    drawingSubmitted(data, socketID)
    expect(rooms['room1'].grid).toBeTruthy()
  })
})
describe('roomChecks', () => {
  let socketID
  let currentRoom

  beforeEach(() => {
    socketID = 'socket1'
    currentRoom = 'room1'
    rooms[currentRoom] = {
      gameStarted: false,
      allJoined: false,
      members: ['Alice', 'Bob', 'Charlie'],
      orders: {
        [socketID]: [1, 2, 3],
      },
      prompts: {
        [socketID]: 'prompt1',
      },
      isPublic: true,
      maxMembers: 3,
      gameSize: 3,
    }
    publicRooms[currentRoom] = rooms[currentRoom]
    drawingSubmissions[currentRoom] = {
      [socketID]: 'image1',
    }
  })

  afterEach(() => {
    rooms[currentRoom] = {}
    publicRooms[currentRoom] = {}
    drawingSubmissions[currentRoom] = {}
  })

  it('should decrease maxMembers and delete room from publicRooms when gameStarted is true', () => {
    rooms[currentRoom].gameStarted = true
    roomChecks(rooms[currentRoom], socketID, currentRoom)
    expect(rooms[currentRoom].maxMembers).toBe(2)
    expect(publicRooms[currentRoom]).toBeUndefined()
  })

  it('should decrease gameSize when allJoined is true', () => {
    rooms[currentRoom].allJoined = true
    roomChecks(rooms[currentRoom], socketID, currentRoom)
    expect(rooms[currentRoom].gameSize).toBe(2)
  })

  it('should delete room from publicRooms when there are no members', () => {
    rooms[currentRoom].members = []
    roomChecks(rooms[currentRoom], socketID, currentRoom)
    expect(publicRooms[currentRoom]).toBeUndefined()
  })

  it('should delete orders and prompts of a user when they exist', () => {
    roomChecks(rooms[currentRoom], socketID, currentRoom)
    expect(rooms[currentRoom].orders[socketID]).toBeUndefined()
    expect(rooms[currentRoom].prompts[socketID]).toBeUndefined()
  })

  it('should delete drawingSubmissions of a user when they exist', () => {
    roomChecks(rooms[currentRoom], socketID, currentRoom)
    expect(drawingSubmissions[currentRoom][socketID]).toBeUndefined()
  })
})
describe('getMessages', () => {
  let socketID
  let data

  beforeEach(() => {
    socketID = 'socket1'
    data = { roomId: 'room1', message: 'Hello, world!' }
    rooms['room1'] = {
      members: ['Alice', 'Bob', 'Charlie'],
      chatMessages: [],
    }
    users.set('socket1', { username: 'Alice' })
  })

  afterEach(() => {
    rooms['room1'] = {}
    users.clear()
  })

  it('should initialize chatMessages array if it does not exist', () => {
    delete rooms['room1'].chatMessages
    getMessages(data, socketID)
    expect(rooms['room1'].chatMessages).toBeDefined()
  })

  it('should add a new message to the chatMessages array', () => {
    const initialLength = rooms['room1'].chatMessages.length
    getMessages(data, socketID)
    expect(rooms['room1'].chatMessages.length).toBe(initialLength + 1)
  })

  it('should add a new message with the correct username, message, and socketID', () => {
    getMessages(data, socketID)
    const newMessage =
      rooms['room1'].chatMessages[rooms['room1'].chatMessages.length - 1]
    expect(newMessage).toEqual({
      username: 'Alice',
      message: 'Hello, world!',
      socketID: 'socket1',
    })
  })
})
