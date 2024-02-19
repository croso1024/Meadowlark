/*
    這邊使用作者提供的主程式來測試 , 主要也算是針對前面所學的一個總結 ,使用了許多前面介紹過的內容
    可以trace這支code來作為複習, 同時也引入我們在這一章所寫的中介函式與Session一同完成購物車的操作

    這支範例只使用了我們前面所寫針對商品免責聲明檢查的middleware 

    另外注意這一支code在首頁->加入購物車->送出購物車表單這一段
    session的更新是在送出購物車表單後進行處理 , 換句話說session第一次有購物車的值是到表單處理函式處理完轉址回去後才會出現
  
*/

const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')

const requiresWaiver = require('./lib/tourRequiresWaiver')

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
  { id: '6oC1Akf6EbcxWZXHQYNFwx', name: 'Manzanita Surf Expedition', price: 159.95 },
  { id: 'w6wTWMx39zcBiTdpM9w5J7', name: 'Wine Tasting in the Willamette Valley', price: 229.95 },
] 

// 這一段reduce操作比較迷 , 但實際上就是產生一個以product id為key的物件 , 物件的值就是上面products陣列內的整個物件
// ex. { hPc8... : { id:"hPc8..." , name:"Rock..." ,... } } 

// const productsById = products.reduce( 
//     (byId, p) => Object.assign(byId, { [p.id]: p }), {}
//   )

// 因為使用reduce有點迷,我這邊自己修一下做一樣的事情
const productsById = {}
products.forEach(
  (item) =>  {
      Object.assign(  productsById , { [item.id] : item} ) ; 
  }
)

// middleware to clear cart validation...without this, the warnings won't
// go away when we remove the offending items from the cart!
app.use((req, res, next) => {
  console.log("---------------------------------------------")
  console.log(`req url : ${req.url}`)
  const { cart } = req.session
  console.log("Always cart :",cart) ; 
  if(cart) cart.warnings = []
  next()
})

// middleware to check cart
app.use( requiresWaiver)

/*
    在下面的兩個路由處理式中 , 我們都使用了session來確保我們在切換路由的內容能夠被保留 ( 我們只在 "/" 和 "/add-to-cart" 這兩個部份遊走)
    用來記憶我們的購物車內容
*/
app.get('/', (req, res) => {

  console.log( "check session content" , req.session) ; 

  // 如果註解掉session的部份(如下面這行) , 則當我們提交表單觸發add-to-cart後 , 重新轉址回來主頁的部份將不會紀錄任何購物車內容
  // const cart = {items:[]}
  const cart = req.session.cart || { items: [] }

  const context = { products, cart }
  res.render('home', context)
})

app.post('/add-to-cart', (req, res) => {

  console.log(req.session) ; 

  if(!req.session.cart) req.session.cart = { items: [] }
  const { cart } = req.session

  // console.log(req.body) ; 
  // 這一段object.key .startWith是要抓出body內所有的商品 , 裡面只有商品編號以及這次add-to-cart的商品數量 如下:
  // {
  //   'guests-hPc8YUbFuZM9edw4DaxwHk': '0',
  //   'guests-eyryDtCCu9UUcqe9XgjbRk': '1',
  //   'guests-6oC1Akf6EbcxWZXHQYNFwx': '1',
  //   'guests-w6wTWMx39zcBiTdpM9w5J7': '0'
  // }
  
  // traverse整個body內的商品與下單數量 , 來修改cart物件
  Object.keys(req.body).forEach(key => {
    if(!key.startsWith('guests-')) return
    const productId = key.split('-')[1]
    const product = productsById[productId]
    const guests = Number(req.body[key]) // 把商品數量轉成數字
    if(guests === 0) return // no guests to add
    // 如果購物車內還沒有這項商品 , 將該物件推入(有點類似初始化dict()的感覺)
    if(!cart.items.some(item => item.product.id === productId)) cart.items.push({ product, guests: 0 })
    const idx = cart.items.findIndex(item => item.product.id === productId)
    const item = cart.items[idx]
    item.guests += guests
    if(item.guests < 0) item.guests = 0
    // 如果guests數量變成0了 , 從購物車裡面idx的索引開始砍掉一個item , 即砍掉該item
    if(item.guests === 0) cart.items.splice(idx, 1)
  })

  // 重新返回root , 注意我們上面的修改都是針對session內的cart物件再做操作 , 這些更動回到root的時候會被捕捉下來render home頁面
  res.redirect('/')
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log( `Express started on http://localhost:${port}` +
  '; press Ctrl-C to terminate.'))