/*
    此為在使用app cluster時，要水平擴展的單一Server檔案 , 在此我們要先在包裝模組一樣,
    透過 require.main === module 將server主程式匯出 , 最終在cluster程式內叢集運行

    接下來我們嘗試兩種錯誤 , 一種直接經由Express抓住的錯誤 ,我們可以藉由路由的錯誤處理式來處理
    另一種則是Express無法抓到的錯誤 , 例如一些非同步事件所丟的error ,書中在這邊的措施是關閉Server
    而這個關閉指的是盡量無痛的關閉 ,去做"失效切換" , 而實現這件事的作法就是我們使用的cluster
*/

const express = require('express')
const cluster = require('cluster')

const app = express()


app.use((req, res, next) => {
  if(cluster.isWorker)
    console.log(`Worker ${cluster.worker.id} received request`)
  next()
})

/*
    express在處理路由時實際上都是包在try-catch結構之中,因此丟初的Error一定都會被catch到
    這些error都不至於讓服務停止 , 只不過客戶端和server的終端機都會跳出錯誤訊息
    (Server仍然照常運行 , 無論我們有沒有使用cluster ,client端只要換個正常路由就可以)
    而解決因為error的異常 , 通常就是在路由最下面加入針對error的路由處理式
*/
app.get('/fail', (req, res) => {
    throw new Error('Nope!')
})

/*
    上面展示的是一些比較簡單的error , 接著我們來模擬"Express"無法抓到的例外 , 
    下面我們使用process.nextTick()  , 這有點類似setTimeout在時間設置為0 , 
    我自己是認為這類似把callback非同步的放進事件迴圈!?  , 總之這個例外會讓執行序在有空的時候才會執行 ,
    但當執行序要執行這個程式碼時他已經拿不到背景context , 而處於未定義的狀態 . 
    最終會讓整個程式碼當機 , 雖然一般Server端程式碼不會用到setTimeout , 但在許多實際應用中我們
    仍常常會需要處理非同步的事情 , 例如database , file system以及network等 , 這邊的展示就是一個通用的例子

    下面的epic-fail路由會直接導致我們的process掛掉 , 不過我們已經在cluter的程式碼中做好了預防措施 , 
    盡管某個process運行的server掛掉了 ,我們也能偵測後重新啟動其他server,並在過程用其他仍然正常運行的server來繼續提供服務
    而Node在遇到未被處理的例外時的機制就是 'uncaughtException' 事件 .
*/
app.get('/epic-fail', (req, res) => {
  process.nextTick(() => {
    throw new Error('Kaboom!')
  })
  res.send('embarrased')
})




app.get('*', (req, res) => res.send('online'))

// 這邊就是上面所說 ,我們去偵測那些未被例外處理捕捉到的例外 , 就是將server關掉 , 因為我們已經在cluster的code
// 中定義好因為錯誤關掉會自動重開一個server的code了
// 這裡我們還開始監聽process是否出現異常 , 一旦出現異常也代表我們需要去處理
// 一些異常發生時的手段 , 例如資料庫或著異常通知等等
process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION\n', err.stack);
  // do any cleanup you need to do here...close 
  // database connections, etc.  you'll probably
  // also want to notify your operations team
  // that a critical error occurred; you can use
  // email or even better a service like Sentry,
  // Rollbar, or New Relic
  process.exit(1)
})

function startServer(port) {
  app.listen(port, function() {
    console.log(`Express started in ${app.get('env')} ` +
      `mode on http://localhost:${port}` +
      `; press Ctrl-C to terminate.`)
  })
}

if(require.main === module) {
  // application run directly; start app server
  startServer(process.env.PORT || 3000)
} else {
  // application imported as a module via "require": export
  // function to create server
  module.exports = startServer
}