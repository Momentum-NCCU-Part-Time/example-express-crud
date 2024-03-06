// An API that provides a way to store bookmarks (urls) with a title
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcryptjs')

// connect to the database
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.once('open', () => console.log('🦈 Connected to MongoDB'))

const port = process.env.PORT

const app = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(cors())

const Bookmark = require('./models/Bookmark')
const User = require('./models/User')

app.get('/bookmarks', (req, res) => {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  User.findOne({ auth: token }).then((user) => {
    Bookmark.find({ user }, '-notes').then((results) =>
      res.status(200).json(results)
    )
  })
})

app.post('/bookmarks', (req, res) => {
  // check to see if user is authenticated
  const token = req.headers.authorization
  // find user by token
  User.findOne({ auth: token }).then((user) => {
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    // create a new bookmark object
    const newBookmark = new Bookmark({ ...req.body, user: user })
    newBookmark.save() // save it to the database
    res.status(201).json(newBookmark) // return the newly created object
  })
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

app.patch('/bookmarks/:bookmarkId', (req, res) => {
  // find the bookmark -- look it up in the db
  Bookmark.findById(req.params.bookmarkId)
    .then((bookmark) => {
      // if bookmark is not found, return 404
      if (bookmark) {
        // update the record somehow???
        bookmark.title = req.body.title || bookmark.title
        bookmark.url = req.body.url || bookmark.url
        // save it! (persist the changes to the database)
        bookmark.save()
        // send a success response + the json results
        res.status(200).json(bookmark)
      } else {
        res.status(404).json({ message: 'not found' })
      }
      // handle any errors that come up with appropriate responses to the client
    })
    .catch((error) => res.status(400).json({ message: 'Bad request' }))
})

app.delete('/bookmarks/:bookmarkId', (req, res) => {
  Bookmark.findByIdAndDelete(req.params.bookmarkId)
    .then((result) => {
      if (!result) {
        res.status(404).json({ message: 'Bookmark not found' })
      } else {
        res.status(204).json()
      }
    })
    .catch((error) => res.status(400).json({ message: error.message }))
})

// add notes to a bookmark

app.post('/bookmarks/:id/notes', (req, res) => {
  Bookmark.findById(req.params.id)
    .then((bookmark) => {
      if (!bookmark) {
        res.status(404).json({ message: 'Bookmark not found' })
      } else {
        const { title, text, priority } = req.body
        if (text) {
          bookmark.notes.push({ title, text, priority })
          bookmark
            .save()
            .then(() => res.status(201).json(bookmark.notes))
            .catch((error) => res.status(400).json({ message: error.message }))
        } else {
          res.status(400).json({ error: 'text field is required' })
        }
      }
    })
    .catch((error) => res.status(400).json({ message: error.message }))
})

app.patch('/bookmarks/:id/notes/:noteId', (req, res) => {
  // look up the bookmark
  Bookmark.findById(req.params.id)
    .then((bookmark) => {
      if (!bookmark) {
        res.status(404).json({ message: 'Bookmark not found' })
      } else {
        // if we find a bookmark, look up the note
        // https://mongoosejs.com/docs/subdocs.html#finding-a-subdocument
        const note = bookmark.notes.id(req.params.noteId)
        if (!note) {
          res.status(404).json({ message: 'Note not found' })
        } else {
          // if we find the note, update it using the data from the body of the request
          // or use the existing value if no new value is provided
          const { title, text, priority } = req.body
          note.title = title || note.title
          note.text = text || note.text
          note.priority = priority || note.priority
          // saving the parent document (bookmark) will save the changes to the subdocument (note)
          bookmark
            .save()
            .then(() => res.status(200).json(note))
            .catch((error) => res.status(400).json({ message: error.message }))
        }
      }
    })
    .catch((error) => res.status(400).json({ message: error.message }))
})


const validateAuthRequestBody = (req, res, next) => {
  if (Object.keys(req.body).includes('password', 'username')) {
    next()
  } else {
    res
      .status(400)
      .json({ message: 'Username and password fields are required.' })
  }
}
// User register
app.post('/register', validateAuthRequestBody, (req, res) => {
  const { username, password } = req.body
  User.findOne({ username: req.body.username }).then((user) => {
    if (user) {
      res.status(400).json({ message: 'User already exists' })
    } else {
      const hashedPassword = bcrypt.hashSync(password, 8)
      const newUser = new User({ username, password: hashedPassword })
      newUser.save()
      res.status(201).json({ username: newUser.username, id: newUser._id })
    }
  })
})

// User login
app.post('/login', validateAuthRequestBody, (req, res) => {
  const { username, password } = req.body
  console.log({ username, password })
  User.findOne({ username }).then((user) => {
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' })
    }
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        const token = user.getToken()
        res.status(200).json({ auth: token })
      } else {
        res.status(401).json({ message: 'Unauthorized' })
      }
    })
  })
})

// User logout
app.delete('/logout', (req, res) => {
  const token = req.headers.authorization
  User.findOne({ auth: token }).then((user) => {
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    user.auth = null
    user.save()
    res.status(204).json()
  })
})



app.listen(port, () => console.log(`🐷 Application is running on port ${port}`))
