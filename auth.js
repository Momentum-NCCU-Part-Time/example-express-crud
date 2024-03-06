const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const generateToken = () => bcrypt.hashSync(crypto.randomUUID(), 10)

// function generateToken () {
//   return "reallybadtoken"
// }

module.exports = { generateToken }
