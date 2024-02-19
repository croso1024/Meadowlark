/*
    在本章中 , 我們希望使用兩種不同的Database系統來實現相同功能.
    為此我們在meadowlark的主程式與handler中都將database的功能給抽象化出來.
    盡管我們使用了不同的資料庫系統,只要我們能提供相同的API界面就好

    我們的db.js就是用來實現資料庫功能的抽向層 , 包含以下幾個功能 :

    -1. 連接database
        在MongoDB的case中 , 我們使用所謂的ODM (object document mapper) , ODM可以讓我們使用javascript來操作資料庫的文件模型,
        且有些ODM也能夠讓我們使用javascript就同時使用在多種不同資料庫上 . 如果不使用ODM的話基本上就要使用該資料庫原生的查詢語言( ex. SQL in RDBMS ) 

        我們使用的ODM是mongoose , 
    


*/

const credentials = require("./credential.js") ; 
const mongoose =  require("mongoose") ; 

// 在課本上的例子使用mLab去註冊一個online sandbox , 我這邊則是使用本地mongoDB , 即localhost
const  {connectURL} = credentials.mongoURL ;  
console.log(connectURL)


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

    console.log(vacations) ; 

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

module.exports = {

    getVacations : async ( options = {} ) => {
        return VacationClass.find(options) ; 
    }

}


/*

原先是用來建立一些假的假期資料, 但後續我們在models資料夾建立data schema後, 
我們就如上面那樣直接將初始資料寫在Database裡面


module.exports = {

    getVacation : async (options={}) => {
        
        const vacations = [
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
        ]
        // 如果我們有給定選項avaiable , 就只返回符合的假期
        // 我們在假期的屬性中加入avaiable , 主要目的在於在必要時我們可以暫時停用他們 , 而非從資料庫中刪除他們
        if (options.available !== undefined){
            return vacations.filter(  ({available}) => available === options.available  )
        }
        return vacations ; 

    },

    // 目前假設這邊會做一些非同步的操作 , 最後會被回傳一個被解析為undefined的promise
    addVacationInSeasonListener : async (email , sku) => {

    }

}
*/
