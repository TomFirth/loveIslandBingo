var express = require('express')
var app = express()
var _ = require('lodash')
var path = require('path')
var cookieParser = require('cookie-parser')
app.use(cookieParser())

var config = require('./config/default')

app.set('view engine', 'pug')
app.locals.basedir = path.join(__dirname, '/')

var port = process.env.PORT || 8080

getRandomWord = () => {
  var result;
  var count = 0;
  for (var prop in config.words) {
    if (Math.random() < 1/++count) {
      result = prop;
    }
  }
  return {
    word: result,
    description: config.words[result].description
  }
}

getBlocks = () => {
  var wordArray = []
  while (wordArray.length < 12) {
    var randomWord = getRandomWord()
    console.log('++ randomWord', randomWord.word)
    console.log('++wordArray', wordArray)
    if (!_.includes(wordArray, randomWord.word)) {
      console.log('++ does not exist')
      wordArray.push(randomWord)
    }
  }
  return wordArray
}

app.get('/', (req, res) => {
  res.render(
    'home', {}
  )
})

app.get('/bingo/', (req, res) => {
  var getNewBlocks = getBlocks()
  var blocks = {
    blocks: getNewBlocks
  }
  // if (_.isUndefined(req.cookies)) {
  //   res.cookie('loveIslandBingo' , '', {expire : new Date() + 3600}).send('Cookie is set')
  // }
  res.render(
    'bingo', blocks
  )
})

if(!module.parent) {
  app.listen(port)
  console.log('all your', port + ', r belong to us') // shoutout to the user
  exports = module.exports = app
}
