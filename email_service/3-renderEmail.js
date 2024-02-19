/*
    在這個範例中 , 我們要實做從購物車下訂單後自動寄出訂單編號等內容給到客戶指定的email中 
    主要的示範目標是使用view模板去Render HTML的email再寄出的功能 . 
    這使用到了我們在render中提供一個Callback , 讓渲染完成的html作為參數觸發callback來寄信
    細節可以看下面實做

    為了完善整個架構 ,因此我們配套著建立 cart-thank-you的 email與網站模板 , 
    同時透過home去讓使用者進行填寫購物車表單 
    購物車內容的傳遞基於先前介紹的session , 讓購物車內容可以在不同頁面之間傳遞

*/
const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const nodemailer = require('nodemailer')
const htmlToFormattedText = require('html-to-formatted-text')

const app = express()

const credentials = require('./credential')

// slightly modified version of the official W3C HTML5 email regex:
// https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
const VALID_EMAIL_REGEX = new RegExp('^[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~-]+@' +
  '[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?' +
  '(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$')


// 設定中介函式 , 我們在這個範例中使用了session , 因此也要導入cookieParser和expressSession 
app.engine('handlebars', expressHandlebars.engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser(credentials.cookieSecret))
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: credentials.cookieSecret,
}))

// 實體化用來寄信的transport 
const mailTransport = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  auth: {
    user: credentials.sendgrid.user,
    pass: credentials.sendgrid.password,
  },
})

/*
    主要路由的頁面 , 假設使用者已經選取完成購買商品在req.session中 , 
    此時頁面會提供一個表單讓使用者填入name / email , 表單處理式則為/cart/checkout
*/ 
app.get('/', (req, res) => {
    // simulate shopping cart
    req.session.cart = {
      items: [
        { id: '82RgrqGCAHqCf6rA2vujbT', qty: 1, guests: 2 },
        { id: 'bqBtwqxpB4ohuxCBXRE9tq', qty: 1 },
      ],
    }
    res.render('home')
  })
  

/*
    /cart/checkout HTML表單會將購物車送到這個路由來處理
    因此在這個部份我們要處理將內容存到Session , 以及確認使用者個各項內容是否正常, 

    首先確認來到這頁時 session確實有存著購物車 ,
    接下來我們從html form中拿出使用者名子與信箱並做檢查 . 一切ok以後
    "去渲染email的view模板" , 在這裡我們對render加入了一個Callback 

    回憶 render()的參數為 : res.render( views, [locals] , callback )  
    locals是提供來"覆蓋"掉res.locals內要提供給view的context物件 , (說是覆蓋但比較像是對set做add , 覆寫重複的key,其餘就是union) 
    而我們加上callback則可以使用渲染完成的模板去觸發callback
    
*/ 

app.post('/cart/checkout', (req, res, next) => {

	const cart = req.session.cart
	if(!cart) {
        const err = new Error("Cart does not exist") ; 
        next(err) ; 
    }
	const name = req.body.name || '', email = req.body.email || ''
	// input validation
	if(!email.match(VALID_EMAIL_REGEX)) {
        const err = new Error("Invalid email address") ; 
        return res.next(err) ;
    }
    // 指派一個購物車編號 , 這邊就是隨機產生數字並去除一些符號
	cart.number = Math.random().toString().replace(/^0\.0*/, '')
	cart.billing = {
		name: name,
		email: email,
	}

    // 這一步驟的Render並不是真的渲染頁面 , 而是額外提供了一個callback 
    // 當我們提供了callback的時候 , 被渲染出來的結果並不會被直接回到client端 ,而是會作為參數傳入callback

    // 讓我們渲染完成的模板作為email模板 , 而真正用來渲染感謝頁面的render()則包在寄信函數(callback)的後半段
    // {layout:null} , 這是為了避免在渲染email的時候也用到我們的網頁模板 , 當然我們也可以為email設置一個預設layout
    res.render('email/cart-thank-you', { layout: null, cart: cart },
    // render html , 但這是要拿來寄信的
    (err,html) => {

        console.log('rendered email: ', html)

        if(err) {
            console.log('error in email template')
        }

        mailTransport.sendMail({
          from: '"Meadowlark Travel": croso1024@gmail.com',
          to: cart.billing.email,
          subject: 'Thank You for Book your Trip with Meadowlark Travel',
          html: html,
          text: htmlToFormattedText(html),
        })
          .then(info => {
            console.log('sent! ', info)
            // 這裡才是真正的用來把網頁導向thank-you頁面的render
            res.render('cart-thank-you', { cart: cart })
          })
          .catch(err => {
            console.error('Unable to send confirmation: ' + err.message)
          })
    }
  )
})


app.use((req, res) => {
	console.log('(404) route not handled')
	res.send('404 - not found')
})

app.use((err, req, res, next) => {
	console.log('(500) unhandled error detected: ' + err.message)
	res.send('500 - server error')
})



const port = process.env.PORT || 3000
app.listen(port, () => console.log(`\nnavigate to http://localhost:${port}\n`))