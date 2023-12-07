/*
    延續meadowlark.js , 使用模板引擎來渲染路由 , 同時加入中介函式"static" , 用來準備傳送給客戶端的靜態資源(圖片,CSS,甚至用戶端JS)
    , 這些資源被放在public目錄之下 , public的意思是這些內容可以無條件地傳送給客戶端
*/
const express = require("express") ;   
const app = express() 
const port = process.env.PORT || 3000   

// 使用我們自定義在lib底下的模組fortune.js  , 記得要給定路徑 ./ , 這樣才不會跑去node_modules目錄裡面找
const fortune = require("./lib/fortune") ; 


// 使用handlebars模板引擎來建立"Views" 
const expressHandlebars = require("express-handlebars") ;

// 設置app的模板引擎
// 原始書中是使用app.engine("handlebars" , expressHandlebars({defaultLayout:"main"}))
// 我不確定是否是API有發生變化 , 總之按照原始書中方法會拋出expressHandlebars不是函數的error
app.engine("handlebars" , expressHandlebars.engine({defaultLayout:"main"}))
app.set("view engine" , "handlebars") 


/*  
    中介函式的設定要放在宣告任何路由前 , 其意義相當於為我們要傳送的各個靜態檔案建立一個路由專門算繪他 , 然後將其傳送到客戶端 
    在我們的handlebar樣板中 , 我們就可以使用public下的內容 , 而用戶端試看不到這個public資料夾的

    切記中介函式是按照順序來處理,並且會覆蓋其他的路由 , 所以一般來說都會在最先或盡量早宣告 
*/ 

// 我的理解是這一行static中繼函式是讓我們的app(包含模板)可以存取到public底下的資源
// 但不會將public資料夾曝露給用戶端
app.use(express.static(__dirname +"/public")) ; 


/*
    使用模板引擎設定view後 , 就可以使用view的新路由 , 並且不需要指定內容類型或狀態碼 ( view會回傳text/html以及預設的狀態碼200 )
    但是在提供404網頁和500網頁的部份仍然要明確設定狀態碼
*/
app.get("/" , (req,res)=> res.render('home')) 

// 我們透過在about頁面的handlebars設定模板 , 使我們的server能夠回應動態資源(動態的HTML)
app.get("/about",(req,res)=> {
        res.render('about' , {fortune:fortune.getFortune()})  
    }
)  


app.use(
    (req , res) => {
        res.status(400) 
        res.render("404") 
    }
)
// 自訂500頁面 ( server error )
app.use(
    (err,req ,res,next)=>{
        console.log(err.message) ; 
        res.status(500) 
        res.render("500") 
    }
)

app.listen(
    port , ()=>{
        console.log( `Express started on http://localhost:${port}` );
        console.log( "Press the Ctrl-C to terminate :) " ); 
    }
)
