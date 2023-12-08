/*
    這邊實做一個使用模組匯出的middleware , 接著可以透過下面的方式來使用

    const middleware = require("./lib/middleware") ; 
    app.use(middleware); 
    
    在這邊我們要做的是針對購物車內容檢查的中介函式 ,
    購物車的內容會被保存在request session中,當然如果沒有購物車內容的話
    這個中介函式就只會直接串接到下一個中介函式進行處理
    
*/ 



module.exports = (req ,res , next) => {
    console.log("Trigger" , req.body)
    const {cart} = req.session  //   const cart = req.session.cart ;
    // 注意這邊使用 return next() , 因為我們需要中介函式執行到此結束,用next()前往下一個
    if (!cart) {
        console.log("cart is empty")
        return next()
    }

    // 接下來的case就是檢查購物車商品是否出現需要有免責聲明的商品 , 
    // 有的話加入warning後串接到下一個中介函式
    if (cart.items.some( item=> item.product.requiresWaiver ) ){
        cart.warnings.push('One or more of your selected tour requires a waiver.')
    }

    next() ; 

}