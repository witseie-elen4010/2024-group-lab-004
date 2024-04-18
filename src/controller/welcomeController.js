exports.welcome = async (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
}
