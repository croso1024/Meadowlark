/*
    Chapter.14 , 開始進一步說明關於路由的相關概念，其中一部份在於Infomation architecture(IA)的設計準則.
    另一方面就是URL的設定與SEO的關聯. 
    這節開始我們從多個不同主題開始說明在Express中與路由相關的概念與一些可用的方法

    以下就直接用書本上的多個Case加上我的註解來做一個學習紀錄
    第一個Case , 我們實際上可以對同一個路由設定不同的處理式, 在這個例子中第一個fifty-fifty的路由有50%的機率會傳遞到下一個

*/

const express = require('express')
const app = express()

app.get('/fifty-fifty', (req, res, next) => {
  if(Math.random() < 0.5) return next()
  res.send('sometimes this')
})
app.get('/fifty-fifty', (req,res) => {
  res.send('and sometimes that')
})

app.get('*', (req, res) => res.send('Check out the "<a href="/fifty-fifty">fifty-fifty</a>" page!'))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(
  `\nnavigate to http://localhost:${port}/fifty-fifty\n` +
  "\n...and try reloading a few times\n"))