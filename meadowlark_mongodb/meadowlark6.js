/*
    meadowlark6.js , 開始加入Cookie和Session的實做 , 我們建立了一個憑證檔 credential.js ,這是要搭配
    cookie secret用來對我們的cookie進行加密 ,

    在操作cookie之前 ,我們也需要先 npm instasll cookie-parser , 將其載入並在中介函式中設定我們的cookie secret
    接下來在server丟回應時就可以簡單的設定cookie或signed cookie(注意名稱如果衝突時,會以signed cookie優先)

        res.cookie( "test" , "content") ; 
        res.cookie("test_with_signed" , "content" , { signed:true }) ;  
        其餘設置cookie的設定可以參考書的內容

    當server接收帶有cookie的請求時 , 也可以簡單的取出他們(如果真的有cookie) 

        const test_cookie = req.cookies.test  ;
        const test_cookie_with_signed = req.signedCookies.test_with_signed ; 


    書中講述了兩種Session用來保持狀態的架構 , 
    1.讓Cookie存放所有資訊 , 這種作法最好只用在資料量少 , 而且不在意用戶端可以看到這些資訊的情況 
      這個作法我有看到叫做 Session-based cookie , 也有人叫做  Cookie-based session

    2.Cookie用來存一個識別碼 , 其他的資訊都存在Server , 基本case是直接存在memory        
      但重啟/分散式Server的情況下直接存memory會有許多問題 , 不過ch13我們就會用DB去存Session來解決這個問題 
      這種作法叫做Session Store

    要處理session ,也要先安裝 npm install express-session ,並且設置其為中介函式 , 
    express-session可以接收組態物件(設定) , 選項可以參考書上內容

    設置完成後,設定與取用Session的內容就很簡單 , 注意session物件只有存放在request中 ,在使用上

        req.session.userName = "AAA"  ; 
        cosnt colorScheme = req.session.colorScheme || "dark"  ;
    
    
    本章節的實做使用session去實現快閃訊息 , 我們引入boostrap的CDN在主layout html中 , 
    並在lib/middleware加入我們用來處理快閃訊息的中介函式(就是如果req的session帶有快閃訊息 , 就把他拿下來加入傳進模板的context)
    我們測試快閃訊息的部份為 , 當用戶向/newsletter路由填寫表單(name,email)作為註冊後 , 我們要驗證他們的信箱是否有效

*/


const express = require("express") ;   
const app = express() 
const port = process.env.PORT || 3000   

// 載入模板引擎並設定 , 加入我們自訂的section helper
const expressHandlebars = require("express-handlebars") ;
// 加入定義了section helper的handlebars engine. 
app.engine("handlebars" , expressHandlebars.engine(
    {
        defaultLayout:"main" ,

        helpers: {
            section: function(name, options) {
              if(!this._sections) this._sections = {}
              this._sections[name] = options.fn(this)
              return null
            },
        } 
    }));
app.set("view engine" , "handlebars") ;


// 載入我們集成的handlers.js 
const handler = require("./lib/handlers3") ; 

// 載入我們自訂的取得天氣資料的中介函式 , 但只是命名為中介函式,實際上還需要在express框架去設定
const weatherMiddleware = require("./lib/middleware/weather") ; 

// 載入用來處理request-body的函式庫 
const bodyParser = require("body-parser") ; 


// 載入用來操作cookie的cookie parser 以及我們的憑證檔
const cookieParser = require("cookie-parser") ; 
const  credential  = require("./credential") ; 

// 載入Session中介函式的庫 , 注意將其設置成中介函式前要先將cookie中介函式設定完成!
const expressSession = require("express-session") ; 
// 載入我們用來將session內容放入context物件的middle ware ; 
const flashMiddleware = require("./lib/middleware/flash") ; 

// ------------------- 設置中介函式 -------------------

app.use(express.static(__dirname +"/public")) ; 
app.use(weatherMiddleware) ; 

// 將body-parser設置中介函式後 , 我們就可以使用res.body去拿請求的內文了(包含表單內容) 
// 注意雖然在這邊我們使用body來裝載內文 , 但查詢字串仍然可以用 ,我們在view內加入查詢字串的顯示
app.use(bodyParser.urlencoded({extended:true})) ;  

// 搭配使用fetch + json的方式 , 我們要讓bodyParser也能解析json
app.use(bodyParser.json()) ;

// 設定上先設定cookie中介函式再設定Session
app.use(cookieParser(credential.cookieSecret)) ; 
app.use(expressSession({
    resave : false ,                    // 請求沒有被更改的情況下要不要重新存session
    saveUninitialized :false ,          //是否可以直接把初始化的Session也儲存起來
    secret : credential.cookieSecret ,  // 用來簽署session的憑證 
}))

app.use(flashMiddleware) ; 

// --------------------- 處理路由 ---------------------


app.get("/" , handler.home)  ; 
app.get("/about" , handler.about ) ; 

// 我們的快閃訊息是要在用戶註冊newsletter後,驗證有效性並轉址, 這邊和書本不一樣 ,我把處理函式與regEx都寫到handlers3.js內了

// 加入普通HTML表單的routing
app.get("/newsletter-signup" , handler.newsletterSignup)  ;  // 這頁是處理進入填寫表單的路由 , 算是整個的開始
app.post("/newsletter-signup/process" , handler.newsletterSignupProcess) ;  // 使用HTML原生提交表單的處理 ,我們在handler3大幅改寫了這段處理
app.get("/newsletter-signup/thank-you" , handler.newsletterSignupThankYou) ; 

// 這邊也是ch9加入的 , 我們在處理註冊的handler中加入了針對註冊成功與失敗的redirect , 會將導引至此
app.get("/newsletter-archive",handler.newsletterSignupThankYou) ; 



app.use(
    handler.notFound
); 
app.use(
    handler.serverError 
); 



if (require.main == module){
    app.listen(
        port , ()=>{
            console.log( `Express started on http://localhost:${port}` );
            console.log( "Press the Ctrl-C to terminate :) " ); 
        }
    )
}
else {
    module.exports = app 
}
