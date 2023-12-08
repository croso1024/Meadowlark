/*
    更加複雜的例子 , 我在下面分組進行註解 , 這個例子我們針對app.use指定路徑 ,
    讓自定義的中介函式也可以針對特定路徑觸發 ,當然不指定就是全部都會觸發
    這個例子幫助我們了解針對錯誤處理式是如何處理與傳遞error message


    另外我也在網路文章中看到一個書上不曾使用的middleware寫法

    app.use( path , middleware2 , middleware3 , (req , res)=>{...}) 
    
    就是直接把middleware2 , middleware3 綁成相連的中介函式,這個寫法我自己是覺得
    不如書上直接按照define的順序來串接方便 , 因為如果採用上面的作法當路由數量增加就比較難
    去trace順序關係.

*/
const express = require('express')
const app = express()


// 第一個middleware , 沒有指定路徑因此必定觸發
app.use((req, res, next) => { 
	console.log('\n\nALLWAYS')
	next() 
})

// 針對路由 '/a' 的middleware , 只是會被send打斷 , 因此只會執行第一個
app.get('/a', (req, res) => { 
	console.log('/a: route terminated')
	res.send('a')
})
app.get('/a', (req, res) => { 
	console.log('/a: never called');
})


// 針對路由 '/b'的middleware , 第一個middleware是會通過的 
app.get('/b', (req, res, next) => { 
	console.log('/b: route not terminated')
	next()
})
// 這個middleware則是不限制接受路由b , 但這裡的Sometime指的是不一定總是會執行到 
// 目前來看 ,除了指向路由a會在上面被擋住以外都會執行到這裡
app.use((req, res, next) => {
	console.log('SOMETIMES')
	next()
})

// 在此會主動丟error , --注意丟Error並不代表中介函式就此中斷-- ,
// 下面的中介函式使用四個參數用來承接error , 並且會繼續call next 
app.get('/b', (req, res, next) => {
	console.log('/b (part 2): error thrown' )
	throw new Error('b failed')
})
app.use('/b', (err, req, res, next) => {
	console.log('/b error detected and passed on')
	next(err)
})


// 送往請求c的路由組 , 這一組主要是來看對錯誤的處理 , 與上面在b的路由中丟error類似
// 這邊也丟出一個 c failed  
app.get('/c', (err, req) => {
	console.log('/c: error thrown')
	throw new Error('c failed')
})
// 注意看這邊的重點 , 雖然中介函式的callback使用四個參數代表錯誤處理式,
// 但這邊的next並沒有以err作為參數去call next
app.use('/c', (err, req, res, next) => {
	console.log('/c: error detected but not passed on')
	next()
})



// 使用了err作為參數call next的b會來到500 
app.use((err, req, res, next) => {
	console.log('(500) unhandled error detected: ' + err.message)
	res.send('500 - server error')
})


// 最終沒有使用err做為參數call next的c會來到404
app.use((req, res) => {
	console.log('(404) route not handled')
	res.send('404 - not found')
})



/*
    總結一下此題的幾種路由
    - 針對root的路由 : 觸發always -> sometime -> 404 
    - 針對a : always -> route terminated
    - 針對b : always -> route not terminate -> sometime  -> b: error thrown
             -> b error detected and passed on -> 500 
    - 針對c : always -> sometime -> c: error thrown -> error detected but not passed on

*/



const port = process.env.PORT || 3000
app.listen(port, () => console.log( `Express started on http://localhost:${port}` +
  '; press Ctrl-C to terminate.'))