const dotenv = require('dotenv')
const http = require('http')
const socketio = require('socket.io')

dotenv.config({ path: './config.env' })
const app = require('./app')
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || process.env.APP_PORT

// Global object to manage rooms and orders
const rooms = {}
// Global object to track drawing submissions
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
      prompts: {}
    }
    currentRoom = roomID
    socket.join(roomID)
    updateAndEmitOrders(roomID)
    socket.emit('roomCreated', roomID)
    console.log(`Room created: ${roomID}`)
  })

  socket.on('joinRoom', (roomID) => {
    if (rooms[roomID]) {
      rooms[roomID].members.push(socket.id)
      socket.join(roomID)
      currentRoom = roomID
      updateAndEmitOrders(roomID)
      socket.emit('roomJoined', {
        roomId: roomID,
        members: rooms[roomID].members
      })
      io.to(roomID).emit('updateMembers', rooms[roomID].members.length)
      console.log(`Joined room: ${roomID}`)
    } else {
      socket.emit('roomJoinError', 'Room does not exist')
    }
  })

  socket.on('inputDone', (data) => {
    const { roomId, prompt } = data

    // Store the prompt by member ID
    if (rooms[roomId]) {
      rooms[roomId].prompts[socket.id] = prompt
      console.log(`Received prompt from member ${socket.id} in room ${roomId}`)

      // Check if all members have submitted their prompts
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

    // Track the submitted drawing
    drawingSubmissions[roomId][socket.id] = image

    console.log(`Drawing submitted by member ${socket.id} in room ${roomId}`)

    // Check if all members have submitted their drawings
    if (
      Object.keys(drawingSubmissions[roomId]).length ===
      rooms[roomId].members.length
    ) {
      distributeDrawings(roomId)
    }
  })

  socket.on('startGame', (roomID) => {
    if (rooms[roomID] && rooms[roomID].host === socket.id) {
      io.to(roomID).emit('gameStarted')
      console.log(`Game started in room: ${roomID}`)
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected')
    if (currentRoom) {
      rooms[currentRoom].members = rooms[currentRoom].members.filter(
        (id) => id !== socket.id
      )
      if (rooms[currentRoom].orders[socket.id]) {
        delete rooms[currentRoom].orders[socket.id]
      }
      if (rooms[currentRoom].prompts[socket.id]) {
        delete rooms[currentRoom].prompts[socket.id]
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

function generateRoomId () {
  return Math.random().toString(36).substring(2, 10)
}

function generateUniqueOrders (numPlayers) {
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

function updateAndEmitOrders (roomID) {
  const members = rooms[roomID].members
  const uniqueOrders = generateUniqueOrders(members.length)
  rooms[roomID].orders = Object.fromEntries(
    members.map((member, index) => [member, uniqueOrders[index]])
  )

  console.log(`Updated orders for room ${roomID}:`)
  for (const [member, order] of Object.entries(rooms[roomID].orders)) {
    console.log(`Member ID: ${member}, Order: ${order.join(', ')}`)
  }

  io.to(roomID).emit('updateOrders', rooms[roomID].orders)
}

function distributePrompts (roomID) {
  const members = rooms[roomID].members
  const prompts = rooms[roomID].prompts

  members.forEach((member, index) => {
    let nextIndex = (index + 1) % members.length
    // Find the next member who isn't the current member
    while (members[nextIndex] === member) {
      nextIndex = (nextIndex + 1) % members.length
    }
    const nextMember = members[nextIndex]
    const prompt = prompts[nextMember] || 'No prompt'

    io.to(member).emit('updatePrompt', prompt)
    console.log(`Sent prompt to member ${member}: ${prompt}`)
  })
}

function distributeDrawings (roomID) {
  const members = rooms[roomID].members
  const drawings = drawingSubmissions[roomID]

  members.forEach((member, index) => {
    let nextIndex = (index + 1) % members.length
    // Find the next member who isn't the current member
    while (members[nextIndex] === member) {
      nextIndex = (nextIndex + 1) % members.length
    }
    const nextMember = members[nextIndex]
    const drawing = drawings[nextMember] || 'No drawing'

    io.to(member).emit('updateDrawing', drawing)
    // console.log(`Sent drawing to member ${member}: ${drawing}`)
  })

  // Reset the drawing submissions for the room
  drawingSubmissions[roomID] = {}
}

server.listen(port, () => {
  console.log(`Server running on local port ${port}...`)
})
