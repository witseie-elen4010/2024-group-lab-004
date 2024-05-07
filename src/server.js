const dotenv = require('dotenv')
const http = require('http')
const socketio = require('socket.io')

dotenv.config({ path: './config.env' })
const app = require('./app')
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || process.env.APP_PORT

let rooms = {}

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

  socket.on('joinRoom', (roomID) => {
    if (rooms[roomID]) {
      rooms[roomID].members.push(socket.id)
      socket.join(roomID)
      currentRoom = roomID
      io.to(roomID).emit('roomJoined', {
        roomId: roomID,
        members: rooms[roomID].members,
      })
      io.to(roomID).emit('updateMembers', rooms[roomID].members.length)
      console.log(`Joined room: ${roomID}`)
    } else {
      socket.emit('roomJoinError', 'Room does not exist')
    }
  })

  socket.on('joinGameRoom', (roomID) => {
    if (rooms[roomID]) {
      rooms[roomID].members.push(socket.id)
      socket.join(roomID)
      currentRoom = roomID
      io.to(roomID).emit('gameRoomJoined', {
        roomId: roomID,
        members: rooms[roomID].members,
      })
      console.log(`Joined room: ${roomID}`)

      // only get the imposters once everyone has joined the room
      if (rooms[roomID].members.length === rooms[roomID].gameSize) {
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

  socket.on('startGame', (roomID) => {
    if (rooms[roomID] && rooms[roomID].host === socket.id) {
      io.to(roomID).emit('gameStarted')
      rooms[roomID].gameSize = rooms[roomID].members.length
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
  return Math.random().toString(36).substring(2, 10) // make sure the room isnt already in use
}

function getImposter(room) {
  const randomIndex = Math.floor(Math.random() * room.members.length)
  return room.members[randomIndex]
}

server.listen(port, () => {
  console.log(`Server running on local port ${port}...`)
})
