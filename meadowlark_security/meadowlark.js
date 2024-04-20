/*
    Chapter.18 

    在本章中我們開始處理安全以及身份驗證的問題 , 

    -- Part.1 https &  csrf 
    
        一開始我們透過openssl自己生成的憑證 ,利用https就能夠簡單的啟動基於https的server , 

        除了https以外 , 我們考慮到CSRF攻擊的部份, 
        利用csurf來建立與驗證csrf token , 要求client的request必須帶有token才可正常訪問
        因此對於目前網站的POST request我們都需要在內文加入_csrf欄位 ,由csruf lib去幫我們檢查request中沒有_csrf的值.
        至此就能看到我們以前就在路由處理式中去檢查的CSRF token開始有值. 
        
        若是在表單的欄位中移除了_csrf或著沒有使用正確的token , 就會看到請求出現錯誤被導入我們的error handler,
        因為我將先前的多餘頁面與view都移除 , 這邊以fetch的newsletter為例 ,錯誤就會被catch區塊抓到並相應修改html

    -- Part.2 身份驗證

        在進行身份驗證前,我們加入使用者資料的資料模型,保存&存取使用者相關資訊,
        在這一節中我們要使用第三方的身份驗證服務,讓用戶可以使用他們在其他大型網站上的資料來登入.
        而對我們來說也是讓用戶透過第三方登入,來驗證該用戶確實是本人這樣.
        我把所有身份驗證相關的code寫在/lib/auth.js , 將程式碼各個部份結構區分明顯一些並且可以重用

        在一個第三方登入的流程中,我們的app實際上是透過轉址去運作整個流程.
        1. user到我們網站的登入頁面,在此我們提供第三方的驗證選項
            ( 假設用戶在沒有登入的情況下前往其他頁面,也可以將其導到這)
        2. 當用戶選擇其中一項後,觸發我們的路由處理式 , 我們在此建構auth request ,並轉址使用者到相應第三方
        3. 第三方登入帳號or授權訪問 , 此時同意授權的response是透過第三方建立,
            其包含了用戶的身份證明,並將使用者再次轉址回到我們的app
        4. 轉址回到我們的app,並確認來自第三方的auth response ,並產生session資料,我想還有將session id放cookit,
            之後就可以傳送登入成功的畫面回去了


        其他的特殊情況,例如使用者在沒有登入的情況下去了某些需要登入的頁面, 可以將其導引回step1的登入頁面,
        或著說 , 用戶在進行第三方驗證時,用戶不同意授權或用戶在第三方登入失敗等情況,我們也需要依據auth response的內容導引至適當的頁面
        以上的流程中 , 我們會使用到Passport這個套件來協助, 其不特定仰賴任何一種身份驗證方式(可以第三方,也可以在本地自己去進行登入驗證)
        
        在完成上述流程後,我們會將使用者的資料保存,並且做後續如依據使用者資訊進行渲染,
        以及根據角色別提供不同內容的功能.

        最後在我們已經完成的架構上加入對google的身份驗證,為了方便測試,我這邊把用google第三方登入的
        直接設置為employee身份



*/

const https = require("https") ; 
const fs = require('fs') ; 

const options = {
    key : fs.readFileSync(__dirname + '/ssl/meadowlark.pem'), 
    cert : fs.readFileSync(__dirname +'/ssl/meadowlark.crt')
}

const express = require('express') ; 
const app = express()  ; 
const port = process.env.PORT || 3000  ; 


// ------------------------------------------------------------------------
// Part.1 載入各個lib , 設置模板引擎,內文解析以及cookie,session和middleware 

// 設置 Handlebars view engine 
const expressHandlebars = require('express-handlebars') ; 
app.engine('handlebars' , expressHandlebars.engine(

    {
        defaultLayout:'main', 
        helpers : {
            section : function(name , options){ 
                if(!this._sections) { this._sections={} ; }  
                this._sections[name] = options.fn(this) ; 
                return null ; 
            }
        }
    }
)) ;
app.set('view engine' , 'handlebars') ; 


// ------------  我們集成的handlebars , 以及Database的介面 , 還有cookie ,session以及request解析相關的lib

// 從credential進行驗證後使用URL連線mongodb , 我這邊和書上不一樣,就是直接連接local mongodb 
require("./db") ; 
const credential = require('./credential');

const handlers = require('./lib/handlers') ; 
const restAPI = require("./lib/restapi") ; 

// 載入用來處理request-body的函式庫 
const bodyParser = require("body-parser") ; 
app.use(bodyParser.urlencoded({extended:true})) ; 
app.use(bodyParser.json());

// 載入用來操作cookie的cookie parser 以及我們的憑證檔
const cookieParser = require("cookie-parser") ; 
app.use(cookieParser(credential.cookieSecret)) ; 
// 載入Session中介函式的庫 , 注意將其設置成中介函式前要先將cookie中介函式設定完成!
const expressSession = require("express-session") ;
// 我們在本章節末尾加入了使用Redis來儲存Session的部份 
// 這邊和書上內容不一樣,我們額外裝了redis套件 , 並且初始化了redis的client , 才能將其作為參數傳遞給connect-redis
// 基本上就是參照connect-redis套件的文件說明 , 這邊和原始書中的code差蠻多的
const RedisStore = require("connect-redis").default; 
const {createClient} = require('redis') ; 
const redisClient = createClient({url:credential.redis.url }) 

redisClient.connect()
// redisClient.connect().catch(console.error) ; 

app.use(expressSession({
    resave : false ,                    // 請求沒有被更改的情況下要不要重新存session
    saveUninitialized :false ,          //是否可以直接把初始化的Session也儲存起來
    secret : credential.cookieSecret ,  // 用來簽署session的憑證 

    // store屬性用來指定保存session的方式,原先的預設是memeory , 我們在此使用Redis來做session的保存
    // 使用Redis來保存後,即便我們Server重啟, user曾經使用的狀態仍然可以被記得!
    // 而若是使用預設的memory store, 只有在Server沒有重開的情況下網頁重啟能被記得
    store : new RedisStore({
        client : redisClient , 
        logErrors : true , 
    })
    })
) ; 


// --- 處理身份驗證模組初始化與註冊路由,我們在auth.js匯出一個函數,此函數可以接受我們的組態並回傳init,register兩個界面
const createAuth = require('./lib/auth') ; 

const auth =  createAuth( app , {
    // baseUrl默認會是localhost ,
    // baseUrl: process.env.BASE_URL , 
    // 這個provider的意思就是"哪個第三方提供的驗證" ,因為我們可能有不只一組第三方授權,
    // 因此providers儲存每一個第三方授權的資訊供init使用
    providers:credential.authProviders , 
    successRedirect : '/account' , 
    failureRedirect : '/unauthorized' 
}) 
// 初始化並且連接passport中介函式
auth.init() ; 
// 指定第三方授權的路由 
auth.registerRoutes() ; 



// 處理照片上傳使用
const multiparty = require('multiparty')
// 載入我們自訂的取得天氣資料的中介函式 , 但只是命名為中介函式,實際上還需要在express框架去設定
const weatherMiddleware = require("./lib/middleware/weather") ; 
app.use(weatherMiddleware) ;  
app.use(express.static(__dirname + "/public") ) ; 

// 加入csurf middleware , 在response中加入token給瀏覽器下次的使用
// 接下來就在我們的view模板加入取得_csrfToken的欄位
const csrf = require("csurf") ; 
app.use( csrf({cookie:true}) );
app.use(   
    (req ,res , next) =>{
        res.locals._csrfToken = req.csrfToken() ;
        next() ; 
    }
)



// ------------------------------------------------------------------------
// Part.2 開始設定路由處理式

app.get("/" , handlers.home) ; 
app.get('/about' , handlers.about) ;
// 只保留使用json api的表單上傳與vacationPhoto處理 , 同時vacationPhoto的處理式中加入了我們在本章才引入的
// 本地檔案系統儲存以及Database的持久保存

// json-表單上傳
app.use('/api/newsletter' , handlers.api.newsletter) ; 
app.post('/api/newsletter-signup' , handlers.api.newsletterSignupProcess) ;

// json-照片上傳

app.get('/api/contest/vacation-photo-ajax' , handlers.api.vacationPhotoContestAjax) ; 

// 明天可以稍微re-factor一下 , 把處理式完全整入handler.js , 以及稍微簡化一下route

// 測試一下就算我主動攔截檔案上傳並改用fetch api來傳遞 , 原本的form上傳action是否仍會觸發
app.post('/api/contest/vacation-photo/:year/:mouth' , (req,res) =>{
    console.log("TEST : THIS IS PROVIDE FOR CONVENTION FILES UPLOADS ")
} ) ;

app.post('/api/vacation-photo-contest/:year/:mouth' , (req ,res) => {

    console.log("TEST : THE FILE IS UPLOADED BY FETCH API") ; 
    const form = new multiparty.Form() ; 
    form.parse(req , (err , fields , files )=>{

        if (err) {
            return handlers.api.vacationPhotoContestError( req , res , err.message) ;    
        }
        console.log(`Got fields :${fields}`);
        console.log(`Got files :${files}`);
        handlers.api.vacationPhotoContest( req , res ,fields , files ) ; 

    })

} )

// 從Database引入旅遊資訊
app.get('/vacations' ,handlers.listVacations ) ; 
// 這邊要特別注意一下 , 使用:currency在URL中 , 可以讓我們從處理式的 req.params中取用
// 而這個URL可以在vacations.handlebars中批配USD,GBP與BTC三種
app.get('/set-currency/:currency' , handlers.setCurrency ) ; 
app.get('/notify-me-when-in-season' , handlers.notifyWhenInSeasonForm) ; 
app.post('/notify-me-when-in-season' , handlers.notifyWhenInSeasonProcess ) ; 



// 連接REST API 
app.get('/api/vacations' , restAPI.getVacationsApi) 
app.get('/api/vacation/:sku',restAPI.getVacationBySkuApi) 
app.post('/api/vacation/:sku/notify-when-in-season' , restAPI.addVacationInSeasonListenerApi) 
app.delete("/api/vacation/:sku" , restAPI.requestDeleteVacationApi) 


const authHandler = require('./lib/authhandler') ; 

// 加入驗證帳戶的路由 , 只有經過驗證的使用者能進入這個頁面 ,
// 我們先串接檢驗身份,成功後才會進入到accountPage處理式去渲染畫面
// 題外話,因為我把google登入的使用者設置成employee,所以一登入反而會回到要求登入畫面(但實際上已經登入)
app.get('/account' , authHandler.customerOnly , authHandler.accountPage) ; 

app.get('/account/order-history' , authHandler.customerOnly ,authHandler.orderHistory); 

app.get('/account/email-preference' , authHandler.customerOnly , authHandler.emailPref) ;

// employee only的畫面, 書中並沒有幫這個路由做連結,
// 但我認為這可以變成以employee模式登入後才會在頁面中顯示有連結來到此處,所以我加上這個在home.handlebar
app.get('/sales' , authHandler.employeeOnly, authHandler.sales);


// 處理未登入的頁面
app.get('/unauthorized' , authHandler.unauthorized);
// 登出
app.get('/logout' , authHandler.logout)  ;


app.use(handlers.notFound) ; 
app.use(handlers.serverError) ; 


// -------------------------------------------
// Part.3 Start App

if (require.main == module){

    https.createServer(options , app).listen(
           port , ()=>{
            console.log( `Express started on http://localhost:${port}` );
            console.log( "Press the Ctrl-C to terminate :) " ); 
            } 
        )
}
else {
    module.exports = app 
}
