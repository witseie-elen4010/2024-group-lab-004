const path = require('path')

exports.board = async (req, res) => {
  res.sendFile(
    path.join(__dirname, '..', './', 'public', 'html', 'drawingBoard.html')
  )
}
