const dotenv = require('dotenv')
const http = require('http')
const socketio = require('socket.io')

dotenv.config({ path: './config.env' })
const app = require('./app')
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 4000

let rooms = {}
rooms = {}

io.on('connection', (socket) => {
  console.log('New WebSocket connection')
  let currentRoom = null

  socket.on('createRoom', () => {
    const roomID = generateRoomId()
    rooms[roomID] = { members: [socket.id], host: socket.id }
    socket.join(roomID)
    currentRoom = roomID
    socket.emit('roomCreated', roomID)
    console.log(`Room created: ${roomID}`)
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
      io.to(currentRoom).emit('userDisconnected')
    }
  })

  socket.on('inputDone', (data) => {
    io.to(data.roomId).emit('updatePrompt', data.prompt)
  })
})

function generateRoomId() {
  return Math.random().toString(36).substring(2, 10)
}

server.listen(port, () => {
  console.log(`Server running on local port ${port}...`)
})
