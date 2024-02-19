/*
    此為Chapter.9 ,我們要使用Session去實做針對newsletter帳號是否註冊成功的快閃訊息 ,    
    這邊建立handlers3.js 搭配meadowlark6.js 

    主要就是先去除掉了對檔案上傳的部份(vacation-photo)的handler與routing , 簡化程式碼將重點放在session的快閃訊息上 
    另外我也先去除了使用fetch上傳的表單 , 只保留最原始的HTML表單上傳處理與routing , 這是因為如果使用Ajax來做表單提交的app
    通常不會使用session來控制UI , 通常使用Ajax的模式會是在我們的處理式回傳的JSON中指出要做的動畫或效果 , 由前端渲染去完成

    作者在這邊將原始的newsletterSignupProcess這個function做了蠻大的改動 , 而不是只是像先前打印表單的資訊
    另外建立一個class作為帳戶的interface ,

*/

const fortune = require("./fortune"); 


exports.home = (req ,  res) => res.render("home") ; 

exports.about = (req , res) => res.render("about" , {fortune: fortune.getFortune()});

exports.notFound = (req , res) => res.render("404"); 

exports.serverError = (err , req , res , next ) => res.render("500");


// 加入ch.9 我們要對用戶註冊產生快閃訊息 , 將處理式改為驗證用戶註冊的email是否有效 (反正我們現在大概也只能這樣做 ) 
// 將驗證後是否成功註冊作為快閃訊息的內容迴傳給使用者

class NewsletterSignup {

    constructor({name , email}){
        this.email = email ; 
        this.name  = name  ; 
    }

    async save() {
        console.log("Call save")
        /*
            這邊對應的方法就是將帳號資料保存到database中 , 而這件事情是非同步的
            他應該要return一個promise , 依照作者的話,這邊因為我們沒有主動raise errro ,所以這個promise會被解析為success (就跟return隨便一個東西一樣)
        */ 
    }
}

// 加入正則表達式 , 用來檢驗email位置是否合法
const VALID_EMAIL_REGEX = new RegExp('^[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~-]+@' +
  '[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?' +
  '(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$')



exports.newsletterSignup = (req, res) => {
    res.render('newsletter-signup', { csrf: 'CSRF token goes here' })
}

exports.newsletterSignupProcess = (req, res) => {
    const name = req.body.name || ""  ;
    const email = req.body.email || "" ; 

    // 如果信箱格式不符合標準 , 我們在session中加入快閃訊息後就將其轉址"回到原本填表單的地方" 
    if (!VALID_EMAIL_REGEX.test(email)){
        console.log("Email format error") ;  
        req.session.flash = {
            type:'danger' , 
            intro:'validation error ' , 
            message: 'The email address you entered was not valid' ,
        }
        return res.redirect(303 , "/newsletter-signup") ; 
    }

    // 信箱有效 , 透過interface建立一組帳號資料, 使用非同步的保存並處理promise
    new NewsletterSignup({name , email}).save() 
    // 我們的save()是模擬非同步保存到DB的情況 , 因此也需要分別處理DB保存請求成功與失敗的case , 並更新快閃訊息
    // 因為我們的快閃訊息是經過中介函式 , 從req.session被抓進res.locals , 因此必須要使用轉址, 
    // 有點類似我們在這邊操作request session ,讓我們中介函式來取得

    // 另外,根據GPT描述 , 在重新定向時是告訴browser需要"重新發一個新的一樣的request到新的目標位置" ,因此實際上不是透過我們在此更動的req去觸發這個路由
    // 因為發送的req是新的, 儲存的session實際上是靠中介函式捕捉到的 , 而不是發送到轉址路由的請求有session的資訊!!!
    // 具體的流程在 中介函式會在開始進行重定向前執行過一遍 , 這當中就包含我們將資料存入locals的中介函式 , 執行完成後才會開始讓browser去重發request
    .then(
        ()=>{
            req.session.flash = {
                type:"success" ,
                intro : 'Thank you!' , 
                message: "You have now been signed up for the newsletter." , 
            }
            return res.redirect(303 , "/newsletter-archive") ; 
        }
    ) 
    .catch(
        (err) => {
            req.session.flash = {
                type:"danger" , 
                intro : "Database error !" ,
                message:"There was a database error ; please try again later" 
            } 
            return res.redirect(303 , "/newsletter-archive") ; 
        }
    )

}

// Archive也是ch9才加入的 
exports.newsletterArchive = (req , res) => res.render("newsletter-archive") ; 

exports.newsletterSignupThankYou = (req, res) => res.render('newsletter-signup-thank-you')

