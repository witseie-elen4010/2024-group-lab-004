const socket = io()

// Elements
const createPrivateRoomButton = document.getElementById('createPrivateRoom')
const createPublicRoomButton = document.getElementById('createPublicRoom')
const joinPublicRoomButton = document.getElementById('joinPublicRoom')
const publicRoomsList = document.getElementById('publicRoomsList')
const joinRoomButton = document.getElementById('joinRoom')
const roomInfo = document.getElementById('roomInfo')
const roomIdSpan = document.getElementById('roomId')
const membersCountSpan = document.getElementById('membersCount')
const startGameButton = document.getElementById('startGame')
const joinRoomForm = document.getElementById('joinRoomForm')
const roomToJoinInput = document.getElementById('roomToJoin')
const submitJoinRoomButton = document.getElementById('submitJoinRoom')
let hostId = ''
let started = false

// Private Room Creation
createPrivateRoomButton.addEventListener('click', () => {
  socket.emit('createRoom', { public: false })
  hideCreateJoinButtons()
})

// Public Room Creation
createPublicRoomButton.addEventListener('click', () => {
  socket.emit('createRoom', { public: true })
  hideCreateJoinButtons()
})

// Join Room Form Display
joinRoomButton.addEventListener('click', () => {
  publicRoomsList.style.display = 'none'
  joinRoomForm.style.display = 'block'
})

// Join Public Room List Display
joinPublicRoomButton.addEventListener('click', () => {
  joinRoomForm.style.display = 'none'
  socket.emit('requestPublicRooms')
})

// Submit Join Room
submitJoinRoomButton.addEventListener('click', () => {
  const roomToJoin = roomToJoinInput.value
  socket.emit('joinRoom', { roomId: roomToJoin })
})

// Start Game
startGameButton.addEventListener('click', () => {
  const roomId = roomIdSpan.textContent
  localStorage.setItem('Host', 'true')
  socket.emit('startGame', roomId)
})

// Handle Room Created Event
socket.on('roomCreated', (roomId) => {
  startGameButton.style.display = 'none'
  started = true
  createPrivateRoomButton.style.display = 'none'
  createPublicRoomButton.style.display = 'none'
  joinRoomButton.style.display = 'none'
  joinPublicRoomButton.style.display = 'none'
  roomInfo.style.display = 'block'
  roomIdSpan.textContent = roomId
  hostId = socket.id
  localStorage.setItem('roomId', roomId)
  localStorage.setItem('hostId', socket.id)
})

// Handle Room Joined Event
socket.on('roomJoined', (data) => {
  hideCreateJoinButtons()
  createPrivateRoomButton.style.display = 'none'
  createPublicRoomButton.style.display = 'none'
  joinRoomButton.style.display = 'none'
  joinRoomForm.style.display = 'none'
  publicRoomsList.style.display = 'none'
  roomInfo.style.display = 'block'
  roomIdSpan.textContent = data.roomId
  localStorage.setItem('roomId', data.roomId)

  if ((localStorage.getItem('hostId') || hostId) !== socket.id) {
    startGameButton.style.display = 'none'
  } else if (data.members.length >= 3) {
    startGameButton.style.display = 'block'
  }
})

// Update Public Rooms List
socket.on('publicRoomsList', (rooms) => {
  publicRoomsList.style.display = 'block'
  publicRoomsList.innerHTML = rooms
    .map(
      (room) => `
      <div class="public-room">
        <div>Host: ${room.host}</div>
        <div>Members: ${room.members.length}</div>
        <button onclick="joinPublicRoom('${room.roomId}')">Join</button>
      </div>
    `
    )
    .join('')
})

socket.on('hostUpdated', (newHostId) => {
  if (socket.id === newHostId) {
    if (membersCountSpan.textContent >= 4) {
      startGameButton.style.display = 'block'
    }
  } else {
    startGameButton.style.display = 'none'
  }
})

socket.on('updateMembers', (membersCount) => {
  membersCountSpan.textContent = membersCount
  if (membersCount >= 3 && socket.id === hostId) {
    startGameButton.style.display = 'block'
  } else {
    startGameButton.style.display = 'none'
  }
})

socket.on('youAreTheNewHost', () => {
  hostId = socket.id
})

// Room Join Error Handling
socket.on('roomJoinError', (errorMessage) => {
  alert(errorMessage)
})

// Game Started Event
socket.on('gameStarted', () => {
  window.location.href = '/draw'
})

// User Disconnected Event
socket.on('userDisconnected', () => {
  const membersCount = parseInt(membersCountSpan.textContent, 10)
  membersCountSpan.textContent = membersCount - 1
})

// Join Public Room Function
function joinPublicRoom(roomId) {
  socket.emit('joinRoom', { roomId })
}

function hideCreateJoinButtons() {
  createPrivateRoomButton.style.display = 'none'
  createPublicRoomButton.style.display = 'none'
  joinRoomButton.style.display = 'none'
  joinPublicRoomButton.style.display = 'none'
  joinRoomForm.style.display = 'none'
}
