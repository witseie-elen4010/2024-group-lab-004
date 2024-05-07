const socket = io()
const roomId = localStorage.getItem('roomId')

// Redirect if no room ID is available
if (!roomId) {
  window.location.href = '/landing'
}

socket.emit('joinRoom', roomId)

socket.on('roomJoined', (data) => {
  console.log(`Joined room: ${data.roomId}`)
  console.log(`Members: ${data.members.join(', ')}`)
})

socket.on('updatePrompt', (prompt) => {
  // Show the drawing board and assign the received prompt
  inputPrompt.style.display = 'none'
  setPrompt(prompt)
})

// Listen for the 'updateDrawing' event from the server and handle the received drawing
socket.on('updateDrawing', (drawing) => {
  console.log('Received drawing:', drawing)
  activateInputPrompt(drawing)
})

const canvas = document.getElementById('canvas')
canvas.width = window.innerWidth - 300
canvas.height = window.innerHeight - 300

const blackButton = document.getElementById('blackButton')
const redButton = document.getElementById('redButton')
const greenButton = document.getElementById('greenButton')
const blueButton = document.getElementById('blueButton')
const pinkButton = document.getElementById('pinkButton')
const multiColourButton = document.getElementById('colour-picker')
const submitButton = document.getElementById('submit')
const drawingDisplay = document.getElementById('drawingDisplay')
const penSizeSlider = document.getElementById('size-picker')
const inputPrompt = document.getElementById('inputPrompt')
const doneButton = document.getElementById('doneButton')
const getInput = document.getElementById('getInput')
const inputCountdownBar = document.getElementById('inputCountdownBar')
const drawingCountdownBar = document.getElementById('drawingCountdownBar')
const helpButton = document.getElementById('HelpButton')
const HelpList = document.getElementById('HelpList')
const HelpListClose = document.getElementById('HelpClose')
const drawing = document.getElementById('drawing')
const notDrawing = document.getElementById('notDrawing')
const undoButton = document.getElementById('undo')
const redoButton = document.getElementById('redo')

const context = canvas.getContext('2d')
context.fillStyle = 'white'
context.fillRect(0, 0, canvas.width, canvas.height)

drawingDisplay.width = canvas.width / 4
drawingDisplay.height = canvas.height / 4

let isDrawing = false
let drawWidth = '2'
let drawColour = 'black'
let pastDrawings = []
let index = -1

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

helpButton.addEventListener('click', function () {
  HelpList.style.display = 'block'
})

HelpListClose.addEventListener('click', function () {
  HelpList.style.display = 'none'
})

penSizeSlider.addEventListener('input', () =>
  changeLineWidth(penSizeSlider.value)
)

submitButton.addEventListener('click', submitDrawing)
multiColourButton.addEventListener('input', () =>
  changeColour(multiColourButton.value)
)

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

function draw (e) {
  if (isDrawing) {
    context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.stroke()
  }
  e.preventDefault()
}

function stopDrawing (e) {
  if (isDrawing) {
    context.stroke()
    context.closePath()
    isDrawing = false

    if (index < pastDrawings.length - 1) {
      pastDrawings = pastDrawings.slice(0, index + 1)
      index = pastDrawings.length - 1
    }
    pastDrawings.push(context.getImageData(0, 0, canvas.width, canvas.height))
    index += 1
    console.log(index)
    undoButton.disabled = index <= 0
    redoButton.disabled = index === pastDrawings.length - 1
  }
}

const endTimeout = function () {}

// Prompt input is completed and sent to the server for aggregation
function submitPrompt () {
  const prompt = getInput.value || getInput.placeholder
  getInput.value = ''
  socket.emit('inputDone', { roomId, prompt })
  inputPrompt.style.display = 'none'
}

// Activate input prompt and only call `submitPrompt` when all are done
function activateInputPrompt (img = null) {
  console.log('here')
  drawing.style.display = img ? 'block' : 'none'
  notDrawing.style.display = img ? 'none' : 'block'
  if (img) {
    drawingDisplay.src = img
  }

  inputPrompt.style.display = 'block'
  inputCountdownBar.style.width = '100%'
  inputCountdownBar.style.transitionDuration = `${inputTimer}ms`

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      inputCountdownBar.style.width = '0%'
    })
  })

  // const timeoutId = setTimeout(submitPrompt, inputTimer)

  function checkEnterKey (event) {
    if (event.key === 'Enter') {
      submitPrompt()
    }
  }

  doneButton.addEventListener('click', submitPrompt)
  getInput.addEventListener('keydown', checkEnterKey)

  // endTimeout = function () {
  //   clearTimeout(timeoutId)
  //   inputCountdownBar.style.transition = 'none'
  //   inputCountdownBar.style.width = '100%'
  //   void inputCountdownBar.offsetWidth
  //   inputCountdownBar.style.transition = ''
  // }
}

function setPrompt (prompt) {
  const promptText = document.getElementById('prompt')
  promptText.innerText = prompt
  // startDrawTimer()
}

function startDrawTimer () {
  // drawingCountdownBar.style.width = '100%'
  // drawingCountdownBar.style.transitionDuration = `${drawingTimer}ms`
  // requestAnimationFrame(() => {
  //   requestAnimationFrame(() => {
  //     drawingCountdownBar.style.width = '0%'
  //   })
  // })
  // const countdownBarTimeout = setTimeout(() => {
  //   submitDrawing()
  // }, drawingTimer)
  // endTimeout = function () {
  //   clearTimeout(countdownBarTimeout)
  //   drawingCountdownBar.style.transition = 'none'
  //   drawingCountdownBar.style.width = '100%'
  //   void drawingCountdownBar.offsetWidth
  //   drawingCountdownBar.style.transition = ''
  // }
}

function submitDrawing () {
  const image = canvas.toDataURL('image/png')
  stopDrawing({ type: 'mouseout' })
  context.fillRect(0, 0, canvas.width, canvas.height)
  index = -1
  pastDrawings = []
  undoButton.disabled = true
  redoButton.disabled = true
  endTimeout()

  // For example, emit the image to the server or process it as needed
  console.log('Drawing submitted:', image)
  // You could add a socket emit here if you want to send the image to the server
  socket.emit('drawingSubmitted', { roomId, image })

  // Activate the input prompt for the next round if applicable
  activateInputPrompt()
}

// Begin the game by activating the user's first input prompt
activateInputPrompt()
