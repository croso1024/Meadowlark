/*

    chapter.13 使用持久保存

    在這裡的例子原先是chapter.8的時候用來處理檔案上傳的內容 , 
    現在我們要在Node的檔案系統"fs"來建立目錄來存放這些照片(用以作為中間儲存)並在後續將它們存入Database .
    具體而言我們修改了針對vacationPhotoContest這個路由的處理式,但其餘部份(newsletter , vacationPhoto)還是按照先前第八章的內容為主

    - 但注意我這邊去除掉了原始書中使用瀏覽器sumbit的那些路由與處理式 , 統一使用fetch api來做表單與照片檔案的提交 
    - 原始書中的fs操作 , 在使用rename來移動檔案(oldPath->newPath) , 但實際上這樣做會遇到device跨區而無法做, 這邊我改成先複製,然後unlink src


    
*/

// import我們建立的database handler
const database = require("../db") 


// ------------------------------------------------------------
// Part.1 加入本地保存的部份 , 使用path與fs來建立目錄,使用node的檔案系統'fs'
const pathUtils = require("path") ; 
const fs = require('fs') ;  



// 建立目錄, 在當前資料夾的父層尋找一個'data'資料夾 , resolve會將給定的多個字串符參數合併解析成為一個絕對路徑 , 
// 這裡的寫法基本上我們是希望去產生在當前工作目錄的父層建立data資料夾 , 但實際的建立動作在下面 mkdirSync()
const dataDirectory = pathUtils.resolve(__dirname , ".." , "data") ;
// path.join用來將所有參數拼接成為一個有效的檔案路徑 , 'vacation-photos'前面可加"/"可不加 , 都會被自動生成完成
const vacationPhotoDirectory =  pathUtils.join(dataDirectory , "vacation-photos") ; 

if (!fs.existsSync(dataDirectory)){ fs.mkdirSync(dataDirectory) ;}
if (!fs.existsSync(vacationPhotoDirectory)) {fs.mkdirSync(vacationPhotoDirectory) ;} 

function saveContestEntry(contestName , email , year , month , photoPath){
    // ... 這邊我們打算使用database來進行保存
} 

// 我們將這些fileSystem的function給做'promisify' , 讓他們可以使用async , await的像Synchronization的呼叫
const { promisify } = require("util") ; 
const mkdir = promisify(fs.mkdir) ; 
const rename = promisify(fs.rename) ; 
const copyfile = promisify(fs.copyFile) ; 
const unlink = promisify(fs.unlink) ; 

// 我們修改了原先handler中的 api.vacationPhotoContest , 將其利用本地檔案系統暫存並且存入DB
// 注意我們動到的都是在exports.api之下的方法 , ch8提供的方法都在下面直接綁在exports上
exports.api = {} 
exports.api.vacationPhotoContest = async ( req , res ,fields , files ) =>{

    // 注意這邊屬性為photo是配合HTML表單的name屬性 , 取出照片
    const photo = files.photo[0] ; 
    // 為了避免有多個使用者同時上傳相同檔案名稱的照片 , 我們的處理是根據timestamp來建立目錄
    const directory = vacationPhotoDirectory + '/' + Date.now() ; 

    const path = directory  + '/' + photo.originalFilename ;   
    await mkdir(directory)  ;
    // await rename(photo.path ,path) ; 

    // 按照書中的作法進行rename時 , 會發生node js的fs沒辦法跨硬碟去relink file (從/tmp -> home的根目錄就是跨區) 
    // 這邊google了一下作法, 應該要先進行複製 , 接著才能做我們原本想做的 ,但我這邊打算是直接複製後刪除source
    await copyfile( photo.path   , path ) ; 
    await unlink( photo.path ) ; 



    // 我們希望能夠將用戶上傳的照片和他們的email地址,提交時間給連接起來 ,除了最基本的將這些資訊
    // 編碼進檔案名稱以外,另一種作法就是存在資料庫中 , saveContestEntry就用來處理這些事
    saveContestEntry(
        'vacation-photo' , fields.email , req.params.year , req.params.month ,path
    ); 

    res.send({result:'success'}) ; 
}
exports.api.vacationPhotoContestAjax = (req, res) => {
    const now = new Date()
    res.render('contest/vacation-photo-ajax', { year: now.getFullYear(), month: now.getMonth() + 1 })
}

exports.api.vacationPhotoContestError = (req , res , message) => {
    res.send({result:'error' , error:message} )
}



// ------------------------------------------------------------
// Part.2 建立從database取回假期資料的路由處理


const convertFromUSD = (value , currency) => {
    switch(currency){
        case 'USD' : { return value * 1 }
        case 'GBP' : { return value * 0.79 }
        case 'BTC' : { return value * 0.000078 }
        // default是必定會觸發 , 除非break或著return
        default : return NaN 
    }

}

exports.listVacations = async (req , res) => { 

    // 我們的query只找出目前可以使用的假期商品
    const vacations = await database.getVacations() ;
    const currency = req.session.currency || "USD" ;  
    const context = {
        currency : currency , 
        
        // 儘管在這邊我們看起來像是很無意義的把相同屬性重新賦予 , 但我們並沒有直接使用database回傳回來的物件的所有性質 , 
        // 這麼做是為了避免view的context得到一堆不需要的屬性 , 除此之外也有許多合理的理由,說明我們只把必要的屬性取出並傳給view
        // 同時在必要的時候進行轉換 , 例如price的部份
        vacations : vacations.map( vacation =>{
            return {
                sku : vacation.sku , 
                name : vacation.name , 
                description : vacation.description , 
                inSeason : vacation.inSeason , 
                // price : "$" + vacation.price.toFixed(2) ,
                // 我們多增加了一個幣值轉換的function , 記得也要將幣值屬性更新到context中給view
                price: convertFromUSD(vacation.price , currency) , 
                qty : vacation.qty , 
            }
        } ) ,
    } 
    switch(currency) { 
        case 'USD' : context.currencyUSD = "selected" ; break 
        case 'GBP' : context.currencyGBP = "selected" ; break 
        case 'BTC' : context.currencyBTC = "selected" ; break 
    }

    res.render('vacations' , context) ; 

}

// 在點擊網頁上的幣值時,我們使用路由參數將幣值代號放入req.params , 於此再將幣值放入currency
exports.setCurrency = (req ,res) => {
    console.log("Session", req.session) ; 
    req.session.currency = req.params.currency ; 
    return res.redirect(303 , '/vacations') ; 

}

// ------------------------------------------------------------
// Part.3 加入提供假期訂閱服務的路由
exports.notifyWhenInSeasonForm = (req ,res) => {

    // 注意這邊傳入的sku就要根據使用者到底是點了哪個商品來決定 , 
    // 我們這邊蠻手動的使用了url中的query字串來加入使用者到底點了哪個商品這件事
    // 因此接著就是在處理式中拿出來放入context傳遞給接下來的view
    res.render('notify-me-when-in-season'  , {sku : req.query.sku}) 

}

exports.notifyWhenInSeasonProcess = async (req,res)=>{

    const {email , sku} = req.body ; 
    await database.addVacationInSeasonListener(email , sku) ;  
    return res.redirect(303 , '/vacations')

}




// ------------------------------------------------------------
// Part.4  基礎路由 , 以及改寫成只保留json模式的表單處理 , json版本的照片處理的由於是本章的重點之一,就放在上面part.1

exports.home = (req , res) => res.render('home') ; 
exports.about = (req ,res ) => {

    console.log('test') ; 
    res.render('about') ; 

}
exports.notFound = (req , res) => res.render("404"); 
exports.serverError = (err , req , res , next ) => res.render("500");

// HTML表單填寫處的路由 ,我這邊修改為只保留Fetch api發json的方式
exports.api.newsletter = (req ,res) =>{
    res.render("newsletter" , {csrf:"CSRF token goes here"}) 
}

exports.api.newsletterSignupProcess = (req , res) => {
    console.log("Form (from query string):" + req.query.form) 
    console.log('CSRF token (from hidden form field): ' + req.body._csrf)
    console.log('Name (from visible form field): ' + req.body.name)
    console.log('Email (from visible form field): ' + req.body.email)
    res.send({ result: 'success' })
}

exports.newsletterSignupThankYou = (req, res) => {
    res.render('newsletter-signup-thank-you');
}

