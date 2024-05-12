const dotenv = require('dotenv')
const http = require('http')
const socketio = require('socket.io')

dotenv.config({ path: './config.env' })
const app = require('./app')
const server = http.createServer(app)
const io = socketio(server)
const dbController = require('./controller/dbController')

const port = process.env.PORT || process.env.APP_PORT

const rooms = {}
const publicRooms = {}
const rounds = {}
const drawingSubmissions = {}
const users = new Map() // stores userDetails in the form {id, username}

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
      leaderboard: {},
      votes: {},
      voteCounts: 0,
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
        const allUserDetails = room.members.map((member) => users.get(member))
        io.to(roomID).emit('roomJoined', {
          roomId: roomID,
          members: allUserDetails,
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
    const { roomId } = data
    const room = rooms[roomId]

    if (!room) {
      return
    }
    if (!room.todo) {
      room.todo = []
    }
    data.socketID = socket.id
    room.todo.push(data)
    if (room.members.length !== room.gameSize) {
      // wait for everyone to join, then do this process
      return
    }

    sendPrompts(room)
  })

  function sendPrompts(room) {
    room.allJoined = true // this is true when all people have joined the gameroom, to discern a websocket disconnect from a user leaving the game
    for (const entry of room.todo) {
      const { roomId, prompt, socketID } = entry

      rooms[roomId].prompts[socketID] = prompt
      updateGridSubmission(
        roomId,
        users.get(socketID).username,
        'prompt',
        prompt,
        socketID
      )

      if (
        Object.keys(rooms[roomId].prompts).length ===
        rooms[roomId].members.length
      ) {
        distributePrompts(roomId)
        rooms[roomId].prompts = {}
      }
    }
    room.todo = []
  }

  socket.on('drawingSubmitted', (data) => {
    const { roomId, image } = data

    if (!drawingSubmissions[roomId]) {
      drawingSubmissions[roomId] = {}
    }

    drawingSubmissions[roomId][socket.id] = image

    if (!users.get(socket.id)) {
      // logging for the TOFIX right below this
      console.log('socket:', socket.id)
      console.log('users:', users)
      console.log('data:', data)
    }

    updateGridSubmission(
      roomId,
      users.get(socket.id).username, // TOFIX: this sometimes gives an error "cannot read properties of undefined"
      'drawing',
      image,
      socket.id
    )

    const username = users.get(socket.id).username
    const room = rooms[roomId]
    if (username && room.leaderboard) {
      room.leaderboard[username] += 10
    }

    if (
      Object.keys(drawingSubmissions[roomId]).length ===
      rooms[roomId].members.length
    ) {
      distributeDrawings(roomId)
    }
  })

  socket.on('joinGameRoom', (roomID, userDetails) => {
    const room = rooms[roomID]
    if (room) {
      room.members.push(socket.id)
      users.set(socket.id, userDetails)
      socket.join(roomID)
      currentRoom = roomID
      if (!(userDetails.username in rooms[roomID].leaderboard)) {
        rooms[roomID].leaderboard[userDetails.username] = 0
      }
      updateAndEmitOrders(roomID)
      room.grid = createRoomGrid(room.members.length)
      const allUserDetails = room.members.map((member) => users.get(member))
      io.to(roomID).emit('gameRoomJoined', {
        roomId: roomID,
        members: allUserDetails,
      })

      // only get the imposters once everyone has joined the room
      if (room.members.length === room.gameSize) {
        // create the gameroom in the database

        const imposter = getImposter(room)
        room.imposter = imposter // store the imposter so the server knows who it is

        // Send a "no" message to all other members
        room.members.forEach((member) => {
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

    if (room.todo && room.todo.length == room.gameSize) {
      // the prompt's have arrived before the game room was joined
      sendPrompts(room)
    }
  })

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

  socket.on('requestLeaderboard', () => {
    if (currentRoom) {
      const leaderboardEntries = Object.entries(
        rooms[currentRoom].leaderboard
      ).map(([username, points]) => ({ username, points }))
      socket.emit('receiveLeaderboard', leaderboardEntries)
    }
  })

  socket.on('vote', (data) => {
    const { roomId, username } = data
    console.log('please')
    if (currentRoom) {
      const room = rooms[currentRoom]
      console.log('here')
      if (!room.votes[username]) {
        room.votes[username] = 0
      }
      room.votes[username] += 1
      room.voteCounts += 1

      // Check if all votes are in (i.e., if every member has cast a vote)
      console.log(room.voteCounts)
      console.log(room.members.length)
      if (room.voteCounts === room.members.length) {
        const result = determineResults(room)
        io.to(currentRoom).emit('votingResult', result)
        console.log(`Voting complete in room ${roomId}. Result:`, result)
      }
    }
  })

  socket.on('disconnect', () => {
    if (currentRoom) {
      const room = rooms[currentRoom]
      const wasHost = room.host === socket.id
      room.members = room.members.filter((id) => id !== socket.id)
      users.delete(socket.id)

      if (wasHost) {
        room.host = room.members[0] // Elect a new host, simplest form
        io.to(room.host).emit('youAreTheNewHost')
      }

      io.to(currentRoom).emit('hostUpdated', room.host)

      if (room.gameStarted) {
        room.maxMembers -= 1
        delete publicRooms[currentRoom]
      }

      if (room.allJoined) {
        room.gameSize -= 1
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

function determineResults(room) {
  let maxVotes = 0
  let mostVotedUser = null

  // Determine who got the most votes
  for (const user in room.votes) {
    if (room.votes[user] > maxVotes) {
      maxVotes = room.votes[user]
      mostVotedUser = user
    }
  }

  // Assume imposter is a known property set elsewhere
  const isImposter = mostVotedUser === room.imposter
  console.log('Imposter', room.imposter)
  console.log('most voted user')
  return {
    mostVotedUser,
    votes: maxVotes,
    isImposter,
  }
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

function updateGridSubmission(roomID, username, type, content, socketID) {
  const orders = rooms[roomID].orders
  if (!rounds[roomID]) {
    rounds[roomID] = 0
  }
  const currentRound = rounds[roomID]

  const order = orders[socketID]
  const targetIndex = order[currentRound] - 1

  rooms[roomID].grid[currentRound][targetIndex] = {
    type,
    content,
    member: username,
  }
}

async function emitRoundOver(roomID) {
  const allUserIDs = rooms[roomID].members.map((member) => users.get(member).id)
  await assignGameID(roomID, allUserIDs)
  dbController.saveGrid(rooms[roomID].gameID, rooms[roomID].grid)
  io.to(roomID).emit('roundOver', rooms[roomID].grid)
}

async function assignGameID(roomID, allUserIDs) {
  rooms[roomID].gameID = await dbController.newGame(allUserIDs)
}

server.listen(port, () => {
  console.log(`Server running on local port ${port}...`)
})
