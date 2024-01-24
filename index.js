// An API that provides a way to store bookmarks (urls) with a title
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const port = process.env.PORT

const app = express()
app.use(morgan('dev'))
app.use(express.json())

const bookmarkDB = [
  {
    "title": "Google",
    "url": "https://www.google.com"
  },
  {
    "title": "momentum-nccu-course",
    "url": "https://momentum-nccu-part-time.github.io/course"
  }
]

app.get("/bookmarks", (req, res) => {
  res.status(200).json({bookmarks: bookmarkDB})
})

app.post("/bookmarks", (req, res) => {
  // get the data from the body of the POST request
  // use that data to create a new bookmark obj
  const newBookmark = req.body
  // add that new obj to the array of existing bookmarks
  bookmarkDB.push(newBookmark)
  res.status(201).json(newBookmark)
})

app.listen(port, () => console.log(`🐷 Application is running on port ${port}`))
