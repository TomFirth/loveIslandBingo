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
  var checkArray = []
  while (wordArray.length < 16) {
    var randomWord = getRandomWord()
    if (!_.includes(checkArray, randomWord.word)) {
      checkArray.push(randomWord.word)
      wordArray.push(randomWord)
    }
  }
  return {
    words: checkArray,
    all: wordArray
  }
}

app.get('/', (req, res) => {
  res.render(
    'home', {}
  )
})

app.get('/bingo/', (req, res) => {
  var getNewBlocks = getBlocks()
  if (_.isUndefined(req.cookies)) {
    res.cookie('loveIslandBingo' , getNewBlocks.words, {expire : new Date() + 3600}).send('Cookie is set')
  } else {
    var blocks = {
      blocks: getNewBlocks.all
    }
  }
  res.render(
    'bingo', blocks
  )
})

if(!module.parent) {
  app.listen(port)
  console.log('all your', port + ', r belong to us') // shoutout to the user
  exports = module.exports = app
}
