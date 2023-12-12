/*
    此為在使用app cluster時，要水平擴展的單一Server檔案 , 在此我們要先在包裝模組一樣,
    透過 require.main === module 將server主程式匯出 , 最終在cluster程式內叢集運行

*/

const express = require('express')
const cluster = require('cluster')

const app = express()


app.use((req, res, next) => {
  if(cluster.isWorker)
    console.log(`Worker ${cluster.worker.id} received request`)
  next()
})

app.get('/fail', (req, res) => {
    throw new Error('Nope!')
})

app.get('/epic-fail', (req, res) => {
  process.nextTick(() => {
    throw new Error('Kaboom!')
  })
  res.send('embarrased')
})

app.get('*', (req, res) => res.send('online'))


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