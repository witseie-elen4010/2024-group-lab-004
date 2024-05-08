const dotenv = require('dotenv')
const http = require('http')
const socketio = require('socket.io')

dotenv.config({ path: './config.env' })
const app = require('./app')
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || process.env.APP_PORT

const rooms = {}
const rounds = {}
const drawingSubmissions = {}

io.on('connection', (socket) => {
  console.log('New WebSocket connection')
  let currentRoom = null

  socket.on('createRoom', () => {
    const roomID = generateRoomId()
    rooms[roomID] = {
      members: [socket.id],
      host: socket.id,
      orders: {},
      prompts: {},
    }
    currentRoom = roomID
    socket.join(roomID)
    updateAndEmitOrders(roomID)
    socket.emit('roomCreated', roomID)
    console.log(`Room created: ${roomID}`)
  })

  socket.on('joinRoom', (roomID) => {
    const room = rooms[roomID]
    if (room) {
      if (room.gameStarted && room.members.length >= room.maxMembers) {
        socket.emit('roomJoinError', 'Game has already started')
      } else {
        room.members.push(socket.id)
        socket.join(roomID)
        currentRoom = roomID
        updateAndEmitOrders(roomID)
        socket.emit('roomJoined', {
          roomId: roomID,
          members: room.members,
        })
        io.to(roomID).emit('updateMembers', room.members.length)
        console.log(`Joined room: ${roomID}`)
      }
    } else {
      socket.emit('roomJoinError', 'Room does not exist')
    }
  })

  socket.on('inputDone', (data) => {
    const { roomId, prompt } = data

    if (rooms[roomId]) {
      rooms[roomId].prompts[socket.id] = prompt
      console.log(`Received prompt from member ${socket.id} in room ${roomId}`)

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
    console.log(`Drawing submitted by member ${socket.id} in room ${roomId}`)
    if (
      Object.keys(drawingSubmissions[roomId]).length ===
      rooms[roomId].members.length
    ) {
      distributeDrawings(roomId)
    }
  })

  socket.on('startGame', (roomID) => {
    if (rooms[roomID] && rooms[roomID].host === socket.id) {
      rooms[roomID].gameStarted = true
      rooms[roomID].maxMembers = rooms[roomID].members.length * 2
      io.to(roomID).emit('gameStarted')
      console.log(`Game started in room: ${roomID}`)
    }
  })

  socket.on('nextRound', (roomID) => {
    if (rooms[roomID]) {
      rounds[roomID] = 0
      rooms[roomID].prompts = {}
      drawingSubmissions[roomID] = {}

      updateAndEmitOrders(roomID)

      io.to(roomID).emit('newRound')
      console.log(`New round started in room: ${roomID}`)
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected')
    if (currentRoom) {
      const room = rooms[currentRoom]
      room.members = room.members.filter((id) => id !== socket.id)

      if (room.gameStarted) {
        room.maxMembers -= 1
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

  console.log(`Updated orders for room ${roomID}:`)
  for (const [member, order] of Object.entries(orders)) {
    console.log(`Member ID: ${member}, Order: ${order.join(', ')}`)
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
      console.log(`Sent prompt from member ${sourceMember} to ${member}`)
    })
  } else {
    emitRoundOver(roomID)
  }
}

function distributeDrawings(roomID) {
  const members = rooms[roomID].members
  const drawings = drawingSubmissions[roomID]
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

      const drawing = drawings[sourceMember] || 'No drawing'
      io.to(member).emit('updateDrawing', drawing)
      console.log(`Sent drawing from member ${sourceMember} to ${member}`)
    })
  } else {
    emitRoundOver(roomID)
    drawingSubmissions[roomID] = {}
  }
}

function emitRoundOver(roomID) {
  io.to(roomID).emit('roundOver')
}

server.listen(port, () => {
  console.log(`Server running on local port ${port}...`)
})
