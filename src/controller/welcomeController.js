const path = require('path')

exports.login = async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html', 'login.html'))
}

exports.welcome = async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html', 'welcome.html'))
}

// exports.landing = async (req, res) => {
//   if (req.session.user) {
//     res.sendFile(
//       path.join(__dirname, '..', './public/html', 'landingPage.html')
//     )
//   } else {
//     res.redirect('/') // Redirect to login if no session is found
//   }
// }

exports.landing = async (req, res) => {
  res.sendFile(path.join(__dirname, '..', './public/html', 'landingPage.html'))
}
