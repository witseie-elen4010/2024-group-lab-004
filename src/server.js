const dotenv = require('dotenv')
const http = require('http')
const socketio = require('socket.io')

dotenv.config({ path: './config.env' })
const app = require('./app')
const server = http.createServer(app)
const io = socketio(server)
const dbAccess = require('./db/dbAccess')

const port = process.env.PORT || process.env.APP_PORT

const rooms = {}
const publicRooms = {}
const rounds = {}
const drawingSubmissions = {}
const users = new Map()

const fs = require('fs')

// example function showing how to save the data to an image as a file
async function test() {
  const gameID = await dbAccess.getDrawingsGame(39)
  const data = gameID[0].data.toString()

  // Remove the "data:image/png;base64," part
  const base64Data = data.replace(/^data:image\/png;base64,/, '')

  // Convert base64 to image
  fs.writeFile('output.png', base64Data, 'base64', (err) => {
    if (err) {
      console.error('An error occurred:', err)
    } else {
      console.log('Image saved as output.png')
    }
  })
}

io.on('connection', (socket) => {
  let currentRoom = null

  socket.on('createRoom', (options) => {
    const roomId = generateRoomId()
    const isPublic = options.public || false

    rooms[roomId] = {
      members: [socket.id],
      host: socket.id,
      orders: {},
      prompts: {},
      grid: null,
      isPublic,
    }
    currentRoom = roomId
    socket.join(roomId)
    updateAndEmitOrders(roomId)
    rooms[roomId].grid = createRoomGrid(rooms[roomId].members.length)
    socket.emit('roomCreated', roomId)

    if (isPublic) {
      publicRooms[roomId] = rooms[roomId]
    }
  })

  socket.on('joinRoom', (data) => {
    const roomID = data.roomId.trim()

    const room = rooms[roomID]
    if (room) {
      if (room.gameStarted && room.members.length >= room.maxMembers) {
        socket.emit('roomJoinError', 'Game has already started')
      } else {
        room.members.push(socket.id)
        socket.join(roomID)
        currentRoom = roomID
        updateAndEmitOrders(roomID)
        room.grid = createRoomGrid(room.members.length)
        const allUsernames = room.members.map((member) => users.get(member)) // ********** //
        io.to(roomID).emit('roomJoined', {
          roomId: roomID,
          members: allUsernames,
        })
        io.to(roomID).emit('updateMembers', room.members.length)
      }
    } else {
      socket.emit('roomJoinError', 'Room does not exist')
    }
  })

  socket.on('requestPublicRooms', () => {
    const roomsList = Object.entries(publicRooms).map(([roomId, room]) => ({
      roomId,
      host: room.host,
      members: room.members,
    }))
    socket.emit('publicRoomsList', roomsList)
  })

  socket.on('inputDone', (data) => {
    const { roomId, prompt } = data

    if (rooms[roomId]) {
      rooms[roomId].prompts[socket.id] = prompt
      updateGridSubmission(roomId, socket.id, 'prompt', prompt)

      if (
        Object.keys(rooms[roomId].prompts).length ===
        rooms[roomId].members.length
      ) {
        distributePrompts(roomId)
        rooms[roomId].prompts = {}
      }
    }
  })

  socket.on('drawingSubmitted', (data) => {
    const { roomId, image } = data

    if (!drawingSubmissions[roomId]) {
      drawingSubmissions[roomId] = {}
    }

    drawingSubmissions[roomId][socket.id] = image
    updateGridSubmission(roomId, socket.id, 'drawing', image)
    console.log('here:')
    console.log(rooms[roomId].gameID)

    dbAccess.saveDrawing(
      rooms[roomId].gameID,
      users.get(socket.id).id,
      users.get(socket.id).username,
      rounds[roomId],
      image
    )
    if (
      Object.keys(drawingSubmissions[roomId]).length ===
      rooms[roomId].members.length
    ) {
      distributeDrawings(roomId)
    }
  })

  socket.on('joinGameRoom', (roomID, username) => {
    console.log(roomID)
    if (rooms[roomID]) {
      rooms[roomID].members.push(socket.id)
      users.set(socket.id, username)
      socket.join(roomID)
      currentRoom = roomID
      updateAndEmitOrders(roomID)
      rooms[roomID].grid = createRoomGrid(rooms[roomID].members.length)
      const allUsernames = rooms[roomID].members.map((member) =>
        users.get(member)
      )
      console.log(allUsernames)
      io.to(roomID).emit('gameRoomJoined', {
        roomId: roomID,
        members: allUsernames,
      })

      // only get the imposters once everyone has joined the room
      console.log(rooms[roomID].members)
      console.log(rooms[roomID].gameSize)
      if (rooms[roomID].members.length === rooms[roomID].gameSize) {
        // create the gameroom in the database
        const allUsernames = rooms[roomID].members.map(
          (member) => users.get(member).id
        )
        assignGameID(roomID, allUsernames).then((val) => console.log('hi', val))

        const imposter = getImposter(rooms[roomID])
        rooms[roomID].imposter = imposter // store the imposter so the server knows who it is

        // Send a "no" message to all other members
        rooms[roomID].members.forEach((member) => {
          if (member === imposter) {
            io.to(member).emit('imposter', true)
          } else {
            io.to(member).emit('normal', true)
          }
        })
      }
    } else {
      socket.emit('roomJoinError', 'Room does not exist')
    }
  })

  async function assignGameID(roomID, allUsernames) {
    rooms[roomID].gameID = await dbAccess.newGame(allUsernames)
    console.log('yo', rooms[roomID].gameID)
    return rooms[roomID].gameID
  }

  socket.on('startGame', (roomID) => {
    if (rooms[roomID] && rooms[roomID].host === socket.id) {
      rooms[roomID].gameStarted = true
      rooms[roomID].maxMembers = rooms[roomID].members.length * 2
      if (rooms[roomID].isPublic) {
        delete publicRooms[roomID]
      }
      io.to(roomID).emit('gameStarted')
      rooms[roomID].gameSize = rooms[roomID].members.length
    }
  })

  socket.on('nextRound', (roomID) => {
    if (rooms[roomID]) {
      rounds[roomID] = 0
      rooms[roomID].prompts = {}
      drawingSubmissions[roomID] = {}
      rooms[roomID].grid = createRoomGrid(rooms[roomID].members.length)

      updateAndEmitOrders(roomID)
      const imposter = getImposter(rooms[roomID])
      rooms[roomID].imposter = imposter // store the imposter so the server knows who it is

      // Send a "no" message to all other members
      rooms[roomID].members.forEach((member) => {
        if (member === imposter) {
          io.to(member).emit('imposter', true)
        } else {
          io.to(member).emit('normal', true)
        }
      })

      io.to(roomID).emit('newRound')
    }
  })

  socket.on('getUserDrawings', async (username) => {
    const drawings = await dbAccess.getDrawingsUser(users.get(username).id)
    socket.emit('userDrawings', drawings)
  })

  socket.on('disconnect', () => {
    if (currentRoom) {
      const room = rooms[currentRoom]
      room.members = room.members.filter((id) => id !== socket.id)
      users.delete(socket.id)

      if (room.gameStarted) {
        room.maxMembers -= 1
        delete publicRooms[currentRoom]
      }

      if (room.members.length === 0) {
        if (room.isPublic) {
          delete publicRooms[currentRoom]
        }
      }

      if (room.orders[socket.id]) {
        delete room.orders[socket.id]
      }
      if (room.prompts[socket.id]) {
        delete room.prompts[socket.id]
      }
      if (
        drawingSubmissions[currentRoom] &&
        drawingSubmissions[currentRoom][socket.id]
      ) {
        delete drawingSubmissions[currentRoom][socket.id]
      }
      updateAndEmitOrders(currentRoom)
      io.to(currentRoom).emit('userDisconnected')
    }
  })
})

function generateAndAssignOrders(roomID) {
  const members = rooms[roomID].members
  const uniqueOrders = generateUniqueOrders(members.length)

  rooms[roomID].orders = Object.fromEntries(
    members.map((member, index) => [member, uniqueOrders[index]])
  )
  return rooms[roomID].orders
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 10)
}

function getImposter(room) {
  const randomIndex = Math.floor(Math.random() * room.members.length)
  return room.members[randomIndex]
}
function generateUniqueOrders(numPlayers) {
  const orders = Array.from({ length: numPlayers }, () =>
    Array(numPlayers).fill(0)
  )

  for (let i = 0; i < numPlayers; i++) {
    for (let j = 0; j < numPlayers; j++) {
      orders[j][(i + j) % numPlayers] = i + 1
    }
  }
  return orders.sort(() => Math.random() - 0.5)
}

function updateAndEmitOrders(roomID) {
  generateAndAssignOrders(roomID)

  const orders = rooms[roomID].orders
  const members = rooms[roomID].members

  for (const [member, order] of Object.entries(orders)) {
  }

  io.to(roomID).emit('updateOrders', orders)
}

function distributePrompts(roomID) {
  const members = rooms[roomID].members
  const prompts = rooms[roomID].prompts
  const orders = rooms[roomID].orders

  if (!rounds[roomID]) {
    rounds[roomID] = 0
  }
  const currentRound = rounds[roomID]++

  if (currentRound < members.length - 1) {
    members.forEach((member) => {
      const order = orders[member]
      const nextIndex = currentRound + 1

      // Find the member who had this index in the previous round
      const currentRoundIndex = order[nextIndex]
      const sourceMember = members.find(
        (m) => orders[m][currentRound] === currentRoundIndex
      )

      const prompt = prompts[sourceMember] || 'No prompt'
      io.to(member).emit('updatePrompt', prompt)
    })
  } else {
    emitRoundOver(roomID)
  }
}

function distributeDrawings(roomID) {
  const members = rooms[roomID].members
  const drawings = drawingSubmissions[roomID]
  const orders = rooms[roomID].orders

  drawingSubmissions[roomID] = {}

  if (!rounds[roomID]) {
    rounds[roomID] = 0
  }
  const currentRound = rounds[roomID]++

  if (currentRound < members.length - 1) {
    members.forEach((member) => {
      const order = orders[member]
      const nextIndex = currentRound + 1

      // Find the member who had this index in the previous round
      const currentRoundIndex = order[nextIndex]
      const sourceMember = members.find(
        (m) => orders[m][currentRound] === currentRoundIndex
      )

      const drawing = drawings[sourceMember] || 'No drawing'
      io.to(member).emit('updateDrawing', drawing)
    })
  } else {
    emitRoundOver(roomID)
    // drawingSubmissions[roomID] = {}
  }
}

function createRoomGrid(size) {
  return Array.from({ length: size }, () =>
    Array(size).fill({ type: null, content: null, member: null })
  )
}

function updateGridSubmission(roomID, memberID, type, content) {
  const orders = rooms[roomID].orders
  const members = rooms[roomID].members
  if (!rounds[roomID]) {
    rounds[roomID] = 0
  }
  const currentRound = rounds[roomID]

  const order = orders[memberID]
  const targetIndex = order[currentRound] - 1

  rooms[roomID].grid[currentRound][targetIndex] = {
    type,
    content,
    member: memberID,
  }
}

function emitRoundOver(roomID) {
  const grid = rooms[roomID].grid
  io.to(roomID).emit('roundOver', grid)
}

server.listen(port, () => {
  console.log(`Server running on local port ${port}...`)
})
