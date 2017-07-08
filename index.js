var express = require('express')
var app = express()
var _ = require('lodash')
var path = require('path')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var config = require('./config/default')

app.set('view engine', 'pug')
app.locals.basedir = path.join(__dirname, '/')

var port = process.env.PORT || 8080
var blocks = {}
var list = {}
var wordArray = []
var checkArray = []
var usedArray = []

var getRandomWord = () => {
  var result
  var count = 0
  for (var prop in config.words) {
    if (Math.random() < 1 / ++count) {
      result = prop
    }
  }
  return {
    word: result,
    description: config.words[result].description
  }
}

var getBlocks = () => {
  while (wordArray.length < 25) {
    var randomWord = getRandomWord()
    if (!_.includes(checkArray, randomWord.word)) {
      checkArray.push(randomWord.word)
      wordArray.push(randomWord)
    }
  }
  return {
    all: wordArray
  }
}

var parseCookies = (request) => {
  var rc = request.headers.cookie
  rc && rc.split(';').forEach((cookie) => {
    var parts = cookie.split('=')
    list[parts.shift().trim()] = decodeURI(parts.join('='))
  })
  return list
}

var setCookie = (res, content) => {
  res.cookie('loveIslandBingo', JSON.stringify(content), {expire: new Date() + 3600})
}

var checkOld = (req, res, used) => {
  var cookies = parseCookies(req)
  if (_.isUndefined(cookies['loveIslandBingo'])) {
    var content = getBlocks()
    setCookie(res, content.all)
  }
  var decodedCookie = JSON.parse(decodeURIComponent(cookies['loveIslandBingo']))
  if (!_.isNull(used)) {
    usedArray.push(used)
  }
  return {
    words: decodedCookie,
    used: usedArray
  }
}

app.get('/', (req, res) => {
  var content = getBlocks()
  setCookie(res, content.all, null)
  res.render(
    'home', {}
  )
})

app.get('/bingo/', (req, res) => {
  blocks = checkOld(req, res, null)
  res.render(
    'bingo', {
      blocks: blocks.words,
      used: blocks.used
    }
  )
})

app.post('/bingo/', (req, res) => {
  var pressed = _.head(Object.keys(req.body))
  blocks = checkOld(req, res, pressed)
  res.render(
    'bingo', {
      blocks: blocks.words,
      used: blocks.used
    }
  )
})

if (!module.parent) {
  app.listen(port)
  console.log('all your', port + ', r belong to us') // shoutout to the user
  exports = module.exports = app
}
