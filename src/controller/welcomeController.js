const path = require('path')

exports.login = async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html', 'login.html'))
}

exports.welcome = async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html', 'welcome.html'))
}

exports.waitForSession = (req, res, next) => {
  if (!req.session.isLoaded) {
    req.session.reload(function (err) {
      if (err) {
        // handle error
        console.log(err)
        res.status(500).send('An error occurred while reloading the session')
      } else {
        req.session.isLoaded = true
        next()
      }
    })
  } else {
    next()
  }
}

exports.landing = async (req, res) => {
  if (req.session.user) {
    res.sendFile(
      path.join(__dirname, '..', './public/html', 'landingPage.html')
    )
  } else {
    res.redirect('/') // Redirect to login if no session is found
  }
}

// exports.landing = async (req, res) => {
//   res.sendFile(path.join(__dirname, '..', './public/html', 'landingPage.html'))
// }
