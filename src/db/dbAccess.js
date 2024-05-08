const db = require('./database')

exports.saveDrawing = async (gameID, user_id, username, turn, data) => {
  const query =
    'INSERT INTO drawings (gameID, user_id, username, turn, data) VALUES ($1, $2, $3, $4, $5)'
  const values = [gameID, user_id, username, turn, data]

  db.query(query, values, (error) => {
    if (error) throw error
  })
}

exports.newGame = (names) => {
  return new Promise((resolve, reject) => {
    const game = {}
    game['gameName'] = 'why_is_this_needed'
    game['gameDate'] = new Date()
    for (let i = 0; i < names.length; i++) {
      game[`user${i + 1}`] = names[i]
    }

    const keys = Object.keys(game)
      .map((key) => `"${key}"`)
      .join(', ')
    const values = Object.values(game)
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')

    const query = `INSERT INTO games (${keys}) VALUES (${placeholders}) RETURNING "gameID"`
    console.log(query)
    console.log(values)

    db.query(query, values, (error, results) => {
      if (error) {
        reject(error)
      } else {
        console.log(`Created game with ID: ${results.rows[0].gameID}`)
        resolve(results.rows[0].gameID)
      }
    })
  })
}
// exports.newGame = async (names) => {
//   // Create an object to map names to user fields
//   const game = {}
//   game['gameName'] = 'why_is_this_needed'
//   game['gameDate'] = new Date()
//   for (let i = 0; i < names.length; i++) {
//     game[`user${i + 1}`] = names[i]
//   }

//   const keys = Object.keys(game)
//     .map((key) => `"${key}"`)
//     .join(', ')
//   const values = Object.values(game)
//   const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')

//   const query = `INSERT INTO games (${keys}) VALUES (${placeholders}) RETURNING "gameID"`
//   console.log(query)
//   console.log(values)

//   await db.query(query, values, (error, results) => {
//     if (error) throw error

//     console.log(`Created game with ID: ${results.rows[0].gameID}`)
//     return results.rows[0].gameID
//   })
// }
