const canvas = document.getElementById('canvas')
canvas.width = window.innerWidth - 300
canvas.height = window.innerHeight * 0.5

const context = canvas.getContext('2d')
context.fillStyle = 'white'
context.fillRect(0, 0, canvas.width, canvas.height)

let isDrawing = false
let drawWidth = '2'
drawWidth = '2'
const drawColour = 'black'

canvas.addEventListener('mousedown', startDrawing, false)
canvas.addEventListener('mousemove', draw, false)
canvas.addEventListener('mouseup', stopDrawing, false)
canvas.addEventListener('mouseout', stopDrawing, false)

function startDrawing(e) {
  isDrawing = true
  context.beginPath()
  context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop)
  e.preventDefault()
}

function draw(e) {
  if (isDrawing) {
    context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop)
    context.strokeStyle = drawColour
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
    pastDrawings.push(context.getImageData(0, 0, canvas.width, canvas.height))
    index += 1
  }
}
