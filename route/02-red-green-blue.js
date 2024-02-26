/*
    上一個Case我們看到一個路由實際上可以綁定不只一個處理式,只要我們在邏輯的設計中讓他們都是會被使用到的那就是有效的,
    然而我們甚至不需要用兩次get , 而是可以直接將路由處理式串接的給 ,
    而這串連續多個的路由式在實務上算是蠻方便的, 我們可以把觸發到/rgb的路由分成多段式進行處理, 
    讓我們在需要的時候Call 某一段的處理式
    可以參考下一個example , 

*/
const express = require('express')
const app = express()

app.get('/rgb',
  (req, res, next) => {
    // about a third of the requests will return "red"
    if(Math.random() < 0.33) return next()
    res.send('red')
  },
  (req, res, next) => {
    // half of the remaining 2/3 of requests (so another third)
    // will return "green"
    if(Math.random() < 0.5) return next()
    res.send('green')
  },
  function(req, res){
    // and the last third returns "blue"
    res.send('blue')
  },
)

app.get('*', (req, res) => res.send('Check out the "<a href="/rgb">rgb</a>" page!'))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(
  `\nnavigate to http://localhost:${port}/rgb\n` +
  "\n...and try reloading a few times\n"))