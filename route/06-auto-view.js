/*
    這個主題是自動算繪view , 在先前的例子中我們幾乎都是為每一個view提供一個路由處理式,
    在這之中,如果路由處理式只是一個簡單的導向某個頁面而非某些是因為某些功能而提供計算,
    那這樣我們為每一個view都提供一個簡單的路由處理式就是一個很沒必要的作法. 而接下來我們就是要處理這個問題
    
    接下來我們要直接設計一個簡單的路由處理式來自動提供view , 
    例如使用 '/foo' 來提供對 views/foo.handlebars 的路由而不用再做一個簡單的路由處立式( 哪怕只是arrow func )
*/

const express = require('express')
const expressHandlebars = require('express-handlebars')

const app = express()

// configure Handlebars view engine
app.engine('handlebars', expressHandlebars.engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.use(express.static(__dirname + '/public'))



// 提供首頁,使用的就是最基本的Arrow function行內路由處理
app.get('/', (req, res) => res.render('06-home.handlebars'))


// 接下來來做autoViews的部份,我們初始化autoViews這個物件作為cache , 並使用node.js的'fs' ,
// 用來檢查views模板是否存在 

const autoViews = {}
const fs = require('fs')
const { promisify } = require('util')
const fileExists = promisify(fs.exists)



// 整個路由處理式的邏輯如下: 
// 當一個路由進來,我們對其path進行處理,接著檢查該path是否已經存在於cache
// 若在cache則直接算繪回傳,否則就是再透過file system去檢查該路由是否有對應某個view
// 若有則使用該view進行算繪

// ( 我們將這個路由放在最底下, 是因為要讓這個路由在其他路由都檢查過沒有匹配後, 才到這個自動算繪的機制來 )
// 如果一個view已經被加入cache , 但我們手動把他的檔案刪除,則下一次訪問時就會造成error , 
// 因此一個更加穩當的作法,應該是把這個流程包在try-catch結構內,如果遇到error就應該重新確認一下檔案是否存在

app.use(async (req, res, next) => {
  const path = req.path.toLowerCase()
  // check cache; if it's there, render the view
  if(autoViews[path]) return res.render(autoViews[path])
  // if it's not in the cache, see if there's
  // a .handlebars file that matches
  if(await fileExists(__dirname + '/views' + path + '.handlebars')) {
    autoViews[path] = path.replace(/^\//, '')
    return res.render(autoViews[path])
  }
  // no view found; pass on to 404 handler
  next()
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log( `\nnavigate to http://localhost:${port}/staff`))