const path = require('path')

exports.admin = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/')
  }
  if (
    req.session.user.username !== process.env.ADMIN_NAME ||
    req.session.user.id !== parseInt(process.env.ADMIN_ID, 10)
  ) {
    return res.redirect('/logout')
  }
  res.sendFile(path.join(__dirname, '../public/html', 'admin.html'))
}
