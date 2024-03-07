/*
    Chapter.16 
    在這一章我們改以React來寫網頁的前端,將Express完全作為提供資料的後台.
    因此這一節的重點在於前後端的雙向通訊.

    這會沿用到我們前一章節完成的四個REST API端點.
    在這一章中我們的Express後台就不再需要views/handlebars , cookie與session 以及渲染view使用的路由處理式.
    因此這邊我大致上就是重新整理了一下程式碼,只保留了給REST API call的回應處理.


    由於React啟動時就會佔用3000port , 故我們將後端的port號做個更改. 
    接下來在React中我們要來讓前端頁面與後端進行通訊,
    最簡單的做法可以透過fetch , fetch('http://localhost:3060/api/xxx') 但直接使用這種作法顯然是不明智的.
    理想的情況下, 外部存取我們的後端時最好都能使用完全一樣的protocol , port 來取得HTML/API/Static, 同時也確保程式碼的一致性.
    因此我們更傾向呼叫如 fetch('/api/xxx').  , 
    在我們的專案中實現這個步驟的方法仰賴CRA直接支援的proxy組態 , 在front-end端加入 'proxy':'http://localhost:3060' 來達成.

    
    完成這一切後,我們可以用npm build去把前端打包起來 , 將npm build所產生的build資料夾的內容全部放在後端public資料夾內,這樣就可以用express加上static中介函式來提供整個App
    一般來說上面這個動作可能會把前端包放在CDN或其他雲端供應商,但在我們這邊就是最簡單直接的由Express server來統一提供前端包與資料.
    現在我們可以只啟動Server , 連接到我們的3060 port , 就能看到React前端也被部署好了.

*/


const express = require('express') ; 
const app = express()  ; 

const port = process.env.PORT || 3060  ; 


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

app.use(expressSession({
    resave : false ,                    // 請求沒有被更改的情況下要不要重新存session
    saveUninitialized :false ,          //是否可以直接把初始化的Session也儲存起來
    secret : credential.cookieSecret ,  // 用來簽署session的憑證 
    })
) ; 

app.use(express.static(__dirname + "/public") ) ; 


// ------------------------------------------------------------------------
// Part.2 開始設定路由處理式

app.get("/" , handlers.home) ; 
app.get('/about' , handlers.about) ;
// 只保留使用json api的表單上傳與vacationPhoto處理 , 同時vacationPhoto的處理式中加入了我們在本章才引入的
// 本地檔案系統儲存以及Database的持久保存


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
