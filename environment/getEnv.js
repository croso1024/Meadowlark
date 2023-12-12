/*
    依據書本的教學，我們簡單的測試一下如果直接透過app.get("env")來檢查目前程式運行在什麼環境下
    則我們可以得到目前的環境在development模式 , 這是預設的模式 

    $ export NODE_ENV=production 
    $ node getEnv.js

    當我們使用Unix系統的時候 , 可以比較方便的使用下面的方式指定模式,
    這麼做也可以防止不會更動到實際的環境變數 ,

    $ NODE_ENV=production node getEnv.js 
*/
const express = require("express") ; 
const app = express() ; 

const port = 3000 || process.env.PORT ;
const env = app.get("env");

app.listen(
    port , ()=>{
        console.log("Start server at localhost:3000") ;
        console.log(`Current mode is :${env}`) ;
    }
)


