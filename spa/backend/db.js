/*
    在本章中 , 我們希望使用兩種不同的Database系統來實現相同功能.
    為此我們在meadowlark的主程式與handler中都將database的功能給抽象化出來.
    盡管我們使用了不同的資料庫系統,只要我們能提供相同的API界面就好

    我們的db.js就是用來實現資料庫功能的抽向層 , 包含以下幾個功能 :

    -1. 連接database
        在MongoDB的case中 , 我們使用所謂的ODM (object document mapper) , ODM可以讓我們使用javascript來操作資料庫的文件模型,
        且有些ODM也能夠讓我們使用javascript就同時使用在多種不同資料庫上 . 如果不使用ODM的話基本上就要使用該資料庫原生的查詢語言( ex. SQL in RDBMS ) 
        我們使用的ODM是mongoose , 
    
    -2. 在此我們使用find()植入初始資料 , 透過在find的時候檢查database中是否已經存有資料來決定要不要插入資料

    -3. 實做取得資料與更新資料的部份,並作為這個module主要提供的API ,
        而這也是我們的資料庫抽象層的實做部份 , 使用mongoose去操作mongodb,其中一些操作與參數需要再去
        閱讀一下相關文件才會更熟悉.
        主要就是實現取資料的getVacation , 更新資料的 addVacationInSeasonListener
    

*/

const credentials = require("./credential.js") ; 
const mongoose =  require("mongoose") ; 

// 在課本上的例子使用mLab去註冊一個online sandbox , 我這邊則是使用本地mongoDB , 即localhost
const  {connectURL} = credentials.mongoURL ;  
console.log(connectURL)

console.log("Call require('../db')") ;

if (!connectURL){
    console.error("MongoDB connection URL missing") ; 
    process.exit(1) ; 
}

// ------------------------------------------------------------------------
// 注意連線的流程長這樣 , 使用library的instance根據URL連線後,其connection屬性就是連上的database
mongoose.connect(connectURL) ; 
const db = mongoose.connection ; 

db.on("error" , err=>{
    console.error("Mongo DB error" + err.message) ; 
    process.exit(1);
})

db.once("open" , ()=>{console.log("MongoDB connection established !")})



const VacationClass = require("./models/vacation") ; 
// 注意這邊的find就是database中的query方法了
// 這個VacationClass.find() 會直接去搜尋所有資料庫中的VacationClass資料 , 在用這些資料去呼叫callback
// callback被呼叫的時候,所有VacationClass資料會是以list的方式當作參數傳入,
// 而我們在這個方法的callback中手動加入了一些假資料並使用save()將他們存在database中 ,這樣子下次重開的時候
// 因為vacation.length已經有值,我們就不會重複插入資料
VacationClass.find((err , vacations) => {

    console.log(`------ We have ${vacations.length} vacation option store in Database`) ; 

    if (err){return console.error(err)}
    // 若資料庫已經初始化過了,這邊就跳過後面的建立假資料步驟
    if (vacations.length){return}
    

    new VacationClass(
        {
            name: 'Hood River Day Trip',
            slug: 'hood-river-day-trip',
            category: 'Day Trip',
            sku: 'HR199',
            description: 'Spend a day sailing on the Columbia and ' + 
              'enjoying craft beers in Hood River!',
            price: 99.95,
            tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
            inSeason: true,
            maximumGuests: 16,
            available: true,
            packagesSold: 0,
        }
    ).save()
    
    new VacationClass({
        name: 'Oregon Coast Getaway',
        slug: 'oregon-coast-getaway',
        category: 'Weekend Getaway',
        sku: 'OC39',
        description: 'Enjoy the ocean air and quaint coastal towns!',
        price: 269.95,
        tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
        inSeason: false,
        maximumGuests: 8,
        available: true,
        packagesSold: 0,
      }).save()
    
      new VacationClass({
          name: 'Rock Climbing in Bend',
          slug: 'rock-climbing-in-bend',
          category: 'Adventure',
          sku: 'B99',
          description: 'Experience the thrill of climbing in the high desert.',
          price: 289.95,
          tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
          inSeason: true,
          requiresWaiver: true,
          maximumGuests: 4,
          available: false,
          packagesSold: 0,
          notes: 'The tour guide is currently recovering from a skiing accident.',
      }).save()

})

const VacationInSeasonListener = require('./models/vacationInSeasonListener') ; 
// 這邊就是database存取資料與存放資料真正的實做 , 我們只是暴露出這個界面給外面在handler處理路由時使用
// 而這些實做會跟mongoose提供的與mongodb互動的界面有關
const VacationDeleteRequestListener = require("./models/vacationDeleteRequest") ; 
module.exports = {

    getVacations : async ( options = {} ) => {
        return VacationClass.find(options) ; 
    },


    // 此為第15章新增的,使用sku去查詢指定行程
    getVacationBySku : async ( sku ) => {
        return VacationClass.findOne({sku})  ; 
    },

    // 這邊使用updateOne來進行資料的更新 , 而這邊一個很方便的地方在於, mongoose提供了'upsert'
    // 這個工具 , 基本上就是 insert + update的結合 
    // 如此一來,當特定email不存在於該資料集合時 , 我們就會以該email建立一筆新的資料 , 而若存在時則會被更新
    // $push的用意則是用來將一個值push進一個陣列
    
    addVacationInSeasonListener : async (email , sku)=>{
        await VacationInSeasonListener.updateOne(
            // p.s  該資料模型基本上就是儲存 "每個使用者訂閱了哪些sku"
            { email } , 
            { $push : {skus : sku}} , 
            { upsert : true } 
        )
    }, 

    requestDeleteVacation : async (email , sku , notes ) => {

        await VacationDeleteRequestListener.insertMany(
            {
                email : email  , 
                sku : sku , 
                notes : notes , 
            }
        )
    },

}

