/*
    此為Chapter.8 ,我們開始加入表單處理後的handler module , 
    因為和前面幾章需要使用的handler.js有較大的改變, 因此這邊就重新寫  
*/

const fortune = require("./fortune"); 


exports.home = (req ,  res) => res.render("home") ; 

exports.about = (req , res) => res.render("about" , {fortune: fortune.getFortune()});

exports.notFound = (req , res) => res.render("404"); 

exports.serverError = (err , req , res , next ) => res.render("500");


// HTML表單填寫處的路由
exports.newsletterSignup = (req, res) => {
    res.render('newsletter-signup', { csrf: 'CSRF token goes here' })
}
// 填寫完HTML表單後,使用者按下送出的處理路由 
exports.newsletterSignupProcess = (req, res) => {
    console.log("Form (from query string):" + req.query.form) 
    console.log('CSRF token (from hidden form field): ' + req.body._csrf)
    console.log('Name (from visible form field): ' + req.body.name)
    console.log('Email (from visible form field): ' + req.body.email)
    console.log("Test message embedded in form:" + req.body.test) 
    // 我們在此使用轉址 , 將內容轉到newsletter-signup/thank-you的頁面 , 
    // 雖然我們也可以直接在/newsletter-signup/process 直接渲染view , 但這樣做不太好,使用者的url會停在/process這
    // res.render("newsletter-signup-thank-you") ;  (直接渲染views)

    res.redirect(303, '/newsletter-signup/thank-you')

}

exports.newsletterSignupThankYou = (req, res) => {
    res.render('newsletter-signup-thank-you');
}


// 加入使用fetch上傳表單的兩個處理式 , newsletter與/api/newsletterSignup
exports.api = {}
exports.newsletter = (req ,res) =>{

    res.render("newsletter" , {csrf:"CSRF token goes here"}) 

}
exports.api.newsletterSignup = (req,res) => {
        console.log("Form (from query string):" + req.query.form) 
        console.log('CSRF token (from hidden form field): ' + req.body._csrf)
        console.log('Name (from visible form field): ' + req.body.name)
        console.log('Email (from visible form field): ' + req.body.email)
        res.send({result:"success"}) 
    }


// 加入假期照片檔案上傳的功能
exports.vacationPhotoContest = (req,res) =>{
    const now  = new Date() ; 
    res.render("contest/vacation-photo" , {year:now.getFullYear() , month:now.getMonth() + 1 } ) ; 
}

exports.vacationPhotoContestProcess = (req , res , fields , files) => {
    console.log("field data :" , fields) ; // fields是表單的欄位訊息,以key-value方式呈現
    console.log("files : " , files);       // 檔案內容,在此例子為photo(隨HTML定義名稱) , 包含路徑,檔名,size等
    // 我自己覺得下面會需要redirect而不是直接render可能是想要回到主程式改用GET進到頁面 , 
    // 因為這個method本身也是在POST方法後的處理式 ( 實際測試確實是這樣 , 如果直接render就會以POST返回 )
    res.redirect(303 , "/contest/vacation-photo-thank-you") ; 
    // res.render('contest/vacation-photo-thank-you') ; 
}

exports.vacationPhotoContestProcessError = (req, res, fields, files) => {
    res.redirect(303, '/contest/vacation-photo-error')
}

exports.vacationPhotoContestProcessThankYou = (req, res) => {
    res.render('contest/vacation-photo-thank-you')
  }


// 使用fetch實做的async 檔案上傳   , 基本上就和HTML表單的方式類似 , 但使用fetch+json
// 我直觀上看到的差異就是省略處理轉址與瀏覽器重新渲染 , 另外因為fetch api是async運作 , 我們要在res回傳success
// 這樣fetch api的function才可以進行後續處理
exports.vacationPhotoContestAjax = (req, res) => {
const now = new Date()
res.render('contest/vacation-photo-ajax', { year: now.getFullYear(), month: now.getMonth() + 1 })
}
exports.api.vacationPhotoContest = (req, res, fields, files) => {
console.log('field data: ', fields)
console.log('files: ', files)
res.send({ result: 'success' })
}
exports.api.vacationPhotoContestError = (req, res, message) => {
res.send({ result: 'error', error: message })
}


 