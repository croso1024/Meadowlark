/*
    在這個專案開始，我們要使用express來建構網站了 
*/
const express = require("express") ;   
const app = express() 
const port = process.env.PORT || 3000   

// 使用handlebars模板引擎來建立"Views" 
const expressHandlebars = require("express-handlebars") 
// 設置app的模板引擎
app.engine("handlebars" , expressHandlebars.engine({defaultLayout:"main"}))
app.set("view engine" , "handlebars") 




// .get()方法是用來加入Routing ,  
/*
    在Express文件中 , app.METHOD 是代表app所屬的"HTTP"方法 , 要將METHOD更換為HTTP動詞 
    而這些method有兩個參數 , 一個路徑和一個函式 

    路徑: 
        用來定義路由 , 注意app.METHOD 已經幫我們做了一些對字串的處理 , 其不考慮大小寫或著結尾反斜線等 
    函式: 
        當路由符合的時候 , 我們定義的函式就會被呼叫 , 另外Express的狀態碼預設是200,正常情況下不用額外指定

    在這邊 , 我們就不使用如node.js中使用的 res.writeHead res.end() , Express提供了更進階的擴展包裝
    包含 res.set() , res.status() , res.send()  , 還有設定Content-Type的res.type ( 當然原始API , end , writeHead 還能用但不必要)


*/

app.get("/" ,(req,res)=>{
    res.type("text/plain") ; 
    res.send("Meadowlark Travel") ; 
});

app.get("/about" ,(req,res)=>{
    res.type("text/plain") ; 
    res.send("About Path of Meadowlark Travel 123") ; 
});



/*
    在處理404/500的網頁中，我們使用了不一樣的方法來處理他們，我們使用了app.use() 取代app.get() ,
    app.use()是Express 加入"中介函式"的方法 , 這在ch10會著重討論，在這邊我們可以先當成處理任何一種無效路由的統一手段

    在Express中，加入路由和中介函式的順序非常重要，如果把404處理放在路由上方，則前面設定的頁面都會失效  , 
    而這一點應用在萬用字元也要注意 , 例如我們有 /about/contact , /about/direction 兩個網頁 , 如果先用了app.get("/about/*") 在最上面
    那這兩個頁面也不會被導入到
*/




// 自訂 404 頁面 
app.use(
    (req , res) => {
        res.type("text/plain") ;
        res.status(404) ;
        res.send("404-Not found");
    }
)
// 自訂500頁面 ( server error )
app.use(
    (err,req ,res,next)=>{
        res.type("text/plain");
        res.status(500); 
        res.send("500-Server Error") ; 
    }
)

app.listen(
    port , ()=>{
        console.log( `Express started on http://localhost:${port}` );
        console.log( "Press the Ctrl-C to terminate :) " ); 
    }
)