const mongoose = require('mongoose')
const auth = require('../auth')

// define the schema for the Bookmark model
const userSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
    auth: String,
  },
  { timestamps: true }
)

userSchema.methods.isAuthenticated = function () {
  return this.auth !== null
}

userSchema.methods.getToken = function () {
  if (!this.isAuthenticated()) {
    this.auth = auth.generateToken()
    this.save()
  }
  return this.auth
}
// create the model and allow it to be used in other files
module.exports = mongoose.model('User', userSchema)
