/*
	這邊按照書上的範例 , 執行這個有三個簡單中介函式後去打開我們的網頁
	會發現我們的網頁實際上有icon與對網站root的請求 , 都會被第二個中介函式使用send結束掉
	除非把第二個中介函式的res.send換成next() 
*/
const express = require('express')
const app = express()

app.use((req, res, next) => {
	console.log(`processing request for ${req.url}....`)
	next()
})

// app.use((req, res, next) => {
// 	console.log('terminating request')
// 	// next() ; 
// 	res.send('thanks for playing!')	
// 	// note that we do NOT call next() here...this terminates the request
// })

app.use((req, res,next) => {
	console.log('terminating request')
	// next() ; 
	res.send('thanks for playing!')	
	// note that we do NOT call next() here...this terminates the request
})

app.use((req, res, next) => {
	console.log(`whoops, i'll never get called!`)
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log( `Express started on http://localhost:${port}` +
  '; press Ctrl-C to terminate.'))