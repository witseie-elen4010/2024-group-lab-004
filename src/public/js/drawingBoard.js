const canvas = document.getElementById('canvas')
canvas.width = window.innerWidth - 300
canvas.height = window.innerHeight * 0.5

const context = canvas.getContext('2d')
context.fillStyle = 'white'
context.fillRect(0, 0, canvas.width, canvas.height)
