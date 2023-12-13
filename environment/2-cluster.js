/*
    接下來要來來說明網站的水平擴展，Node對於水平擴展有著不錯的支援, 我們要使用app cluster
    ,以多個單一server的方式去擴展我們的應用 , 讓每個CPU都運行一個"獨立"的server (process isolation)

    這支程式的目的是要使用app cluster去運行我們的server , 而原始的Server主程式則在2-server.js中
    
    當我們在終端機直接執行這一支code , 他就會作為master ,"require("os").cpus().forEach(startWorker)"
    會幫助我們依照CPU的數去執行 fork出來的這支程式就會變成worker , 就會到下半else部份,去執行server
    


*/
const cluster = require('cluster')
// const num_cpus = require("os").cpus().length ; 

function startWorker() {
  const worker = cluster.fork()
  console.log(`CLUSTER: Worker ${worker.id} started`)
}

if(cluster.isMaster){

//   require('os').cpus().forEach(startWorker())
    for (let i = 0 ; i<2 ; i++){startWorker() ;  }


  // 監聽所有斷線的worker , 如果發生斷線時應該會退出(exit) , 下面我們也要捕捉這個退出事件
  cluster.on('disconnect', worker => console.log(
    `CLUSTER: Worker ${worker.id} disconnected from the cluster.`
  ))

  // 當發生退出事件 , 我們會需要建立一個新的worker來取代他
  cluster.on('exit', (worker, code, signal) => {
    console.log(
      `CLUSTER: Worker ${worker.id} died with exit ` +
      `code ${code} (${signal})`
    )
    startWorker()
  })

} else {

    const port = process.env.PORT || 3000
    // 從worker啟動app
    require('./2-server.js')(port)

}