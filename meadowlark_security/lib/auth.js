/*
    Ch18, 將有關授權部份的功能寫在這, 主要是完成Passport這個lib需要的兩個主要方法
    1.serializeUser
    2.deserializeUser.
    這兩個函數的目的是為了將請求對應到要驗證身份的用戶 , 並且讓我們使用我們要的儲存方式去將使用者資訊存入,取出
    雖然在這邊只單純存取user id這件事讓serialize和deserialize的名子看起來不是那麼直觀就是了

    這兩個函數是Passport能實現基本功能的主要界面 ， 但要把passport嵌入到我們的web中 , 
    我們還需要處理初始化後將其接上路由處理式 , 以及處理來自第三方授權服務轉址回來的request .
    ! 注意這邊登入過一次之後就會把session id與存起來,所以如果要重新測試需要去f12砍掉cookie中的session id
    (我後面完成logout就不用這樣搞了)

    有了身份驗證後,我們在home.handlebars模板加入了身份驗證後額外顯示的內容,
    同時在/lib/authHandler裡面定義了與需要授權的頁面相關的路由以及以照身份進行授權的customerOnly , employeeOnly
    透過串接middleware處理的方式來進行用戶驗證後顯示內容或導向到登入選項畫面

    -- ,
    本章最後,我們再去google developer console設定了google第三方驗證的服務,
    基本上整個流程與passport的操作都與我們原本在facebook的作法相同
    

    ----- 
    整個passport的session可以參考官方doc https://www.passportjs.org/concepts/authentication/sessions/, 
    寫的很不錯, 流程上大致來說即:
    1. 第三方驗證成功 , 此時這些資訊透過serializeUser存入 , 當然可以存入多種資訊,( see doc )
    2. 在使用者於網頁之間移動的時候 , passport.session() 可以用來檢查是否已經有驗證過得身份 , 接在普通的session middleware之後 
    3. 當session是已經經過身份驗證的之後, deserializeUser會把前面存入的屬性取出設定在req中 

*/


const passport = require('passport') ; 
const FacebookStrategy = require('passport-facebook').Strategy ; 
const GoogleStrategy = require("passport-google-oauth20").Strategy ; 

const db = require('../db') ; 



// 我們這組serialize , deserialize作法, 基本上就是只存id , 其他資訊仰賴DB取得, 當然也可以反過來把資訊存在session中 , 但這會有可能導致cookie變胖
// 將user的資訊存入 
passport.serializeUser(
    (user , done) => {
        done(null , user._id)
    }
) ; 
// 在需要的時候從db取出user id 
// 在完成這個method後, 只要session是存在且可用 , 使用者的資訊就會在 req.session.passport.user 中
passport.deserializeUser(
    (id , done)=>{
        db.getUserById( id ) 
        .then( user => done(null , user)) 
        .catch(err => done(err , null ))  
    }
) ; 

/*
    在這個授權模組中 , 除了上面passport的基本呼叫以外，我們會需要處理一些實際與我們的server嵌入的問題,這包含:
    - 初始化我們的授權模組，將其接入主程式的middleware chain ,
    - 註冊用來處理第三方轉址回來的response處理路由

    這邊比較特殊的地方在於 , 我們並不是直接在模組中回傳init , register這兩個function,
    而是將這個授權模組變成一個函式 , 其回傳一個包含init和register的物件. 

    之所以將初始化與註冊路由分開,是因為在主程式裡面我們可能會需要更彈性的決定加入middleware的位置(順序),因此init提供了一個讓我們
    自己設定
    另一方面, 我們之所以回傳一個function 而不是直接將init , register回傳的原因在於我們可以透過這樣的方式加入一些組態設定
*/

module.exports = (app , options) =>{

    // 這邊是設定一下轉址成功或失敗時應該要導引的地方的預設值 , 但這應該要在主程式呼叫時所提供的組態中設定
    if (!options.successRedirect) { options.successRedirect = '/account'}
    if (!options.failureRedirect) { options.failureRedirect = '/login' }  
    return {
        init : function(){
            // 載入組態檔中可以使用的第三方授權資訊
            let config = options.providers ;

            // 設置Facebook的第三方登入策略 , 關鍵在我們傳遞給FacebookStrategy的函數,
            // 這個函數是在"用戶成功驗證身份後"呼叫 , 用戶相關資訊會被放在profile中 , 同時在profile中會有該用戶
            // 在facebook的唯一id , 我們將其改為facebook:客戶id , 用來防止第三方授權服務的id衝突.
            passport.use( 
                new FacebookStrategy(
                    {
                        clientID : config.facebook.appId , 
                        clientSecret : config.facebook.appSecret , 
                        // 處理fb授權結果的轉址callback
                        callbackURL : (options.baseUrl || "") + '/auth/facebook/callback' ,
                    }  , 
                    (accessToken , refreshToken , profile , done) => {
                        const authId = 'facebook:' + profile.id 
                        db.getUserByAuthId(authId) 
                        // 如果這個authId的使用者已經在DB了,我們就直接回傳, passport的serializer會幫我們把用戶Id放入session
                        .then( user =>{
                            if (user){return done(null,user)}  
                            // 新的user就把他存進DB
                            db.addUser({
                                authId : authId , 
                                name : profile.displayName , 
                                created : new Date() , 
                                role : 'customer' , 
                            })
                            .then( user => done(null , user)) 
                            .catch( err => done(err , null)) 
                        } )
                        
                        .catch(err => {
                            if(err) return done(err , null) ; 
                        })


                    }
                )
            ) 

            // 設置passport的google版middleware , 基本上就是和facebook版本一樣,注意我把用google登入的使用者
            // 權限直接改為employee方便我做測試 
            passport.use(
                new GoogleStrategy(
                {
                    clientID: config.google.clientID,
                    clientSecret: config.google.clientSecret,
                    callbackURL: (options.baseUrl || '') + '/auth/google/callback',
                }   , 
                (token, tokenSecret, profile, done) => {
                    const authId = 'google:' + profile.id
                    db.getUserByAuthId(authId)
                        .then(user => {
                            if(user) return done(null, user)
                            db.addUser({
                                authId: authId,
                                name: profile.displayName,
                                created: new Date(),
                                role: 'employee',
                            })
                            .then(user => done(null, user))
                            .catch(err => done(err, null))
                        })
                        .catch(err => {
                            console.log('whoops, there was an error: ', err.message)
                            if(err) return done(err, null);
                        })
                })
            )


            app.use(passport.initialize()) ; 
            // 用來將用戶的授權狀態與我們的session連接在一起 , 當用戶被驗證後,狀態存在req.session.passport.user
            // 我們在上面passport.serialize只存了_id這個屬性, 而這個屬性的來源是facebook回應我們驗證成功的請求 ,
            // 因此相當於我們fb回給我們的user._id放在req.session.passport.user中!?
            app.use(passport.session()) ;  

        },

        // 註冊路由處理式
        registerRoutes : function(){

            // "auth/facebook" 這個路徑會將訪客轉址到facebook的身份驗證(這一步驟是passport.authenticate('facebook')做到的)
            // 同時我們去檢查req是否有查詢字串,如果有的話就放入session , 這樣登入後就可以直接到達user要去的位置
            app.get("/auth/facebook" , (req,res,next)=>{
                // 紀錄下用戶登入前的頁面放在session , 之後還可以幫用戶轉回去
                console.log(`Debug  req.query.redirect : ${req.query.redirect} `)
                if (req.query.redirect) {req.session.authRedirect = req.query.redirect }
                passport.authenticate('facebook')(req,res,next)
            })
            

            // 這個路由處理式在處理當用戶通過第三方授權後,第三方先傳送轉址(轉到這邊/auth/facebook/callback)回應給使用者瀏覽器
            // 接著使用者瀏覽器再向我們發出請求的處理 , 當中查詢字串可以指出user原本在哪個頁面
            // 另外passport進行身份驗證的token也是存在query內 , 而failureRedirect是當今天驗證失敗後要轉的位置

            // 額外注意! , 這邊就是串連2個middleware , 先串連passport.authenticate ,
            // 若驗證成功才會轉到我們自己寫的(req,res)處理式
            app.get(
                    '/auth/facebook/callback' , 
                    // 當驗證成功會自己去call next()並把控制flow轉回我們的app , 並轉址到原始位置
                    // 即passport.authenticate也是一個middleware , 在驗證成功時會幫我們call next()
                    passport.authenticate('facebook' , {failureRedirect:options.failureRedirect}) , 
                    // passport驗證通過,接上我們自己的處理式
                    (req,res)=>{
                        console.log('Successful /auth/facebook/callback') 
                        // 這邊實際上在選擇究竟要轉址到哪, 在前面轉址去fb授權時我們就將查詢字串中的redirect(如果有)賦予authRedirect了,
                        // 但這邊實際上就是展示一下說可以這樣用 , 我們options中預設的successRedirect放在短路算子最後
                        // console.log(`Debug : req.user :${JSON.stringify(req.user)} , req.session ${JSON.stringify(req.session)} , req.query ${JSON.stringify(req.query)} `)
                        const redirectUrl = req.session.authRedirect || req.query.redirect || options.successRedirect
                        console.log("Login success , redirect URL",redirectUrl)
                        delete req.session.authRedirect 
                        res.redirect(303 , redirectUrl) 
                    }                
                )

            
            // 設置google驗證發出授權請求以及接受授權結果轉址請求的路由
            app.get('/auth/google', (req, res, next) => {
                    if(req.query.redirect) req.session.authRedirect = req.query.redirect
                    passport.authenticate('google', { scope: ['profile'] })(req, res, next)
            })
            app.get(
                '/auth/google/callback', 
                passport.authenticate('google',{ failureRedirect: options.failureRedirect }),
                (req, res) => {
                console.log('successful /auth/google/callback')
                // we only get here on successful authentication
                const redirectUrl = req.session.authRedirect || req.query.redirect || options.successRedirect 
                console.log("Login success , redirect URL",redirectUrl)
                delete req.session.authRedirect 
                res.redirect(303 , redirectUrl) 
                }
            )


        }
    }

}