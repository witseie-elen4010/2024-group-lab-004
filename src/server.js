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

  socket.on('createRoom', (options, userDetails) => {
    const roomId = generateRoomId()
    const isPublic = options.public || false
    users.set(socket.id, {
      id: userDetails.id,
      username: userDetails.username,
      socketId: socket.id
    })

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
      votingSend: false,
      roundOver: false,
      gameReady: false,
      playersReadyCount: 0
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

  socket.on('joinRoom', (data, userDetails) => {
    const roomID = data.roomId.trim()
    users.set(socket.id, {
      id: userDetails.id,
      username: userDetails.username,
      socketId: socket.id
    })

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
          host: room.host
        })
        io.to(roomID).emit('updateMembers', room.members.length)
      }
    } else {
      socket.emit('roomJoinError', 'Room does not exist')
    }
  })

  socket.on('requestPublicRooms', (userDetails) => {
    users.set(socket.id, userDetails)
    const roomsList = Object.entries(publicRooms).map(([roomId, room]) => ({
      roomId,
      host: users.get(room.host).username,
      members: room.members
    }))
    socket.emit('publicRoomsList', roomsList)
  })

  socket.on('inputDone', async (data) => {
    await new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (users.get(socket.id)) {
          clearInterval(intervalId)
          resolve()
        }
      }, 100) // Check every 100ms
    })
    const { roomId, prompt } = data
    rooms[roomId].prompts[socket.id] = prompt
    updateGridSubmission(
      roomId,
      users.get(socket.id).username,
      'prompt',
      prompt,
      socket.id
    )

    if (
      Object.keys(rooms[roomId].prompts).length === rooms[roomId].members.length
    ) {
      distributePrompts(roomId)
      rooms[roomId].prompts = {}
    }
  })

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

    if (
      Object.keys(drawingSubmissions[roomId]).length ===
      rooms[roomId].members.length
    ) {
      distributeDrawings(roomId)
    }
  })

  socket.on('joinGameRoom', (roomID, userDetails, host) => {
    const room = rooms[roomID]
    if (room) {
      if (host) {
        room.host = socket.id
      }
      room.members.push(socket.id)
      users.set(socket.id, {
        id: userDetails.id,
        username: userDetails.username,
        socketId: socket.id
      })
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
        socketId: socket.id
      })
      // only get the imposters once everyone has joined the room
      if (room.members.length === room.gameSize) {
        // create the gameroom in the database
        if (room.playersReadyCount === room.gameSize) {
          room.gameReady = true
        }
        const imposter = getImposter(room)
        room.imposter = imposter // store the imposter so the server knows who it is

        // Send a "no" message to all other members
        room.members.forEach((member) => {
          if (member === imposter && room.gameReady) {
            io.to(member).emit('imposter', true)
            room.imposterUsername = userDetails.username
          } else if (room.gameReady) {
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
      rooms[roomID].votingSend = false
      rooms[roomID].roundOver = false
      rounds[roomID] = 0
      rooms[roomID].prompts = {}
      drawingSubmissions[roomID] = {}
      rooms[roomID].grid = createRoomGrid(rooms[roomID].members.length)

      updateAndEmitOrders(roomID)
      const imposter = getImposter(rooms[roomID])
      rooms[roomID].imposter = imposter

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

    if (currentRoom) {
      const room = rooms[currentRoom]
      if (username !== '') {
        const room = rooms[currentRoom]
        if (!room.votes[username]) {
          room.votes[username] = 0
        }
        room.votes[username] += 1
      }
      room.voteCounts += 1
      if (room.voteCounts === room.members.length) {
        const result = determineResults(room)
        room.votingSend = true
        io.to(currentRoom).emit('votingResult', {
          result,
          membersCount: room.members.length
        })
        io.to(room.host).emit('nextRoundStart', room.members.length)
        room.votes = {}
        room.voteCounts = 0
      }
    }
  })

  socket.on('sendMessage', (data) => {
    const { roomId, message } = data
    const room = rooms[roomId]
    if (!room) {
      return
    }
    if (!room.chatMessages) {
      room.chatMessages = []
    }
    const userDetails = users.get(socket.id)
    const chatMessage = {
      username: userDetails.username,
      message,
      socketID: socket.id
    }
    room.chatMessages.push(chatMessage)
    io.to(roomId).emit('receiveMessage', chatMessage)
  })

  socket.on('disconnect', () => {
    if (currentRoom) {
      const room = rooms[currentRoom]
      const wasHost = room.host === socket.id
      room.members = room.members.filter((id) => id !== socket.id)
      if (room.gameStarted) {
        room.playersReadyCount++
      }
      const username = users.get(socket.id).username
      if (room.leaderboard && username in room.leaderboard) {
        delete room.leaderboard[username]
      }
      users.delete(socket.id)

      if (wasHost) {
        room.host = room.members[0] // Elect a new host, simplest form
        io.to(room.host).emit('youAreTheNewHost', {
          votingSend: room.votingSend,
          membersCount: room.members.length
        })
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
      io.to(currentRoom).emit('userDisconnected', {
        votingSend: room.votingSend,
        roundOver: room.roundOver,
        membersCount: room.members.length,
        gameReady: room.gameReady,
        host: room.host,
        currentRoom
      })
    }
  })
})

function generateAndAssignOrders (roomID) {
  const members = rooms[roomID].members
  const uniqueOrders = generateUniqueOrders(members.length)

  rooms[roomID].orders = Object.fromEntries(
    members.map((member, index) => [member, uniqueOrders[index]])
  )
  return rooms[roomID].orders
}

function generateRoomId () {
  return Math.random().toString(36).substring(2, 10)
}

function getImposter (room) {
  const leaderboardUsernames = Object.keys(room.leaderboard)
  const randomIndex = Math.floor(Math.random() * leaderboardUsernames.length)
  room.imposterUsername = leaderboardUsernames[randomIndex]
  return room.members[randomIndex]
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
  generateAndAssignOrders(roomID)

  const orders = rooms[roomID].orders
  const members = rooms[roomID].members

  for (const [member, order] of Object.entries(orders)) {
  }

  io.to(roomID).emit('updateOrders', orders)
}

function determineResults (room) {
  let maxVotes = 0
  let mostVotedUser = null
  let equalImposterVotes = false

  // Determine who got the most votes
  for (const user in room.votes) {
    if (room.votes[user] > maxVotes) {
      equalImposterVotes = false
      maxVotes = room.votes[user]
      mostVotedUser = user
    } else if (room.votes[user] === maxVotes) {
      equalImposterVotes = true
    }
  }

  const isImposter = mostVotedUser === room.imposterUsername
  if (mostVotedUser !== null) {
    Object.entries(room.leaderboard).forEach(([username, score]) => {
      if (
        (!isImposter && username === room.imposterUsername) ||
        (equalImposterVotes && username === room.imposterUsername) ||
        (isImposter &&
          username !== room.imposterUsername &&
          !equalImposterVotes)
      ) {
        room.leaderboard[username] += 100
      }
    })
  }

  return {
    mostVotedUser,
    votes: maxVotes,
    isImposter,
    equalImposterVotes,
    imposter: room.imposterUsername
  }
}

function distributePrompts (roomID) {
  if (!rooms[roomID].gameReady) rooms[roomID].gameReady = true
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

function distributeDrawings (roomID) {
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

function createRoomGrid (size) {
  return Array.from({ length: size }, () =>
    Array(size).fill({ type: null, content: null, member: null })
  )
}

function updateGridSubmission (roomID, username, type, content, socketID) {
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
    member: username
  }
}

async function emitRoundOver (roomID) {
  const allUserIDs = rooms[roomID].members.map((member) => users.get(member).id)
  await assignGameID(roomID, allUserIDs)
  dbController.saveGrid(rooms[roomID].gameID, rooms[roomID].grid)
  rooms[roomID].roundOver = true
  io.to(roomID).emit('roundOver', rooms[roomID].grid)
}

async function assignGameID (roomID, allUserIDs) {
  rooms[roomID].gameID = await dbController.newGame(allUserIDs)
}

server.listen(port, () => {
  console.log(`Server running on local port ${port}...`)
})
