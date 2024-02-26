/*
    Chapter.15 
        這一節我們基於在ch13所實做的旅遊網站版本之上，加入四個Rest API的端點.

        A. CORS 
        ---------------------------------
        在這一章節也加入CORS (cross origin resource shareing) ，讓我們的實做的API是可以被外部使用.
        CORS的基本概念是，當使用者所瀏覽的網站是基於domain.a提供時，所有送往domain.a的資源請求都是被允許的,
        但當我們還想要從domain.b取得資源時就會需要CORS的設定. 
        依照MDN的定義:
        """
        當使用者代理請求一個不是目前文件來源——例如來自於不同網域（domain）、
        通訊協定（protocol）或通訊埠（port）的資源時，
        會建立一個跨來源 HTTP 請求（cross-origin HTTP request）。
        """

        而在Express中設定cors的方法，可以直接使用 cors package : npm install cors 

        const cors = require('cors') 

        app.use(cors())  // 對所有資源開放跨來源請求的回應 

        app.use('/api' , cors() ) // 我們只對跨來源要求'/api'的路由進行回應
        

        
        B. API 測試
        ---------------------------------
        另外一件在本章所作的事情就是測試，因為許多browser只能使用GET/POST兩種HTTP method.
        這造成我們測試API有些麻煩, 但這個問題有很多工具可以處理,這邊先不討論.
        我們在這節想要示範的就是 "測試呼叫我們所設定的REST API" , 我們使用node-fetch這個package.
        npm install --save-dev node@fetch@2.6.0 
        他為node.js實現了瀏覽器的fetch api , 而相關的測試放在/tests/api/api.test.js內

*/


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

// 處理照片上傳使用
const multiparty = require('multiparty')
// 載入我們自訂的取得天氣資料的中介函式 , 但只是命名為中介函式,實際上還需要在express框架去設定
const weatherMiddleware = require("./lib/middleware/weather") ; 
app.use(weatherMiddleware) ;  

app.use(express.static(__dirname + "/public") ) ; 


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


app.use(handlers.notFound) ; 
app.use(handlers.serverError) ; 


// -------------------------------------------
// Part.3 Start App
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
