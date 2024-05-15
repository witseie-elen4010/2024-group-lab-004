const socket = io()
const roomId = localStorage.getItem('roomId')
if (!roomId) {
  window.location.href = '/landing'
}

const host = localStorage.getItem('Host')
let CurrentSetIndex = 0
let CurrentImageIndex = 0
const CurrentImage = null
let CurrentGrid = null
let PlayerCount = 0
let drawingTool = 'pencil'
let timeLeft = 90
let votingCountdownTimer = null

let userDetails = ''
async function fetchUser() {
  const response = await fetch('/getUser')
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  } else {
    userDetails = await response.json()
    return userDetails
  }
}
if (host) {
  fetchUser().then((userDetails) =>
    socket.emit('joinGameRoom', roomId, userDetails, true)
  )
  localStorage.removeItem('Host')
} else {
  fetchUser().then((userDetails) =>
    socket.emit('joinGameRoom', roomId, userDetails, false)
  )
}

socket.on('userDisconnected', (data) => {
  if (data.membersCount < 3) {
    votingMessage.innerText = 'Too few players are left to play another round!'
    nextRoundButton.style.display = 'none'
    if (!data.roundOver && data.gameReady) {
      showMemberLeftOverlay('home')
      setTimeout(() => {
        window.location.href = '/landing'
      }, 2000)
    }
  } else {
    if (!data.roundOver && data.gameReady) {
      showMemberLeftOverlay('game')
      if (socket.id === data.host) {
        setTimeout(() => {
          socket.emit('nextRound', roomId)
          hideMemberLeftOverlay()
        }, 2000)
      }
    }
  }
})

socket.on('youAreTheNewHost', (data) => {
  if (data.votingSend) {
    data.membersCount > 2
      ? (nextRoundButton.style.display = 'block')
      : (votingMessage.innerText =
          'Too few players are left to play another round!')
  }
})

socket.on('updatePrompt', (prompt) => {
  hideWaitingContainer()
  inputPrompt.style.display = 'none'
  setPrompt(prompt)
})

socket.on('nextRoundStart', (membersCount) => {
  membersCount > 2
    ? (nextRoundButton.style.display = 'block')
    : (votingMessage.innerText =
        'Too few players are left to play another round!')
})

socket.on('updateDrawing', (drawing) => {
  hideWaitingContainer()
  activateInputPrompt(drawing)
})

socket.on('roundOver', (submissionGrid) => {
  prevSubmissionPrompt = false
  voted = false
  PlayerCount = submissionGrid.length
  showRoundOver(submissionGrid, CurrentSetIndex, CurrentImageIndex)
  console.log(submissionGrid)
  CurrentGrid = submissionGrid

  const buttons = document.getElementById('RoundOverButtons')
  buttons.style.display = 'flex'

  startCountdown(90)
})

function startCountdown(time = 90) {
  timeLeft = time
  document.getElementById(
    'votingCountdown'
  ).innerText = `Time left to vote: ${timeLeft}s`
  votingCountdownElement.innerText = `Time left to vote: ${timeLeft}s`

  if (votingCountdownTimer) {
    clearInterval(votingCountdownTimer)
  }
  votingCountdownTimer = setInterval(() => {
    timeLeft -= 1
    document.getElementById(
      'votingCountdown'
    ).innerText = `Time left to vote: ${timeLeft}s`
    votingCountdownElement.innerText = `Time left to vote: ${timeLeft}s`

    if (timeLeft <= 0) {
      openVotingPage()
      clearInterval(votingCountdownTimer)
      document.getElementById('votingCountdown').innerText = "Time's up!"
      votingCountdownElement.innerText = "Time's up!"
      votingButton.style.display = 'none'
      viewGameButton.style.display = 'none'
      leaveGameButton.style.display = 'block'
      votingMessage.style.display = 'block'
      handleAutomaticVote()
    }
  }, 1000)
}

function handleAutomaticVote() {
  if (!voted) {
    disableUserButtons()
    if (selectedUsername) {
      socket.emit('vote', { username: selectedUsername })
    } else {
      socket.emit('vote', { username: '' })
    }
    votingButton.disabled = true
    leaveGameButton.style.display = 'block'
  }
}

function showRoundOver(grid, setIndex, imageIndex) {
  leaderboardButton.style.display = 'none'
  const gridContainer = document.getElementById('roundOverOverlay')

  submissionUpper = grid[imageIndex][setIndex]
  submissionMiddle = grid[imageIndex + 1][setIndex]
  if (imageIndex + 2 < PlayerCount) {
    submissionLower = grid[imageIndex + 2][setIndex]
    const enablelower = document.getElementById('EndScreenLowerPrompt')
    enablelower.style.display = 'block'
  } else {
    submissionLower = { member: 'No one', content: 'No one' }
    const disablelower = document.getElementById('EndScreenLowerPrompt')
    disablelower.style.display = 'none'
  }

  const memberInfo = document.getElementById('UpperPrompt')
  memberInfo.textContent = `Submitted by: ${submissionUpper.member}`
  const memberInfoContainer = document.getElementById('upperPromptContainer')
  memberInfoContainer.textContent = ` ${submissionUpper.content} `

  const imagecontainer = document.getElementById('roundGridContainer')

  imagecontainer.src = submissionMiddle.content

  // for css styling
  imagecontainer.className = 'viewDrawing'

  imagecontainer.alt = `Drawing ${imageIndex + 1}`

  const DrawnByPrompt = document.getElementById('DrawnByPrompt')
  DrawnByPrompt.textContent = `Drawn by: ${submissionMiddle.member}`
  // imagecontainer.style.height = `60%`

  const prompt = document.getElementById('EndScreenLowerPromptAlter')
  prompt.textContent = `What ${submissionLower.member} thought it was: `

  const lowerPrompt = document.getElementById('lowerPrompt')
  lowerPrompt.textContent = ` ${submissionLower.content} `

  roundOverOverlay.style.display = 'flex'
}

function fetchLeaderboard() {
  socket.emit('requestLeaderboard')
}

let selectedUsername = ''
socket.on('receiveLeaderboard', (data) => {
  leaderboardEntries.innerHTML = '' // Clear previous entries
  container.innerHTML = '' // Clear previous entries
  data.forEach((player) => {
    const username = player.username || 'Unknown'
    const points = player.points || 0
    const entryDiv = document.createElement('div')
    entryDiv.className = 'leaderboard-entry'
    entryDiv.innerHTML = `<span>${username}</span><span>${points}</span>`
    leaderboardEntries.appendChild(entryDiv)
    const button = document.createElement('button')
    button.className = 'user-button'
    button.textContent = `${player.username}: ${player.points}`
    button.addEventListener('click', function () {
      const allButtons = container.querySelectorAll('.user-button')
      allButtons.forEach((b) => b.classList.remove('selected'))
      selectedUsername = player.username
      votingButton.disabled = false
      button.classList.add('selected')
    })
    container.appendChild(button)
  })
})

function disableUserButtons() {
  const userButtons = document.querySelectorAll('.user-button')
  userButtons.forEach((button) => {
    button.disabled = true
  })
}

const chatButton = document.getElementById('chatButton')
const chatContainer = document.getElementById('chatContainer')
const chatCloseButton = document.getElementById('chatCloseButton')
const chatMessages = document.getElementById('chatMessages')
const chatInput = document.getElementById('chatInput')
const chatSendButton = document.getElementById('chatSendButton')

chatButton.addEventListener('click', () => {
  chatContainer.style.display = 'block'
})

chatCloseButton.addEventListener('click', () => {
  chatContainer.style.display = 'none'
})

document.addEventListener('click', (e) => {
  if (!chatContainer.contains(e.target) && e.target !== chatButton) {
    chatContainer.style.display = 'none'
  }
})

chatSendButton.addEventListener('click', sendMessage)
chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage()
  }
})

function sendMessage() {
  const message = chatInput.value
  if (message.trim() === '') return

  socket.emit('sendMessage', { roomId, message })
  chatInput.value = ''
}

socket.on('receiveMessage', (data) => {
  const messageElement = document.createElement('div')
  messageElement.classList.add('chat-message')
  if (data.socketID === socket.id) {
    messageElement.classList.add('sent')
  } else {
    messageElement.classList.add('received')
  }
  messageElement.innerHTML = `
    <div class="username">${data.username}</div>
    <div class="message">${data.message}</div>
  `
  chatMessages.appendChild(messageElement)
  chatMessages.scrollTop = chatMessages.scrollHeight
})

let playerStatus = ''

socket.on('imposter', () => {
  document.getElementById('specialOverlay').style.display = 'none'
  localStorage.removeItem('roomId')
  playerStatus = 'imposter'
  setStatus()
})
socket.on('normal', () => {
  document.getElementById('specialOverlay').style.display = 'none'
  localStorage.removeItem('roomId')
  playerStatus = 'normal'
  setStatus()
})

socket.on('votingResult', function (result) {
  // Construct the message to display based on the voting result
  fetchLeaderboard()
  let message = ''
  if (result.result.equalImposterVotes) {
    message += `Two members received an equal number of votes - Imposter Victory!\n${result.result.imposter} Wins!`
  } else {
    message = `${result.result.mostVotedUser} was voted imposter with ${result.result.votes} votes.`
    if (result.result.isImposter) {
      message += ' They were the imposter! Crewmate Victory!'
    } else {
      message += ` They were NOT the imposter! Victory for imposter ${result.result.imposter}!`
    }
  }
  if (result.membersCount < 3) {
    message += '\nToo few players are left to play another round!'
  } else message += '\nWaiting for the next round to start...'
  votingMessage.innerText = message
  votingCountdownElement.style.display = 'none'
})

function showMemberLeftOverlay(action) {
  const messageOverlay = document.getElementById('specialOverlay')
  const centerImage = messageOverlay.querySelector('.centerImage')
  centerImage.style.display = 'none'
  const message = document.createElement('div')
  action === 'game'
    ? (message.innerText = 'A member has left the game... restarting game')
    : (message.innerText =
        'A member has left the game... Too few players left, returning to home page!')
  message.id = 'memberLeftMessage'
  message.style.fontSize = '24px'
  message.style.color = 'white'
  messageOverlay.appendChild(message)
  messageOverlay.style.display = 'flex'
}

function hideMemberLeftOverlay() {
  const messageOverlay = document.getElementById('specialOverlay')
  const message = document.getElementById('memberLeftMessage')
  if (message) {
    messageOverlay.removeChild(message)
  }
  const centerImage = messageOverlay.querySelector('.centerImage')
  centerImage.style.display = 'block'
  messageOverlay.style.display = 'none'
}

const canvas = document.getElementById('canvas')
canvas.width = window.innerWidth - 300
canvas.height = window.innerHeight - 350

const blackButton = document.getElementById('blackButton')
const redButton = document.getElementById('redButton')
const greenButton = document.getElementById('greenButton')
const blueButton = document.getElementById('blueButton')
const pinkButton = document.getElementById('pinkButton')
const multiColourButton = document.getElementById('colour-picker')
const clearButton = document.getElementById('clear')
const submitButton = document.getElementById('submit')
const drawingDisplay = document.getElementById('drawingDisplay')
const penSizeSlider = document.getElementById('size-picker')
const inputPrompt = document.getElementById('inputPrompt')
const doneButton = document.getElementById('doneButton')
const getInput = document.getElementById('getInput')
const inputCountdownBar = document.getElementById('inputCountdownBar')
const drawingCountdownBar = document.getElementById('drawingCountdownBar')
const helpButton = document.getElementById('helpButton')
const helpList = document.getElementById('helpList')
const helpListClose = document.getElementById('helpClose')
const drawing = document.getElementById('drawing')
const notDrawing = document.getElementById('notDrawing')
const undoButton = document.getElementById('undo')
const redoButton = document.getElementById('redo')
const waitingContainer = document.getElementById('waitingContainer')
const roundOverOverlay = document.getElementById('roundOverOverlay')
const leaveGameButton = document.getElementById('leaveGameButton')
const votingPageButton = document.getElementById('votingPageButton')
const upButton = document.getElementById('upButton')
const downButton = document.getElementById('downButton')
const prevSetButton = document.getElementById('prevSetButton')
const nextSetButton = document.getElementById('nextSetButton')
const pencilButton = document.getElementById('pencil')
const sprayPaintButton = document.getElementById('sprayPaint')
const blurButton = document.getElementById('blur')
const eraserButton = document.getElementById('eraser')
const leaderboardButton = document.getElementById('leaderboardButton')
const leaderboardContainer = document.getElementById('leaderboardContainer')
const leaderboardCloseButton = document.getElementById('leaderboardCloseButton')
const leaderboardEntries = document.getElementById('leaderboardEntries')
const overlay = document.getElementById('votingOverlay')
const container = document.getElementById('userButtonsContainer')
const votingButton = document.getElementById('voteButton')
const viewGameButton = document.getElementById('viewGameButton')
const votingCountdownElement = document.getElementById('votingPageCountdown')
const votingMessage = document.getElementById('votingPageMessage')
const nextRoundButton = document.getElementById('nextRoundButton')
const squareButton = document.getElementById('squareSelector')
const triangleButton = document.getElementById('triangleSelector')
const circleButton = document.getElementById('circleSelector')
const pentagramButton = document.getElementById('pentagramSelector')
let voted = false
let prevSubmissionPrompt = false
let timeoutIds = []

canvas.style.cursor = 'url(https://i.imgur.com/LaV4aaZ.png), auto'

leaderboardButton.addEventListener('click', () => {
  leaderboardEntries.innerHTML = ''

  const buttonRect = leaderboardButton.getBoundingClientRect()
  leaderboardContainer.style.top = `${buttonRect.bottom + 5}px`
  leaderboardContainer.style.right = `${
    window.innerWidth - buttonRect.right - 5
  }px`
  fetchLeaderboard()
  leaderboardContainer.style.display = 'block'
})

leaderboardCloseButton.addEventListener('click', () => {
  leaderboardContainer.style.display = 'none'
  leaderboardEntries.innerHTML = ''
})

document.addEventListener('click', (e) => {
  if (
    !leaderboardContainer.contains(e.target) &&
    e.target !== leaderboardButton
  ) {
    leaderboardContainer.style.display = 'none'
    leaderboardEntries.innerHTML = ''
  }
})
const exitButton = document.getElementById('exitButton')

eraserButton.addEventListener('click', () => {
  changeColour('white')
  canvas.style.cursor = 'url(https://i.imgur.com/RkwdmSu.png) 16 16, auto'
  drawingTool = 'pencil'
})

pencilButton.addEventListener('click', () => {
  canvas.style.cursor = 'url(https://i.imgur.com/LaV4aaZ.png), auto'
  console.log(context.strokeStyle)
  console.log(drawColour)
  if (drawColour == 'white') {
    changeColour('black')
  }
  drawingTool = 'pencil'
})

blurButton.addEventListener('click', () => {
  canvas.style.cursor = 'url(https://i.imgur.com/CNMfTWI.png) 16 16, auto'
  if (drawColour == 'white') {
    changeColour('black')
  }
  drawingTool = 'blur'
})

sprayPaintButton.addEventListener('click', () => {
  canvas.style.cursor = 'url(https://i.imgur.com/XQAlEMI.png) 16 16, auto'
  if (drawColour == 'white') {
    changeColour('black')
  }
  drawingTool = 'sprayPaint'
})

squareButton.addEventListener('click', () => {
  if (drawColour == 'white') {
    changeColour('black')
  }
  drawingTool = 'rectangle'
  canvas.style.cursor = 'url(https://i.imgur.com/LaV4aaZ.png), auto'
})

circleButton.addEventListener('click', () => {
  if (drawColour == 'white') {
    changeColour('black')
  }
  drawingTool = 'circle'
  canvas.style.cursor = 'url(https://i.imgur.com/LaV4aaZ.png), auto'
})

triangleButton.addEventListener('click', () => {
  if (drawColour == 'white') {
    changeColour('black')
  }
  drawingTool = 'triangle'
  canvas.style.cursor = 'url(https://i.imgur.com/LaV4aaZ.png), auto'
})

pentagramButton.addEventListener('click', () => {
  if (drawColour == 'white') {
    changeColour('black')
  }
  drawingTool = 'pentagram'
  canvas.style.cursor = 'url(https://i.imgur.com/LaV4aaZ.png), auto'
})

upButton.addEventListener('click', () => {
  if (CurrentImageIndex > 0) {
    CurrentImageIndex -= 2
  }
  showRoundOver(CurrentGrid, CurrentSetIndex, CurrentImageIndex)
})

downButton.addEventListener('click', () => {
  if (CurrentImageIndex < PlayerCount - 3) {
    CurrentImageIndex += 2
  }
  showRoundOver(CurrentGrid, CurrentSetIndex, CurrentImageIndex)
})

prevSetButton.addEventListener('click', () => {
  if (CurrentSetIndex > 0) {
    CurrentSetIndex -= 1
    const setbuttoncaption = document.getElementById('CurrentSet')
    setbuttoncaption.textContent = `Set ${CurrentSetIndex + 1}`
  }
  CurrentImageIndex = 0
  showRoundOver(CurrentGrid, CurrentSetIndex, CurrentImageIndex)
})

nextSetButton.addEventListener('click', () => {
  if (CurrentSetIndex < PlayerCount - 1) {
    CurrentSetIndex += 1
    const setbuttoncaption = document.getElementById('CurrentSet')
    setbuttoncaption.textContent = `Set ${CurrentSetIndex + 1}`
  }
  CurrentImageIndex = 0
  showRoundOver(CurrentGrid, CurrentSetIndex, CurrentImageIndex)
})

leaveGameButton.addEventListener('click', () => {
  window.location.href = '/landing'
})

nextRoundButton.addEventListener('click', () => {
  nextRoundButton.style.display = 'none'
  overlay.style.display = 'none'
  socket.emit('nextRound', roomId)
})

function openVotingPage() {
  votingButton.style.display = 'block'
  viewGameButton.style.display = 'block'
  votingCountdownElement.style.display = 'block'
  votingMessage.style.display = 'none'
  votingButton.disabled = true
  roundOverOverlay.style.display = 'none' // Hide the round over overlay
  fetchLeaderboard()
  overlay.style.display = 'flex' // Show the voting overlay
  leaveGameButton.style.display = 'none'
}
votingPageButton.addEventListener('click', () => {
  openVotingPage()
})

document
  .getElementById('viewGameButton')
  .addEventListener('click', function () {
    overlay.style.display = 'none'
    roundOverOverlay.style.display = 'flex'
  })

document.getElementById('voteButton').addEventListener('click', function () {
  if (selectedUsername !== '') {
    voted = true
    socket.emit('vote', { username: selectedUsername })
    disableUserButtons()
    votingMessage.innerText = 'Waiting for game submissions...'
    votingMessage.style.display = 'block'
    votingButton.style.display = 'none'
    viewGameButton.style.display = 'none'
    leaveGameButton.style.display = 'block'
  }
})

exitButton.addEventListener('click', () => {
  window.location.href = '/landing'
})

function endTimeout() {
  timeoutIds.forEach(clearTimeout)
  timeoutIds = []
}

socket.on('newRound', () => {
  endTimeout()
  prevSubmissionPrompt = false
  overlay.style.display = 'none'
  hideRoundOverOverlay()
  activateInputPrompt()
})

function hideRoundOverOverlay() {
  leaderboardButton.style.display = 'block'
  roundOverOverlay.style.display = 'none'
  waitingContainer.style.display = 'none'
}
const statusDisplay = document.getElementById('playerStatus')

const context = canvas.getContext('2d')
context.fillStyle = 'white'
context.fillRect(0, 0, canvas.width, canvas.height)

drawingDisplay.width = canvas.width / 4
drawingDisplay.height = canvas.height / 4

let isDrawing = false
let drawWidth = '10'
let drawColour = 'black'
let pastDrawings = []
let index = -1

function setStatus() {
  if (playerStatus === 'imposter') {
    statusDisplay.style.color = 'red'
    statusDisplay.innerText = 'You ARE the imposter!'
  } else {
    statusDisplay.style.color = 'black'
    statusDisplay.innerText = 'You are NOT the imposter!'
  }
}

const urlParams = new URLSearchParams(window.location.search)
const inputTimer = 25 * 1000
const drawingTimer = 60 * 1000

canvas.addEventListener('mousedown', startDrawing, false)
canvas.addEventListener('mousemove', draw, false)
canvas.addEventListener('mouseup', stopDrawing, false)
canvas.addEventListener('mouseout', stopDrawing, false)

blackButton.addEventListener('click', () => changeColour('black'))
redButton.addEventListener('click', () => changeColour('red'))
greenButton.addEventListener('click', () => changeColour('green'))
blueButton.addEventListener('click', () => changeColour('blue'))
pinkButton.addEventListener('click', () => changeColour('pink'))

changeLineWidth(penSizeSlider.value)

helpButton.addEventListener('click', function () {
  helpList.style.display = 'block'
})

helpListClose.addEventListener('click', function () {
  helpList.style.display = 'none'
})

penSizeSlider.addEventListener('input', () =>
  changeLineWidth(penSizeSlider.value)
)

submitButton.addEventListener('click', submitDrawing)

multiColourButton.addEventListener('input', () =>
  changeColour(multiColourButton.value)
)

clearButton.addEventListener('click', function () {
  const previousFillStyle = context.fillStyle
  context.fillStyle = '#FFFFFF' // Set fillStyle to white
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = previousFillStyle // Reset fillStyle to previous value

  index = -1
  pastDrawings = []
  undoButton.disabled = true
  redoButton.disabled = true
})

undoButton.addEventListener('click', function () {
  undo()
})
function undo() {
  if (index <= 0) {
    undoButton.disabled = true
  }
  redoButton.disabled = false
  index -= 1
  drawingShapeStart -= 1
  if (index <= -1) {
    context.fillRect(0, 0, canvas.width, canvas.height)
    index = -1
  } else {
    context.putImageData(pastDrawings[index], 0, 0)
  }
}

redoButton.addEventListener('click', function () {
  undoButton.disabled = false
  index += 1
  drawingShapeStart += 1
  if (index >= pastDrawings.length) {
    index = pastDrawings.length - 1
  } else {
    context.putImageData(pastDrawings[index], 0, 0)
  }
  if (index === pastDrawings.length - 1) {
    redoButton.disabled = true
  }
})

function changeLineWidth(width) {
  drawWidth = width
  context.lineWidth = drawWidth
}

function changeColour(colour) {
  drawColour = colour
  context.strokeStyle = drawColour
}

function startDrawing(e) {
  isDrawing = true
  context.beginPath()
  context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop)
  e.preventDefault()

  startX = e.clientX - canvas.offsetLeft
  startY = e.clientY - canvas.offsetTop
  drawingShapeStart = pastDrawings.length - 1
}

let lastPoint = null

let startX = 0
let startY = 0
let drawingShapeStart = 0

function restoreCanvasPosition(index) {
  if (index <= -1) {
    context.fillRect(0, 0, canvas.width, canvas.height)
  } else {
    context.putImageData(pastDrawings[index], 0, 0)
  }
}
function drawRectangle(e) {
  restoreCanvasPosition(drawingShapeStart)
  const mouseX = e.clientX - canvas.offsetLeft
  const mouseY = e.clientY - canvas.offsetTop

  // Clear canvas before drawing a new rectangle
  //context.clearRect(0, 0, canvas.width, canvas.height)

  // Calculate width and height of the rectangle
  const width = mouseX - startX
  const height = mouseY - startY

  // Draw the rectangle
  context.strokeRect(startX, startY, width, height)
}

function drawCircle(e) {
  restoreCanvasPosition(drawingShapeStart)
  const mouseX = e.clientX - canvas.offsetLeft
  const mouseY = e.clientY - canvas.offsetTop

  const radius = Math.sqrt(
    Math.pow(mouseX - startX, 2) + Math.pow(mouseY - startY, 2)
  )

  context.beginPath()
  context.arc(startX, startY, radius, 0, Math.PI * 2)
  context.closePath()
  context.stroke()
}

function drawTriangle(e) {
  restoreCanvasPosition(drawingShapeStart)
  const mouseX = e.clientX - canvas.offsetLeft
  const mouseY = e.clientY - canvas.offsetTop

  context.beginPath()
  context.moveTo(startX, startY)
  context.lineTo(mouseX, mouseY)
  context.lineTo(startX + (startX - mouseX), mouseY) // Calculate third point of triangle
  context.closePath()
  context.stroke()
}

function drawPentagram(e) {
  restoreCanvasPosition(drawingShapeStart)
  const newMouseX = e.clientX - canvas.offsetLeft
  const newMouseY = e.clientY - canvas.offsetTop
  const deltaX = newMouseX - startX
  const deltaY = newMouseY - startY
  outerRadius = Math.sqrt(deltaX ** 2 + deltaY ** 2)
  innerRadius = outerRadius / 2.5

  context.beginPath()
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
    const outerX = startX + Math.cos(angle) * outerRadius
    const outerY = startY + Math.sin(angle) * outerRadius
    const innerAngle = angle + (Math.PI * 2) / 10
    const innerX = startX + Math.cos(innerAngle) * innerRadius
    const innerY = startY + Math.sin(innerAngle) * innerRadius
    if (i === 0) {
      context.moveTo(outerX, outerY)
    } else {
      context.lineTo(outerX, outerY)
    }
    context.lineTo(innerX, innerY)
  }
  context.closePath()
  context.stroke()
}

function drawPencil(e, currentPoint) {
  context.lineTo(currentPoint.x, currentPoint.y)
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.stroke()
}

function drawBlur(e, currentPoint) {
  // Begin a new path for each circle
  context.beginPath()

  // Draw semi-transparent circles for a blur effect
  context.globalAlpha = 0.1 // Adjust transparency as needed
  context.fillStyle = context.strokeStyle

  if (lastPoint) {
    const distance = Math.sqrt(
      Math.pow(currentPoint.x - lastPoint.x, 2) +
        Math.pow(currentPoint.y - lastPoint.y, 2)
    )
    const angle = Math.atan2(
      currentPoint.y - lastPoint.y,
      currentPoint.x - lastPoint.x
    )

    for (let i = 0; i < distance; i += 10) {
      const x = lastPoint.x + i * Math.cos(angle)
      const y = lastPoint.y + i * Math.sin(angle)

      context.arc(x, y, context.lineWidth / 2, 0, Math.PI * 2)
      context.fill()
    }
  }

  context.globalAlpha = 1.0 // Reset transparency

  // Prevent the default action to avoid drawing a line
  e.preventDefault()
}

function drawSprayPaint(e, currentPoint) {
  // Begin a new path for each point
  context.beginPath()
  context.fillStyle = context.strokeStyle

  // Draw multiple points around the current point
  for (let i = 0; i < 5 * context.lineWidth; i++) {
    const angle = Math.random() * Math.PI * 2 // Random angle in radians
    const radius = (Math.random() * context.lineWidth) / 2 // Random radius within pen size

    const offset = {
      x: radius * Math.cos(angle), // Calculate x offset
      y: radius * Math.sin(angle), // Calculate y offset
    }

    context.fillRect(currentPoint.x + offset.x, currentPoint.y + offset.y, 1, 1)
  }

  // Prevent the default action to avoid drawing a line
  e.preventDefault()
}

function draw(e) {
  const currentPoint = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop,
  }

  if (isDrawing) {
    if (drawingTool === 'blur') {
      drawBlur(e, currentPoint)
    } else if (drawingTool === 'sprayPaint') {
      drawSprayPaint(e, currentPoint)
    } else if (drawingTool === 'pencil') {
      drawPencil(e, currentPoint)
    } else if (drawingTool === 'rectangle') {
      drawRectangle(e)
    } else if (drawingTool === 'triangle') {
      drawTriangle(e)
    } else if (drawingTool === 'circle') {
      drawCircle(e)
    } else if (drawingTool === 'pentagram') {
      drawPentagram(e)
    }
  }

  lastPoint = currentPoint
}

function stopDrawing(e) {
  if (isDrawing) {
    // context.stroke()
    context.closePath()
    isDrawing = false

    if (index < pastDrawings.length - 1) {
      pastDrawings = pastDrawings.slice(0, index + 1)
      index = pastDrawings.length - 1
    }
    pastDrawings.push(context.getImageData(0, 0, canvas.width, canvas.height))
    index += 1
    undoButton.disabled = index <= 0
    redoButton.disabled = index === pastDrawings.length - 1
  }
}

// let endTimeout = function () {}

function startDrawTimer() {
  drawingCountdownBar.style.width = '100%'
  drawingCountdownBar.style.transitionDuration = `${drawingTimer}ms`
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      drawingCountdownBar.style.width = '0%'
    })
  })
  const countdownBarTimeout = setTimeout(() => {
    submitDrawing()
  }, drawingTimer)
  timeoutIds.push(countdownBarTimeout)
  endTimeout = function () {
    clearTimeout(countdownBarTimeout)
    drawingCountdownBar.style.transition = 'none'
    drawingCountdownBar.style.width = '100%'
    void drawingCountdownBar.offsetWidth
    drawingCountdownBar.style.transition = ''
  }
}

function submitDrawing() {
  const image = canvas.toDataURL('image/png')
  // Get the length of the data URL in bytes

  stopDrawing({ type: 'mouseout' })

  const previousFillStyle = context.fillStyle
  context.fillStyle = '#FFFFFF' // Set fillStyle to white
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = previousFillStyle // Reset fillStyle to previous value

  index = -1
  pastDrawings = []
  undoButton.disabled = true
  redoButton.disabled = true
  endTimeout()
  prevSubmissionPrompt = false
  socket.emit('drawingSubmitted', { roomId, image })
  showWaitingContainer()
}

const colors = [
  'A red',
  'A blue',
  'A green',
  'A yellow',
  'An orange',
  'A purple',
  'A black',
  'A white',
  'A pink',
  'A grey',
]
const objects = [
  'cat',
  'dog',
  'car',
  'tree',
  'house',
  'sun',
  'moon',
  'star',
  'flower',
  'bird',
  'fish',
  'schoolbus',
  'spaceship',
  'robot',
  'unicorn',
  'dragon',
  'castle',
  'rainbow',
  'sword',
  'hamburger',
  'volcano',
  'coffee',
  'Einstein',
  'zombie',
  'T-Rex',
  'octopus',
  'elephant',
  'printer',
  'mouse',
  'spider',
  'alien',
  'clock',
]
const actions = [
  'jumping',
  'sleeping',
  'running',
  'eating',
  'dancing',
  'flying',
  'swimming',
  'singing',
  'crying',
  'laughing',
  'reading',
  'writing',
  'drawing',
  'painting',
  'cooking',
  'exploding',
  'recycling',
  'driving',
  'fishing',
  'sneezing',
  'sneaking',
  'hiding',
]

// maybe add a location as well, to get a more specific prompt?

// Function to generate a random prompt
function getRandomPrompt() {
  const color = colors[Math.floor(Math.random() * colors.length)]
  const object = objects[Math.floor(Math.random() * objects.length)]
  const action = actions[Math.floor(Math.random() * actions.length)]
  return `${color} ${object} ${action}`
}

// Function to set a random prompt as the default input value
function setRandomPrompt() {
  const randomPrompt = getRandomPrompt()
  const getInput = document.getElementById('getInput')
  getInput.placeholder = randomPrompt // Set the random prompt as placeholder
}

function activateInputPrompt(img = null) {
  setRandomPrompt()
  return new Promise((resolve) => {
    // the text displayed changes based on if an image is given (we are reviewing a drawing), or not (it is the start of the game)
    drawing.style.display = img ? 'block' : 'none'
    notDrawing.style.display = img ? 'none' : 'block'
    if (img) {
      drawingDisplay.src = img
    }

    // Show the inputPrompt
    inputPrompt.style.display = 'block'

    // Start the countdown
    inputCountdownBar.style.width = '100%'
    inputCountdownBar.style.transitionDuration = `${inputTimer}ms`
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inputCountdownBar.style.width = '0%'
      })
    })

    // Set a timeout to hide the inputPrompt
    const timeoutId = setTimeout(inputDone, inputTimer) // TODO: if the user submits themself, this shouldnt be called
    timeoutIds.push(timeoutId)
    function checkEnterKey(event) {
      if (event.key === 'Enter') {
        inputDone()
      }
    }

    function inputDone() {
      inputPrompt.style.display = 'none'
      drawingDisplay.src = ''

      // Reset the countdown bar and timer
      inputCountdownBar.style.width = '100%'
      void drawingCountdownBar.offsetWidth // force a reflow to apply the changes immediately
      clearTimeout(timeoutId)

      let prompt = getInput.value
      if (prompt == '') {
        prompt = getInput.placeholder
      }
      getInput.value = ''
      const promptText = document.getElementById('prompt')
      promptText.innerText = prompt

      // remove old event listeners, as they hold incorrect variable addresses
      doneButton.removeEventListener('click', inputDone)
      getInput.removeEventListener('keydown', checkEnterKey)
      showWaitingContainer()
      if (!prevSubmissionPrompt) {
        socket.emit('inputDone', { roomId, prompt }) // Emit the input value to the sockets in the room
      }
      prevSubmissionPrompt = true
      resolve(prompt) // Resolve the Promise with the prompt
    }

    doneButton.addEventListener('click', inputDone)
    getInput.addEventListener('keydown', checkEnterKey)
  })
}

function getPrompt(image = null) {
  if (image) {
    activateInputPrompt(image).then((prompt) => setPrompt(prompt))
  } else {
    activateInputPrompt().then((prompt) => setPrompt(prompt))
  }
}

function setPrompt(prompt) {
  const promptText = document.getElementById('prompt')
  promptText.innerText = prompt
  startDrawTimer()
}

function hideWaitingContainer() {
  waitingContainer.style.display = 'none'
}

function showWaitingContainer() {
  waitingContainer.style.display = 'flex'
}

activateInputPrompt()
