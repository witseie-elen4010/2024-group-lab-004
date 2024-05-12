const socket = io()
const roomId = localStorage.getItem('roomId')
if (!roomId) {
  window.location.href = '/landing'
}
let CurrentSetIndex = 0
let CurrentImageIndex = 0
const CurrentImage = null
let CurrentGrid = null
let PlayerCount = 0
let drawingTool = 'pencil'

let userDetails = ''
async function fetchUser () {
  const response = await fetch('/getUser')
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  } else {
    userDetails = await response.json()
    return userDetails
  }
}
fetchUser().then((userDetails) =>
  socket.emit('joinGameRoom', roomId, userDetails)
)

// socket.on('gameRoomJoined', (data) => {})

socket.on('updatePrompt', (prompt) => {
  // **** timer starts here//
  hideWaitingContainer()
  inputPrompt.style.display = 'none'
  setPrompt(prompt)
})

socket.on('updateDrawing', (drawing) => {
  // **** timer starts here//
  hideWaitingContainer()
  activateInputPrompt(drawing)
})

socket.on('roundOver', (submissionGrid) => {
  PlayerCount = submissionGrid.length
  showRoundOver(submissionGrid, CurrentSetIndex, CurrentImageIndex)
  console.log(submissionGrid)
  CurrentGrid = submissionGrid

  const buttons = document.getElementById('RoundOverButtons')
  buttons.style.display = 'flex'

  startCountdown()
})

function startCountdown () {
  let timeLeft = 90
  document.getElementById(
    'votingCountdown'
  ).innerText = `Time left to vote: ${timeLeft}s`

  const countdownTimer = setInterval(() => {
    timeLeft -= 1
    document.getElementById(
      'votingCountdown'
    ).innerText = `Time left to vote: ${timeLeft}s`

    if (timeLeft <= 0) {
      clearInterval(countdownTimer)
      document.getElementById('votingCountdown').innerText = "Time's up!"
    }
  }, 1000)
}

function showRoundOver (grid, setIndex, imageIndex) {
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

function fetchLeaderboard () {
  socket.emit('requestLeaderboard')
}

socket.on('receiveLeaderboard', (data) => {
  leaderboardEntries.innerHTML = '' // Clear previous entries
  data.forEach((player) => {
    const username = player.username || 'Unknown'
    const points = player.points || 0
    const entryDiv = document.createElement('div')
    entryDiv.className = 'leaderboard-entry'
    entryDiv.innerHTML = `<span>${username}</span><span>${points}</span>`
    leaderboardEntries.appendChild(entryDiv)
  })
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
const nextRoundButton = document.getElementById('nextRoundButton')
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
  showRoundOver(CurrentGrid, CurrentSetIndex, CurrentImageIndex)
})

nextSetButton.addEventListener('click', () => {
  if (CurrentSetIndex < PlayerCount - 1) {
    CurrentSetIndex += 1
    const setbuttoncaption = document.getElementById('CurrentSet')
    setbuttoncaption.textContent = `Set ${CurrentSetIndex + 1}`
  }
  showRoundOver(CurrentGrid, CurrentSetIndex, CurrentImageIndex)
})

leaveGameButton.addEventListener('click', () => {
  window.location.href = '/landing'
})

nextRoundButton.addEventListener('click', () => {
  socket.emit('nextRound', roomId)
})

exitButton.addEventListener('click', () => {
  window.location.href = '/landing'
})

socket.on('newRound', () => {
  hideRoundOverOverlay()
  activateInputPrompt()
})

function hideRoundOverOverlay () {
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

function setStatus () {
  if (playerStatus === 'imposter') {
    statusDisplay.style.color = 'red'
    statusDisplay.innerText = 'You ARE the imposter!'
  } else {
    statusDisplay.style.color = 'black'
    statusDisplay.innerText = 'You are NOT the imposter!'
  }
}

const urlParams = new URLSearchParams(window.location.search)
const inputTimer = (urlParams.get('inputTimer') || 25) * 1000
const drawingTimer = (urlParams.get('drawingTimer') || 60) * 1000

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
  if (index <= 0) {
    undoButton.disabled = true
  }
  redoButton.disabled = false
  index -= 1
  if (index <= -1) {
    context.fillRect(0, 0, canvas.width, canvas.height)
    index = -1
  } else {
    context.putImageData(pastDrawings[index], 0, 0)
  }
})

redoButton.addEventListener('click', function () {
  undoButton.disabled = false
  index += 1
  if (index >= pastDrawings.length) {
    index = pastDrawings.length - 1
  } else {
    context.putImageData(pastDrawings[index], 0, 0)
  }
  if (index === pastDrawings.length - 1) {
    redoButton.disabled = true
  }
})

function changeLineWidth (width) {
  drawWidth = width
  context.lineWidth = drawWidth
}

function changeColour (colour) {
  drawColour = colour
  context.strokeStyle = drawColour
}

function startDrawing (e) {
  isDrawing = true
  context.beginPath()
  context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop)
  e.preventDefault()
}

let lastPoint = null

function drawPencil (e, currentPoint) {
  context.lineTo(currentPoint.x, currentPoint.y)
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.stroke()
}

function drawBlur (e, currentPoint) {
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

function drawSprayPaint (e, currentPoint) {
  // Begin a new path for each point
  context.beginPath()
  context.fillStyle = context.strokeStyle

  // Draw multiple points around the current point
  for (let i = 0; i < 5 * context.lineWidth; i++) {
    const angle = Math.random() * Math.PI * 2 // Random angle in radians
    const radius = (Math.random() * context.lineWidth) / 2 // Random radius within pen size

    const offset = {
      x: radius * Math.cos(angle), // Calculate x offset
      y: radius * Math.sin(angle) // Calculate y offset
    }

    context.fillRect(currentPoint.x + offset.x, currentPoint.y + offset.y, 1, 1)
  }

  // Prevent the default action to avoid drawing a line
  e.preventDefault()
}

function draw (e) {
  const currentPoint = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop
  }

  if (isDrawing) {
    if (drawingTool === 'blur') {
      drawBlur(e, currentPoint)
    } else if (drawingTool === 'sprayPaint') {
      drawSprayPaint(e, currentPoint)
    } else {
      drawPencil(e, currentPoint)
    }
  }

  lastPoint = currentPoint
}

function stopDrawing (e) {
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

let endTimeout = function () {}

function startDrawTimer () {
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
  endTimeout = function () {
    clearTimeout(countdownBarTimeout)
    drawingCountdownBar.style.transition = 'none'
    drawingCountdownBar.style.width = '100%'
    void drawingCountdownBar.offsetWidth
    drawingCountdownBar.style.transition = ''
    console.log('cleared timeout')
  }
}

function submitDrawing () {
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
  'A gray'
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
  'raindbow',
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
  'clock'
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
  'hiding'
]

// maybe add a location as well, to get a more specific prompt?

// Function to generate a random prompt
function getRandomPrompt () {
  const color = colors[Math.floor(Math.random() * colors.length)]
  const object = objects[Math.floor(Math.random() * objects.length)]
  const action = actions[Math.floor(Math.random() * actions.length)]
  return `${color} ${object} ${action}`
}

// Function to set a random prompt as the default input value
function setRandomPrompt () {
  const randomPrompt = getRandomPrompt()
  const getInput = document.getElementById('getInput')
  getInput.placeholder = randomPrompt // Set the random prompt as placeholder
}

function activateInputPrompt (img = null) {
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

    function checkEnterKey (event) {
      if (event.key === 'Enter') {
        inputDone()
      }
    }

    function inputDone () {
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
      socket.emit('inputDone', { roomId, prompt }) // Emit the input value to the sockets in the room
      resolve(prompt) // Resolve the Promise with the prompt
    }

    doneButton.addEventListener('click', inputDone)
    getInput.addEventListener('keydown', checkEnterKey)
  })
}

function getPrompt (image = null) {
  if (image) {
    activateInputPrompt(image).then((prompt) => setPrompt(prompt))
  } else {
    activateInputPrompt().then((prompt) => setPrompt(prompt))
  }
}

function setPrompt (prompt) {
  const promptText = document.getElementById('prompt')
  promptText.innerText = prompt
  startDrawTimer()
}

function hideWaitingContainer () {
  waitingContainer.style.display = 'none'
}

function showWaitingContainer () {
  waitingContainer.style.display = 'flex'
}

activateInputPrompt()
