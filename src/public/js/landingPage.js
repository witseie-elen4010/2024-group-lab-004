const socket = io()

const createRoomButton = document.getElementById('createRoom')
const joinRoomButton = document.getElementById('joinRoom')
const roomInfo = document.getElementById('roomInfo')
const roomIdSpan = document.getElementById('roomId')
const membersCountSpan = document.getElementById('membersCount')
const startGameButton = document.getElementById('startGame')
const joinRoomForm = document.getElementById('joinRoomForm')
const roomToJoinInput = document.getElementById('roomToJoin')
const submitJoinRoomButton = document.getElementById('submitJoinRoom')
let started = false

createRoomButton.addEventListener('click', () => {
  socket.emit('createRoom')
})

joinRoomButton.addEventListener('click', () => {
  joinRoomForm.style.display = 'block'
})

submitJoinRoomButton.addEventListener('click', () => {
  const roomToJoin = roomToJoinInput.value
  socket.emit('joinRoom', roomToJoin)
})

startGameButton.addEventListener('click', () => {
  const roomId = roomIdSpan.textContent
  socket.emit('startGame', roomId)
})

let hostId = ''
socket.on('roomCreated', (roomId) => {
  startGameButton.style.display = 'none' // Show the "Start Game" button for the host
  started = true
  createRoomButton.style.display = 'none'
  joinRoomButton.style.display = 'none'
  roomInfo.style.display = 'block'
  roomIdSpan.textContent = roomId
  hostId = socket.id
  localStorage.setItem('roomId', roomId) // Store room ID in local storage
  localStorage.setItem('hostId', socket.id) // Store host ID in local storage
})

socket.on('roomJoined', (data) => {
  createRoomButton.style.display = 'none'
  joinRoomButton.style.display = 'none'
  joinRoomForm.style.display = 'none'
  roomInfo.style.display = 'block'
  roomIdSpan.textContent = data.roomId
  localStorage.setItem('roomId', data.roomId) // Store room ID in local storage
  if ((localStorage.getItem('hostId') || hostId) !== socket.id) {
    startGameButton.style.display = 'none' // Hide the "Start Game" button for non-host members
  } else if (data.members.length >= 3) {
    startGameButton.style.display = 'block'
  }
})

socket.on('updateMembers', (membersCount) => {
  membersCountSpan.textContent = membersCount
  if (membersCount >= 3 && started) {
    startGameButton.style.display = 'block'
  }
})

socket.on('roomJoinError', (errorMessage) => {
  alert(errorMessage)
})

socket.on('gameStarted', () => {
  window.location.href = '/draw'
})

socket.on('userDisconnected', () => {
  const membersCount = parseInt(membersCountSpan.textContent, 10)
  membersCountSpan.textContent = membersCount - 1
})
