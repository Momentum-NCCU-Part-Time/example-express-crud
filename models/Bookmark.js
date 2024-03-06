const mongoose = require('mongoose')

// define the schema for the Bookmark model
const bookmarkSchema = new mongoose.Schema(
  {
    title: String,
    url: String,
    notes: [{ text: String }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

// create the model and allow it to be used in other files
module.exports = mongoose.model('Bookmark', bookmarkSchema)


