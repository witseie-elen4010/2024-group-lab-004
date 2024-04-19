const path = require('path')

exports.welcome = async (req, res) => {
  path.join(__dirname, '..', './', 'public', 'html', 'testing.html')
}
