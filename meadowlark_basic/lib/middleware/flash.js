

// 針對ch.9 使用session來實做快閃訊息所加入的中介函式,把request中的快閃訊息(如果有)抓進傳給模板的context物件
module.exports = (req ,res , next) => {
    res.locals.flash = req.session.flash  ; 
    // 將內容轉入context物件後 , 就將該訊息給砍掉
    delete req.session.flash ; 
    next() ; 
}