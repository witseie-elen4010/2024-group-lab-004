const path = require('path')

exports.admin = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/')
  }
  if (req.session.user.username !== 'admin' || req.session.user.id !== -289) {
    return res.redirect('/logout')
  }
  res.sendFile(path.join(__dirname, '../public/html', 'admin.html'))
}
