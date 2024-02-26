/*
    這個Case我們要來說明前面,我們在一個get路由式中給了複數個處理式的情況. 
    我們就是將顯示商品頁面與 "在context中加入哪些商品是特價品的中介函數" 串連在一起.

*/
const express = require('express')
const expressHandlebars = require('express-handlebars')
const app = express()

// the following is needed to use views
app.engine('handlebars', expressHandlebars.engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// for images & other static files
app.use(express.static(__dirname + '/public'))

// this function simulates an asynchronous database call that returns a special
async function getSpecialsFromDatabase() {
  return {
    name: 'Deluxe Technicolor Widget',
    price: '$29.95',
  }
}

async function specials(req, res, next) {
  res.locals.special = await getSpecialsFromDatabase()
  next()
}

app.get('/page-with-specials', specials, (req, res) =>
  res.render('page-with-specials')
)

app.get('*', (req, res) => res.send('Check out the "<a href="/page-with-specials">specials</a>" page!'))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`\nnavigate to http://localhost:${port}/page-with-specials`))