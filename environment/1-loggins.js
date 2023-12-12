/*
    雖然書本建議我們在測試/開發/production的code盡量不要有太大差異 ,但有時有些差異例如
    - 生產環境與開發環境使用的資料庫
    - 要透過log功能所作的紀錄不太相同 
    因此接下來以log功能為例 , 我們要實做在不同的環境組態下讓log的模式改變

    這邊用到morgan這個庫 , "他是一個用作於log訊息的middleware" , 

*/
const express = require('express')
const morgan = require('morgan')
const fs = require('fs')

const app = express()

/*
    根據環境去定義不的morgan中介函式設定 ,當我們在開發環境的時候 ,我們以在網頁的console
    上去看到活動紀錄 , 但當我們改用production mode啟動的時候 , 終端應該要什麼都看不到
    
    相應地 , 我們在production mode的時候改成將log寫入一個檔案 , 這是Apache的Combined log format,
    不過這邊我們就沒有特別在意他 , {flags:'a'} 只是morgan組態的一部分設定選項
    
*/ 
switch(app.get('env')) {
  case 'development':
    // 加入了這個中介函式 , 我們就可以在開發環境時從終端機完整看到所有request的路由與回應
    // 其實蠻方便的
    app.use(morgan('dev'))
    break

    // 當我們切到生產模式 , 就無法在終端機上看到那些request訊息 , 我們改成將其紀錄在local端的.log file
  case 'production':
    const stream = fs.createWriteStream(__dirname + '/access.log',
      { flags: 'a' })
    app.use(morgan('combined', { stream }))
    break
}

app.get('*', (req, res) => res.send('hello!'))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Express started in ` +
  `${app.get('env')} at http://localhost:${port}` +
  `; press Ctrl-C to terminate.`))