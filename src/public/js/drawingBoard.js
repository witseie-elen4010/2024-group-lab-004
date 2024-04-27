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

const inputPrompt = document.getElementById('inputPrompt')
const doneButton = document.getElementById('doneButton')
const getInput = document.getElementById('getInput')
const inputCountdownBar = document.getElementById('inputCountdownBar')
const drawingCountdownBar = document.getElementById('drawingCountdownBar')

const drawing = document.getElementById('drawing')
const notDrawing = document.getElementById('notDrawing')

const context = canvas.getContext('2d')
context.fillStyle = 'white'
context.fillRect(0, 0, canvas.width, canvas.height)

drawingDisplay.width = canvas.width / 4
drawingDisplay.height = canvas.height / 4

let isDrawing = false
let drawWidth = '2'
let drawColour = 'black'

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

submitButton.addEventListener('click', submitDrawing)
multiColourButton.addEventListener('input', () =>
  changeColour(multiColourButton.value)
)

function changeColour(colour) {
  drawColour = colour
  context.strokeStyle = drawColour
}

function startDrawing(e) {
  isDrawing = true
  context.beginPath()
  context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop)
  e.preventDefault()
}

function draw(e) {
  if (isDrawing) {
    context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop)
    //context.strokeStyle = drawColour
    context.lineWidth = drawWidth
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.stroke()
  }
  e.preventDefault()
}

function stopDrawing(e) {
  if (isDrawing) {
    context.stroke()
    context.closePath()
    isDrawing = false
  }

  if (e.type !== 'mouseout') {
    // pastDrawings.push(context.getImageData(0, 0, canvas.width, canvas.height))
    index += 1
  }
}

// stores the timeouts for the drawing bar, so that they can be ended from the submitdrawing function
let endTimeout = function () {}

function submitDrawing() {
  const image = canvas.toDataURL('image/png')
  context.fillRect(0, 0, canvas.width, canvas.height)

  endTimeout()

  getPrompt(image)
}

function activateInputPrompt(img = null) {
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
    const countdownBarTimer = setTimeout(() => {
      inputCountdownBar.style.width = '0%'
    }, 0)

    // Set a timeout to hide the inputPrompt
    const timeoutId = setTimeout(inputDone, inputTimer)

    function checkEnterKey(event) {
      if (event.key === 'Enter') {
        inputDone()
      }
    }

    function inputDone() {
      inputPrompt.style.display = 'none'

      // Reset the countdown bar and timer
      inputCountdownBar.style.width = '100%'
      clearTimeout(countdownBarTimer)
      clearTimeout(timeoutId)

      let prompt = getInput.value
      if (prompt == '') {
        prompt = getInput.placeholder
      }
      getInput.value = ''

      // remove old event listeners, as they hold incorrect variable addresses
      doneButton.removeEventListener('click', inputDone)
      getInput.removeEventListener('keydown', checkEnterKey)
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

function startDrawTimer() {
  drawingCountdownBar.style.width = '100%'
  drawingCountdownBar.style.transitionDuration = `${drawingTimer}ms`
  const countdownBarTimer = setTimeout(() => {
    drawingCountdownBar.style.width = '0%'
  }, 0)

  const countdownBarTimeout = setTimeout(() => {
    clearTimeout(countdownBarTimer)
    submitDrawing()
  }, drawingTimer)

  endTimeout = function () {
    clearTimeout(countdownBarTimeout)
    clearTimeout(countdownBarTimer)
    drawingCountdownBar.style.transition = 'none'
    drawingCountdownBar.style.width = '100%'
    // Force a reflow to apply the changes immediately
    void drawingCountdownBar.offsetWidth
    // Re-enable the transition
    drawingCountdownBar.style.transition = ''
  }
}

// start the game by getting the user's first prompt
getPrompt()
