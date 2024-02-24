/*
    在Postgre的db.js中 ,由於我們已經將資料初始化的工作給獨立出來,這邊就是只負責實現連接DB,
    以及操作資料庫的API界面實做就好.

    另外這邊加入連接Pool的概念 , 去減少我們重新連接的cost , 而且這邊的細節已經被包在pg庫內了還不錯
    連接Pool可以幫助我們去限制向Server發起連接的數量,同時去平衡不斷重新建立connect的開銷
    仔細注意此處,我們就沒有再去執行資料庫的連線部份,而是直接提供資料庫操作的API給handlers.js使用


    另外要留意的一點是, 由於SQL database對於變數名稱較適合採用snake_case,這不符合JS使用的camelCase,
    除了下定決心要把其中一邊轉換至與另外一邊相符以外,如果我們可以在DB端採用snake_case,JS端採用camelCase,就會讓兩邊的風格都保持一致.
    這件事情可以透過npm的lodash lib完成,

*/
const { Pool } = require('pg')
const _ = require('lodash')

const credential = require('./credential')

const { connectionString } = credential.postgres
// 這邊Pool的傳遞格式需要比較嚴格的follow這個格式, 先前我都以為書上的connectionString只是作者自己的命名
// 但看起來這邊確實要用這個格式才能順利連線 , 
const pool = new Pool({connectionString}) 

console.log("Postgre Database ready") ; 

module.exports = {
  getVacations: async () => {

    const { rows } = await pool.query('SELECT * FROM VACATIONS')
    // 在這邊我們就要使用到lodash庫,幫我們把放在SQL table中資料底線轉成camelCase
    return rows.map(row => {
      const vacation = _.mapKeys(row, (v, k) => _.camelCase(k))
      // 這邊要特殊處理的原因是postgre的money資料型態 , 並且我們想要他以數字呈現,
      // 因此還必須將字串解析成數字
      vacation.price = parseFloat(vacation.price.replace(/^\$/, '')) 
      // 在location的部份,我們可以回去注意在前面建立表格的時候 , 這些地點資料都是'平'放在table中的,這邊的操作只不過是加上結構,讓我們可以和MongoDB的版本進行比較
      vacation.location = {
        search: vacation.locationSearch,
        coordinates: {
          lat: vacation.locationLat,
          lng: vacation.locationLng,
        },
      }
      return vacation
    })
  },

  // 在MongoDB時,訂閱這件事情就是在id為email地址的文件中, sku欄位的array進行push , 但在RDBMS ,我們就是新增一組 (email,sku) 進入表中
  // 特別注意到,在這邊的SQL query內,有一個'ON CONFLICT DO NOTHING' , 透過這個方式來達成類似於我們使用mongoose的upsert
  // 但這也是因為在這個表中,資料就是(email,sku)的形式 , 因此就算是相同使用者訂閱多個旅遊行程,也應該變成多筆record ,換句話說在此並沒有真正意義上的更新資料
  // 如果這張表中除了email,sku,還有其他內容的話才可能會需要在使用到更精細的ON CONFLICT句
  addVacationInSeasonListener: async (email, sku) => {
    
    await pool.query(
      'INSERT INTO vacation_in_season_listeners (email, sku) ' +
      'VALUES ($1, $2) ' +
      'ON CONFLICT DO NOTHING',
      [email, sku]
    )
  },
}
