const Pool = require('pg').Pool

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HTTP,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
})

console.clear()
console.log(`Database server running on port ${pool.options.port}...`)

exports.query = async (text, params) => {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log('executed query', { text, duration, rows: res.rowCount })
  return res
}

module.exports = pool
