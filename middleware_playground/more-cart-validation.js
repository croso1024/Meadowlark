/*
    這邊使用作者提供的主程式來測試 , 主要也算是針對前面所學的一個總結 ,使用了許多前面介紹過的內容
    可以trace這支code來作為複習, 同時也引入我們在這一章所寫的中介函式與Session一同完成購物車的操作

    這支範例使用了lib的cartValidation所定義的清除middleware來取代掉item-waiver裡面,我們在所有路由最前方做的清除warning , 
    並且在商品清單除了需要免責聲明以外也加入了最大商品適量的限制 , 讓快閃訊息的警告變成有warning和error兩種.

    其餘的處理邏輯則和item-waiver那支一樣,就不再額外補充
*/
const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')

const cartValidation = require('./lib/cartValidation')

const app = express()

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const secret = String(Math.random())
app.use(cookieParser(secret))
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret,
}))

// configure Handlebars view engine
app.engine('handlebars', expressHandlebars.engine({
  defaultLayout: 'main',
}))

app.set('view engine', 'handlebars')

const products = [
  { id: 'hPc8YUbFuZM9edw4DaxwHk', name: 'Rock Climbing Expedition in Bend', price: 239.95, requiresWaiver: true },
  { id: 'eyryDtCCu9UUcqe9XgjbRk', name: 'Walking Tour of Portland', price: 89.95 },
  { id: '6oC1Akf6EbcxWZXHQYNFwx', name: 'Manzanita Surf Expedition', price: 159.95, maxGuests: 4 },
  { id: 'w6wTWMx39zcBiTdpM9w5J7', name: 'Wine Tasting in the Willamette Valley', price: 229.95 },
]
const productsById = {}
products.forEach(
  (item) =>  {
      Object.assign(  productsById , { [item.id] : item} ) ; 
  }
)

// 先執行三個中介函式後才執行根路由

app.use(cartValidation.resetValidation)
app.use(cartValidation.checkWaivers)
app.use(cartValidation.checkGuestCounts)

app.get('/', (req, res) => {
  const cart = req.session.cart || { items: [] }
  const context = { products, cart }
  res.render('home', context)
})

app.post('/add-to-cart', (req, res) => {
  if(!req.session.cart) req.session.cart = { items: [] }
  const { cart } = req.session
  Object.keys(req.body).forEach(key => {
    if(!key.startsWith('guests-')) return
    const productId = key.split('-')[1]
    const product = productsById[productId]
    const guests = Number(req.body[key])
    if(guests === 0) return // no guests to add
    if(!cart.items.some(item => item.product.id === productId)) cart.items.push({ product, guests: 0 })
    const idx = cart.items.findIndex(item => item.product.id === productId)
    const item = cart.items[idx]
    item.guests += guests
    if(item.guests < 0) item.guests = 0
    if(item.guests === 0) cart.items.splice(idx, 1)
  })
  res.redirect('/')
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log( `Express started on http://localhost:${port}` +
  '; press Ctrl-C to terminate.'))