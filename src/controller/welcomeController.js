const path = require('path')

// exports.welcome = async (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/html', 'index.html'))
// }

exports.login = async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html', 'login.html'))
}
