/*
    Ch18 & Ch19 , 

    額外獨立一個部份用來處理放在主程式中與授權相關的路由處理式,
    包含登入,登出,未受權以及staff only / customer only的middleware 

    我們在主程式中會'串連基本操作與身份別確認'的middleware ,
    先進行customer或employee的確認後才執行基本的操作 
    
    Example. app.get('/account' , customerOnly , accountPage)

*/


// ---------- 基本登入成功與未登入處理 ----------------

// 加入驗證帳戶的路由 , 只有經過驗證的使用者能進入這個頁面
exports.accountPage = (req ,res)=>{
    // 驗證完成的req.user就為包含我向facebook請求的那些使用者資訊 , 但這部份我們現在用customerOnly取代檢驗
    // if (!req.user) {return res.redirect(303 , '/unauthorized');}
    res.render( 'account' ,  {username:req.user.name , role:req.user.role});
}
// 處理沒有登入或登入失敗的情況
exports.unauthorized = (req,res) =>{
    res.status(403).render('unauthorized') ;
}
// 登出 , 書本上的寫法無法正常運作,這邊參考passport官方doc , 可以正常登出帳號
exports.logout = (req,res)=>{
    req.logout( (err)=>{
        
        if(err) {
            console.log("Log out error ", err);
            return next(err) ; 
        }  
        res.redirect("/")
    } ) ;
    // req.redirect('/')
}


// ----------- 依據身份別提供不同內容 --------------

exports.customerOnly = (req,res,next) =>{
    // 如果使用者身份是顧客才能通過,否則會被擋下來到登入頁面
    console.log('user: ', req.user)
    if (req.user && req.user.role === 'customer'){
        return next() ;
    }
    res.redirect(303 , '/unauthorized') ; 
}

// 在提供給內部人員的頁面中我們需要一些不同的處理,例如我們有個路徑/sales是只希望給員工使用與知道,
// 那麼就必須將其隱藏起來,而不能讓一般使用者或未登入的人前往/sales路徑時看到Not authorized的畫面 ,
// 因此我們的目標就是讓未登入的人進入/sales頁面時看到的結果為404
exports.employeeOnly = (req, res , next) =>{
    console.log('user: ', req.user)
    if (req.user && req.user.role === 'employee'){
        return next() ; 
    }
    // 我們在此就不轉址回到未授權了 , next()搭配'route'參數會"跳過"串在一個app.get()路由式中後面的處理式
    // 因此若後續沒有其他可以承接(在此是/account)的路由,就會到達404
    next('route')
}


// ---------- For test ---------------
exports.orderHistory = (req,res)=>{
    res.render('account/order-history') ; 
}

exports.emailPref = (req,res)=>{
    res.render('account/email-preference') ; 
}

exports.sales = (req,res)=>{
    res.render('sales')
}