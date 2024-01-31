// An API that provides a way to store bookmarks (urls) with a title
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')

// connect to the database
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.once('open', () => console.log('🦈 Connected to MongoDB'))

const port = process.env.PORT

const app = express()
app.use(morgan('dev'))
app.use(express.json())

const Bookmark = require('./models/Bookmark')

app.get('/bookmarks', (req, res) => {
  // query the database and return the results of the query in the response
  // the database query is asynchronous, so we need to use the .then() method
  Bookmark.find().then((results) => res.status(200).json(results))
})

app.post('/bookmarks', (req, res) => {
  const newBookmark = new Bookmark(req.body) // create the object
  newBookmark.save() // save it to the database
  res.status(201).json(newBookmark) // return the newly created object
})

app.get('/bookmarks/:bookmarkId', (req, res) => {
  // look up the specific bookmark that is being requested in the url, using the model
  Bookmark.findById(req.params.bookmarkId)
    .then((results) => {
      if (results) {
        res.status(200).json(results)
      } else {
        res.status(404).json({ message: 'not found' })
      }
    })
    .catch((error) => res.status(400).json({ message: 'Bad request' }))
})

app.listen(port, () => console.log(`🐷 Application is running on port ${port}`))
