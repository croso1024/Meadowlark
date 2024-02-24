/*
    我們使用npm安裝postgre的library pg , 並使用init.js來進行資料庫的初始化工作.
    注意這和我們的database操作抽象層db.js不一樣, init.js只使用在初始化. 而前者則是每次啟動server的時候使用
    話雖如此,但我們的實做依然包含在重複執行init.js的情況下不影響到DB的措施
    

*/
const credential = require('./credential.js')

// 這邊可以參考elephantSQL的document , 書上的部份我不確定是API有改變還是怎樣,總之官方doc蠻齊全的
// 另外我這邊連線就是參考書上使用的connectionString , 不曉得是否是我用的雲端postgre服務給的字串就叫做這種格式
// 總之,要馬使用{connectionString:key}這樣的物件傳入,或著就直接將key作為參數傳入才行
const { Client } = require('pg')

const {connectionString}  = credential.postgres
const client = new Client({connectionString})


// 這邊就是一個SQL CREATE TABLE , 看起來跟mysql的沒有太大的差異 
// 我們使用CREATE TABLE建立如同我們在mongodb版本一樣的兩個資料表 , vacations以及vacationInSeasonListener
// 另外既然使用RDBMS建立資料表,我們也可以思考一下該怎樣定義資料表的內容最佳 , 注意primary key , data-type等部份,目前我們的應用中根本用不到RDBMS的foreign key與連接
const createScript = `
  CREATE TABLE IF NOT EXISTS vacations (
    name varchar(200) NOT NULL,
    slug varchar(200) PRIMARY KEY,  
    category varchar(50),
    sku varchar(20),
    description text,
    location_search varchar(100) NOT NULL,
    location_lat double precision,
    location_lng double precision,
    price money,
    tags jsonb,
    in_season boolean,
    available boolean,
    requires_waiver boolean,
    maximum_guests integer,
    notes text,
    packages_sold integer
  );
  CREATE TABLE IF NOT EXISTS vacation_in_season_listeners (
    email varchar(200) NOT NULL,
    sku varchar(20) NOT NULL,
    PRIMARY KEY (email, sku)
  );
`

//------------------------------------------------
// 連入我們設定DB, 檢查其中是否有表格與資料
// 這邊我自己是覺得書中在表格的處理與資料的處理上有些不一致 , 建立表格的部份因為SQL可以直接使用CREATE IF NOT EXIST ,所以作者並沒有手動去檢查該表格的存在性
// 但在資料上,就是手動使用query去看是否已經有資料存在 , 再決定是否要插入資料.
// 總而言之,對於資料內容來說整體的邏輯和mongodb的版本處理邏輯一致 , 但從這邊可以看出使用Mongodb在自由度上真的比較寬鬆,可以直接將定義好的schema透過mongoose使用
client.connect().then(async () => {
    try {
      console.log('creating database schema')
      await client.query(createScript)
      const vacationCount = await getVacationCount(client)
      if(vacationCount === 0) {
        console.log('seeding vacations')
        await seedVacations(client)
        console.log("seeding complete!") 
      }
      else {
        console.log("Detect datas in the DB , stop seeding process")
      }
    } catch(err) {
      console.log('ERROR: could not initialize database')
      console.log(err.message)
    } finally {
      client.end()
    }
  })





  
// client.query有包含一個參數 rowMode, 預設的返回是一個 key/value pair , 我們也可以指定rowMode='array' ,讓value以array的方式return
const getVacationCount = async (client) => {
// async function getVacationCount(client){
  const { rows } = await client.query('SELECT COUNT(*) FROM VACATIONS')
  console.log(rows); 
  return Number(rows[0].count)
}

const seedVacations = async (client) => {
// async function seedVacations(client){

  const sql = `
    INSERT INTO vacations(
      name,
      slug,
      category,
      sku,
      description,
      location_search,
      price,
      tags,
      in_season,
      available,
      requires_waiver,
      maximum_guests,
      notes,
      packages_sold
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  `
  // 這邊稍微去爬了一下文件 , 使用client.query時 , sql語句中的 $N 是用來接收參數的,而參數可以在query內透過一個array來提供,就如同這邊
  await client.query(sql, [
    'Hood River Day Trip',
    'hood-river-day-trip',
    'Day Trip',
    'HR199',
    'Spend a day sailing on the Columbia and enjoying craft beers in Hood River!',
    'Hood River, Oregon, USA',
    99.95,
    `["day trip", "hood river", "sailing", "windsurfing", "breweries"]`,
    true,
    true,
    false,
    16,
    null,
    0,
  ])
  await client.query(sql, [
    'Oregon Coast Getaway',
    'oregon-coast-getaway',
    'Weekend Getaway',
    'OC39',
    'Enjoy the ocean air and quaint coastal towns!',
    'Cannon Beach, Oregon, USA',
    269.95,
    JSON.stringify(['weekend getaway', 'oregon coast', 'beachcombing']),
    false,
    true,
    false,
    8,
    '',
    0,
  ])
  await client.query(sql, [
    'Rock Climbing in Bend',
    'rock-climbing-in-bend',
    'Adventure',
    'B99',
    'Experience the thrill of climbing in the high desert.',
    'Bend, Oregon, USA',
    289.95,
    JSON.stringify(['weekend getaway', 'bend', 'high desert', 'rock climbing']),
    true,
    true,
    true,
    4,
    'The tour guide is currently recovering from a skiing accident.',
    0,
  ])
}

