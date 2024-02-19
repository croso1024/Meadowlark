/*
    這邊為chpater.7 中後段 , 我們開始在模板引擎中加入partials , 代表那些會重複使用但不是所有頁面都要使用的模板
    在views下加入資料夾 partials ,以及weather.handlebars

    並且加入"section"的 handlebars engine helper , 這一段我不是很理解書中使用section的用處 , 
    但"看起來" 定義了section helper讓我們能夠在views內加入一些對<head> , <script>等的修改 ( 這些本來應該是在最後layout的template中 , 而算繪順序是view->layout)

    參考: 
        https://wolfgang-ziegler.com/blog/a-scripts-section-for-your-handlebars-layout-template

    ----- 

    !!! 更新 - 針對section的用處我在後面的章節有更加理解，注意書中在這段介紹時貼錯code了,所以當時有些難以理解
    前述與書中所謂的 "在views中加入section helper可以幫助我們在對應的layout部份注入內容" , 
    實際上指的是我們可以在layout中(例如此專案的main) , 透過三個大括弧引入views中定義的部份 , 例如我們在views中定義了主體(body) , 但也可以定義head與script
    這個head與script我們不希望他在layout所引用的{{{body}}}中被直接放進 , 因此用section helper將他們包起來 
    如此一來,雖然我的code (head,body,script) 都寫在同一個view模板內, 但在注入layout時仍然可以分段 , 方便我們針對該view所處理的邏輯進行維護與使用
    


    在partial模板的內容上,我們自定義了一個假的getWeather函數 , 我們要將其以中介函式的方式來讓所有view都能使用
    為此我們需要import我們的getWeather函數 , 並將其設置為中介函式


*/


// 載入我們集成的handlers.js 
const handler = require("./lib/handlers") ; 

// 載入我們自訂的取得天氣資料的中介函式 , 但只是命名為中介函式,實際上還需要在express框架去設定
// 當資料經過這個middleware,就會在locals.partials物件中加入weatherContext供模板使用
const weatherMiddleware = require("./lib/middleware/weather") ; 

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
// 設置取得天氣資料的中介函式 , 這個中介函式會幫助我們注入 weatherContext的內容 ,
// 如果不加的話 , 只會顯示weather.handlebars中剩餘不需要weatherContext的部份
app.use(weatherMiddleware) ; 

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
