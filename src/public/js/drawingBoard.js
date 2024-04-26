const canvas = document.getElementById('canvas')
canvas.width = window.innerWidth - 300
canvas.height = window.innerHeight - 300

const blackButton = document.getElementById('blackButton')
const redButton = document.getElementById('redButton')
const greenButton = document.getElementById('greenButton')
const blueButton = document.getElementById('blueButton')
const pinkButton = document.getElementById('pinkButton')
const multiColourButton = document.getElementById('colour-picker')

const context = canvas.getContext('2d')
context.fillStyle = 'white'
context.fillRect(0, 0, canvas.width, canvas.height)

let isDrawing = false
let drawWidth = '2'
drawWidth = '2'
let drawColour = 'black'
const inputTimer = 25

canvas.addEventListener('mousedown', startDrawing, false)
canvas.addEventListener('mousemove', draw, false)
canvas.addEventListener('mouseup', stopDrawing, false)
canvas.addEventListener('mouseout', stopDrawing, false)

blackButton.addEventListener('click', () => changeColour('black'))
redButton.addEventListener('click', () => changeColour('red'))
greenButton.addEventListener('click', () => changeColour('green'))
blueButton.addEventListener('click', () => changeColour('blue'))
pinkButton.addEventListener('click', () => changeColour('pink'))

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
function activateInputPrompt(timeout) {
  return new Promise((resolve) => {
    const inputPrompt = document.getElementById('inputPrompt')
    const doneButton = document.getElementById('doneButton')
    const getInput = document.getElementById('getInput')

    // Show the inputPrompt
    inputPrompt.style.display = 'block'

    // Set a timeout to hide the inputPrompt
    const timeoutId = setTimeout(() => {
      inputPrompt.style.display = 'none'
      inputDone()
    }, timeout)

    // Add event listener to doneButton to hide the inputPrompt
    doneButton.addEventListener('click', inputEntered)

    // Add event listener to getInput to hide the inputPrompt when Enter is pressed
    getInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        inputEntered()
      }
    })

    function inputEntered() {
      inputPrompt.style.display = 'none'
      clearTimeout(timeoutId)
      inputDone()
    }

    function inputDone() {
      let prompt = getInput.value
      if (prompt == '') {
        prompt = getInput.placeholder
      }
      getInput.value = ''
      resolve(prompt) // Resolve the Promise with the prompt
    }
  })
}

function getPrompt() {
  activateInputPrompt(inputTimer * 1000).then((prompt) => {
    const promptText = document.getElementById('prompt')
    promptText.innerText = prompt
  })
}

getPrompt()
