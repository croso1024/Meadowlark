/*
    tourRequiresWaiver.js 示範了使用模組匯出中介函式的作法 , 
    但更常見的情況是匯出一包含多個中介函式的物件來使用
*/

module.exports = {

    // 清空cart.warning 與 cart.error的中介函式
    resetValidation(req, res ,next){
        const {cart} = req.session ; 
        if (cart) {
            cart.warnings = [] ; 
            cart.errors = [] ; 
        }         
        next() 
    }, 

    // 檢查購物車內的商品是否有需要免責聲明的 , 有的話加入警告
    checkWaivers(req,res,next){

        const {cart} = req.session ; 

        if (!cart) {return next()}

        if (cart.items.some( item=> item.product.requiresWaiver ) ){
            cart.warnings.push('One or more of your selected tour requires a waiver.')
        }
        next() 

    },

    // 檢查購物車內的商品有沒有供應人數小於下訂數的, 有的話要加入警告
    checkGuestCounts(req,res,next) {
        const {cart} = req.session ; 
        if(!cart){return next();}
        if (cart.items.some( item=>item.guests > item.product.maxGuests )){
            cart.errors.push("One of more of your selected tours cannot" + 
            "accommodate the number of guests you have selected.") ; 
        }
        next() 
    }

}