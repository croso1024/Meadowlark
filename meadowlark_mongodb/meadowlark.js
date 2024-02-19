/*
    Chapter13.  
        這一章開始我們要為我們的網站加入資料庫進行檔案儲存 , 這一個資料夾內存放使用MongoDB的版本
        我們改寫在書本前1/3所製作的帶有表單處理與檔案上傳的meadowlark網站 , 
        

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
                this_sections[name] = options.fn(this) ; 
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

// 載入用來處理request-body的函式庫 
const bodyParser = require("body-parser") ; 
app.use(bodyParser.urlencoded({extended:true})) ; 
app.use(bodyParser.json());

// 載入用來操作cookie的cookie parser 以及我們的憑證檔
const cookieParser = require("cookie-parser") ; 
app.use(cookieParser(credential.cookieSecret)) ; 
// 載入Session中介函式的庫 , 注意將其設置成中介函式前要先將cookie中介函式設定完成!
const expressSession = require("express-session") ;
app.use(expressSession({
    resave : false ,                    // 請求沒有被更改的情況下要不要重新存session
    saveUninitialized :false ,          //是否可以直接把初始化的Session也儲存起來
    secret : credential.cookieSecret ,  // 用來簽署session的憑證 
})) ; 
// 處理照片上傳使用
const multiparty = require('multiparty')
// 載入我們自訂的取得天氣資料的中介函式 , 但只是命名為中介函式,實際上還需要在express框架去設定
const weatherMiddleware = require("./lib/middleware/weather") ; 
app.use(weatherMiddleware) ;  

app.use(express.static(__dirname + "/public") ) ; 


// ------------------------------------------------------------------------
// Part.2 開始設定路由處理式


app.get("/" , handlers.home) ; 
// 只保留使用json api的表單上傳與vacationPhoto處理 , 同時vacationPhoto的處理式中加入了我們在本章才引入的
// 本地檔案系統儲存以及Database的持久保存

// json-表單上傳
app.use('/api/newsletter' , handlers.api.newsletter) ; 
app.post('/api/newsletter-signup' , handlers.api.newsletterSignupProcess) ;

// json-照片上傳

app.get('/api/contest/vacation-photo-ajax' , handlers.api.vacationPhotoContestAjax) ; 
// 明天可以稍微re-factor一下 , 把處理式完全整入handler.js , 以及稍微簡化一下route
app.post('/api/contest/vacation-photo/:year/:mouth' , (req,res) =>{

    const form = new multiparty.Form() ; 
    form.parse( req , (err , fields , files )=>{
        if (err) {
            return handlers.api.vacationPhotoContestError( req , res , err.message) ;    
        }
        handlers.api.vacationPhotoContest( req , res ,fields , files ) ; 
    })
} )



// 從Database引入旅遊資訊
// app.get('/vacations' ,handlers.listVacations ) ; 