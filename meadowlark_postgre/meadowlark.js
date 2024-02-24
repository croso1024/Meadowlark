/*
    Chapter13.  
        這一章開始我們要為我們的網站加入資料庫進行檔案儲存 , 這一個資料夾內存放使用Postgre的版本.

        注意因為我沒有在本機裝postgre,所以這邊的database我使用的是書中介紹的elephantSQL ,註冊的一個免費方案

        對比於Mongodb使用mongoose這個ODM來處理資料綱要(我們直接定義在models/vacations.js , vacationInSeasonListener.js).
        在RDBMS我們可能就需要手動依靠SQL來建立Schema. 總之,我們有兩種作法
        1. 在postgre的CLI內直接透過SQL來操作
        2. 使用postgre的javascript api來完成  
        我們在此選擇方法2. npm install pg , 並建立一個dbinit.js 用來初始化資料庫
        
        在本章最後,我們要回來將Session儲存在DB中,不過在此我們使用Redis來做這件事,一樣使用雲端的免費Redis服務 .
        這邊的實現不論是在mongodb的版本或postgre都一樣. 
        但我認為這邊書中的connect-redis因為和我所使用的版本差異, 我這邊需要額外install redis package,
        接著基本上就是按照connect-redis的npm文件敘述來使用
        使用Redis來保存後,即便我們Server重啟, user曾經使用的狀態仍然可以被記得,
        而若是使用預設的memory store, 只有在Server沒有重開的情況下網頁重啟能被記得
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


const credential = require('./credential');

const handlers = require('./lib/handlers') ; 

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
    // 使用Redis來保存後,即便我們Server重啟, user曾經使用的狀態仍然可以被記得,
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
