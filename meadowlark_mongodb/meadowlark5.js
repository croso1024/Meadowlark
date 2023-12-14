/*
    meadowlark5.js 加入了ch8的表單處理內容 , 以及檔案上傳的功能 , 
    本章原文的介紹中提及許多HTML表單屬性以及轉址上的建議,可以回去書上複習.  

    這一章節我們在view加入幾個讓使用者進行輸入的表單模板 ,並且在server端加入針對這些表單
    的接收與處理，最後將幾個不同的結果回給client.  

    如果我們在提交表單的時候用GET , 可以直接從res.query.formID去找到表單 , 但這種作法不太建議使用
    一般我們用POST來處理表單 , 為此我們需要加入一個中介函式 , 並且安裝npm install body-parser

    我們follow書上的作法 , 去實現兩種不同的表單處理模式 

    1. 一般的HTML表單處理!?  
        定義兩個view模板 ,/newsletter-signup 與 /newsletter-signup-thank-you 
        分別是填寫表單的部份與填完後的thank-you模板 , 在handler2.js中去加入
        路由到填表單的位置 ,以及送出表單的處理(重定向)
    
    2. Fetch API來傳送JSON編碼的表單 
        因為我們不需要對server送出來回的request , 因此不需要處理轉址與多用戶URL的部份(我沒有完全理解這句話),
        但這邊的實做仍然讓處理表單有一個單獨的路由 , 在/newsletter之下 


    在完成表單的上傳功能後,我們接下來處理檔案上傳的部份, 按照書中上傳照片檔案的例子,我們使用multipart這個library
    在此主程式內就是加入對應的Post方法路由 , 使用multipart處理檔案上傳 , 並在handlers裡面加入一個上傳處理結束的轉址

*/


// 載入我們集成的handlers.js 
const handler = require("./lib/handlers2") ; 

// 載入我們自訂的取得天氣資料的中介函式 , 但只是命名為中介函式,實際上還需要在express框架去設定
const weatherMiddleware = require("./lib/middleware/weather") ; 

// 載入用來處理request-body的函式庫 
const bodyParser = require("body-parser") ; 

// 載入處理檔案上傳的multiparty
const multiparty = require("multiparty") ; 

const express = require("express") ;   
const app = express() 
const port = process.env.PORT || 3000   


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

app.use(express.static(__dirname +"/public")) ; 
app.use(weatherMiddleware) ; 

// 將body-parser設置中介函式後 , 我們就可以使用res.body去拿請求的內文了(包含表單內容) 
// 注意雖然在這邊我們使用body來裝載內文 , 但查詢字串仍然可以用 ,我們在view內加入查詢字串的顯示
app.use(bodyParser.urlencoded({extended:true})) ;  

// 搭配使用fetch + json的方式 , 我們要讓bodyParser也能解析json
app.use(bodyParser.json()) ;




app.get("/" , handler.home)  ; 
app.get("/about" , handler.about ) ; 

// 加入普通HTML表單的routing
app.get("/newsletter-signup" , handler.newsletterSignup)  ; 
app.post("/newsletter-signup/process" , handler.newsletterSignupProcess) ; 
app.get("/newsletter-signup/thank-you" , handler.newsletterSignupThankYou) ; 

// 加入配合fetch版本的routing ,  注意我們使用 /api/newsletter-signup , 這是一個開發習慣
// 用來區分是使用者的用戶端點或著使用fetch來存取的API端點 
app.get("/newsletter" , handler.newsletter) ; 
// handler.api.newsletterSignup 實際上是普通的handler.newsletterSignup的包裝 , 因為要向fetch做回應
app.post("/api/newsletter-signup" , handler.api.newsletterSignup) ; 



// 加入檔案處理的部份 , 這部份的code可能需要去釐清一下,或著稍微看一下multipart這個包

app.get("/contest/vacation-photo" , handler.vacationPhotoContest ) ; 
// 這邊的路由就是我們在vocation-photo.handlebars模板內定義的表單&內容上傳目標路由 , 
// 這裡用:year與:mouth是所謂的"路由參數" , 在ch14會介紹
app.post('/contest/vacation-photo/:year/:month' ,(req,res)=>{
    console.log("Trigger vacation post "); 
    const form = new multiparty.Form() ; 
    // form.parse第一個參數是request ,第二個則是callback ,
    // fields是表單的欄位訊息,以key-value方式呈現
    // files 檔案內容,在此例子為photo(隨HTML定義名稱) , 包含路徑,檔名,size等
    form.parse( req , (err , fields , files) => {
        if (err) { return handler.vacationPhotoContestProcessError(req,res,err.message) } 
        handler.vacationPhotoContestProcess(req , res , fields , files) ;  
    })
})
app.get("/contest/vacation-photo-thank-you" , handler.vacationPhotoContestProcessThankYou ) ; 

// 增加使用fetch的async版本檔案上傳

app.get('/contest/vacation-photo-ajax', handler.vacationPhotoContestAjax) ; 
app.post('/api/vacation-photo-contest/:year/:month', (req, res) => {
    const form = new multiparty.Form()
    form.parse(req, (err, fields, files) => {
      if(err) return handler.api.vacationPhotoContestError(req, res, err.message)
      handler.api.vacationPhotoContest(req, res, fields, files)
    })
  })














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
