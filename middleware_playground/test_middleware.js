/*
    測試一下帶有路由的app.use() , 因為前的範例發現似乎用app.use("/")也會觸發到其他的路由
    實際測試確實 , app.use("/") 串在前面時 ,同樣會觸發導向"/test"的路由

    因此我的判斷是 app.use() 預設就是 app.use("/") ,  
    
    或著說 app.get("/abc") 會需要卻切指向 "/abc" 的路由來觸發
    app.use("/abc") 則是所有 "/abc/test1" , "/abc/*" 都會觸發 
    
    以下節錄Express API document , 確實使用use會是去找match路由的內容
    Path	

        This will match paths starting with /abcd:

        app.use('/abcd', (req, res, next) => {
        next()
        })

    Path Pattern	

        This will match paths starting with /abcd and /abd:

        app.use('/ab(c?)d', (req, res, next) => {
        next()
})

*/

const express = require("express") ; 

const app = express()  


app.use((req,res,next)=>{
    console.log("-------")
    console.log("use") ; 
    next()
})

app.use("/" , (res,req,next)=>{
    console.log("use + /") ; 
    next() ; 
})

app.use("/test2" , (req,res,next)=>{
    console.log("use  + /test2 ");
    next() ;
})

app.get("/",(req,res)=>{
    console.log("get + /") ; 
    res.send("HI this is home page") ; 
})


app.get("/test" , (req,res)=>{
    console.log("get + /test") ; 
    res.send("Hi this is test page"); 

})




const port = process.env.PORT || 3000
app.listen(port, () => console.log( `Express started on http://localhost:${port}` +
  '; press Ctrl-C to terminate.'))