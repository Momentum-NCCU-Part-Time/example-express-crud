const mongoose = require('mongoose')

// define the schema for the Bookmark model
const bookmarkSchema = new mongoose.Schema({
  title: String,
  url: String,
})

// create the model and allow it to be used in other files
module.exports = mongoose.model('Bookmark', bookmarkSchema)
