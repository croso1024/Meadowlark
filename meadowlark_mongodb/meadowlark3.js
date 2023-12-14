/*
    至此開始為chapter.5 的內容 , 我們在lib加入了handlers.js , 
    用來載入Routing所對應的函式 .  

    同時將app包裝變成可以被require的模組 
*/


// 載入我們集成的handlers.js 
const handler = require("./lib/handlers") ; 


const express = require("express") ;   
const app = express() 
const port = process.env.PORT || 3000   


const expressHandlebars = require("express-handlebars") ;

/*
    在模板引擎中 , 有著layout與view , 一般來說 layout是"模板的模板" , 在算繪的具體流程如下: 

    1. 我們傳入render function的參數指定了使用的view ,以及在算繪該view時需要的參數 , 這個參數一般稱為"context" ,
    2. 當view被算繪完成 , 他實際會被編譯成HTML , 並且作為新的context傳入layout的模板進行算繪(如果有) ,
    3. 上一步的view被算繪完成後,會在context物件內加入body屬性 , 就是view編譯出來的HTML ,
        因此在layout模板中我們可以用{{{body}}} 來嵌入前一步view的結果 

    總結來說 , programmer指定view與context --> 會先算繪view -> 更新context物件的body -> 算繪layout 
    而要使用哪個layout這件事情 , 因為一般網站通常都不會有太多個版面 , 我們在初始化engine時就可以指定預設layout,
    例如我們的code用的"main" 

    如果想要換其他layout或不想使用 , 也可以在render function的context參數中入 
    { layout: otherLayout }
    { layout: null } , 

    會先算繪view , 
*/
app.engine("handlebars" , expressHandlebars.engine({defaultLayout:"main"}))
app.set("view engine" , "handlebars") 

app.use(express.static(__dirname +"/public")) ; 


// 使用集成的handlers應用在所有路由的函式

app.get("/" , handler.home)  ; 

app.get("/about" , handler.about ) ; 

app.use(
    handler.notFound
); 
app.use(
    handler.serverError 
); 



/*
    將APP包裝為模組，我覺得這個比較類似python if __name__ == "__main__" : 
    這個語法的重點在於如果我們使用node直接運行javascript , 這時候require.main會等於全域的module變數
*/

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
