const path = require('path')

// exports.board = async (req, res) => {
//   if (req.session.user) {
//     res.sendFile(
//       path.join(__dirname, '..', './', 'public', 'html', 'drawingBoard.html')
//     )
//   } else {
//     res.redirect('/') // Redirect to login if no session is found
//   }
// }

exports.board = async (req, res) => {
  res.sendFile(
    path.join(__dirname, '..', './', 'public', 'html', 'drawingBoard.html')
  )
}
