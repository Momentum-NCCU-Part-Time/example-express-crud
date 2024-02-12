const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const generateToken = () => bcrypt.hashSync(crypto.randomUUID(), 10)

module.exports = { generateToken }
