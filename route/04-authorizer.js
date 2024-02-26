/*
    我們接下來用一個延伸的登入授權例子來做示範,  , 我們大概重寫了一個簡單的handlebars模板,提供了一個輸入信箱跟密碼的form.
    使用post方法提交的/login這個路由, 而我們的處理式就是將這些帳號密碼以及授權放入session,轉址到登入的處理式,
    但在登入前我們串接了一個檢驗是否被授權的中介函式, 在必要的時候擋下未經授權的使用者.
    另外我們有串一個用來把session的內容搬到res.locals的中介,方便模板進行渲染. 

    實際上這邊的內容與我們在第10章節介紹中介函式時相當接近,只是我們call中介函式的方式改為直接定義在一整串的處理式中.
    我當時認為這樣當路由式一多似乎會有些混亂,但現在看來根據需求將相關路由式用連續call的方式串在一起可能是更加漂亮與易讀

*/
const express = require('express')
const expressHandlebars = require('express-handlebars')
const app = express()

// the following middlware is needed for sessions for our (simulated) logins
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const cookieSecret = Math.random().toString()
app.use(cookieParser(cookieSecret))
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: cookieSecret,
}))

// the following is needed to use views
app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '04-main' }))
app.set('view engine', 'handlebars')

// for images & other static files
app.use(express.static(__dirname + '/public'))

// this is our "fake" login...we're not checking username and password
// against anything
app.post('/login', (req, res) => {
  req.session.user = { email: req.body.email }
  req.session.authorized = true
  res.redirect('/secret')
})

// fake logout
app.get('/logout', (req, res) => {
  delete req.session.user
  delete req.session.authorized
  res.redirect('/public')
})

// make the user object available to all views by putting it in the "locals" context
app.use((req, res, next) => {
  if(req.session) res.locals.user = req.session.user
  next()
})

function authorize(req, res, next) {
  if(req.session.authorized) return next()
  res.render('not-authorized')
}

app.get('/public', (req, res) => res.render('public'))

app.get('/secret', authorize, (req, res) => res.render('secret'))

app.get('*', (req, res) => res.send('Check out the <a href="/public">public content</a>.'))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`\nnavigate to http://localhost:${port}/public`))