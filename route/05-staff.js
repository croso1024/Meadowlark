/*
    接著要介紹的'路由參數'就是一個相當實用且重要的Express功能 , 用來把我們路由式的一部分變為參數,
    可以讓我們以觸發該路由式時實際傳入的參數來做相應的處理. 這是相當常用的功能,尤其是在建立REST API時

    這個例子,假設我們要幫員工建構資料網頁. 隨著員工的數量增加 , 若是手動的為每個員工建立路由那就是相當麻煩的一件事情
    因此在這個例子中路由參數就可以派上用場. 

    可以看到在第一個處理式'/staff/:name' 中 , :name 會匹配任何字串(不含斜線) ,
    而且我們可以在處理式的 req.params.name中拿到觸發這條式子時 :name 的值. 
    在處理式中,當我們使用某個名稱觸發了處理式,我們就先檢查該名子到底是不是員工,如果是的話才會帶著該員工資訊進入下一個部份render的結果 .

*/

const express = require('express')
const expressHandlebars = require('express-handlebars')
const app = express()

// the following is needed to use views
app.engine('handlebars', expressHandlebars.engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// for images & other static files
app.use(express.static(__dirname + '/public'))

const staff = {
  mitch: { name: "Mitch", bio: 'Mitch is the man to have at your back in a bar fight.' }, 
  madeline: { name: "Madeline", bio: 'Madeline is our Oregon expert.' },
  walt: { name: "Walt", bio: 'Walt is our Oregon Coast expert.' },
}

// 實際點選某個員工路由時的處理式, 即使用路由參數到資料中去查詢是否有該員工
app.get('/staff/:name', (req, res, next) => {
  const info = staff[req.params.name]
  if(!info) return next()   // will eventually fall through to 404
  res.render('05-staffer', info)
})

// 首頁的路由, 基本上就是列出所有可以進入的員工資料表,前面塞/staff/
app.get('/staff', (req, res) => {
  res.render('05-staff', { staffUrls: Object.keys(staff).map(key => '/staff/' + key) })
})

app.get('*', (req, res) => res.send('Check out the "<a href="/staff">staff directory</a>".'))

const port = process.env.PORT || 3000
app.listen(port, () => console.log( `\nnavigate to http://localhost:${port}/staff`))