const fortune = require("./fortune"); 


exports.home = (req ,  res) => res.render("home") ; 

exports.about = (req , res) => res.render("about" , {fortune: fortune.getFortune()});

exports.notFound = (req , res) => res.render("404"); 

// next引數實際上在此我們沒有使用到 , 但express實際上是靠傳給他的引數數量來判斷是不是錯誤處理式
// 因此我們不想省略 , 為了避免ESLint一直跳出沒有使用到的變數警告 , 我們可以單獨把他屏蔽掉

/* eslint-disable no-unused-vars */

exports.serverError = (err , req , res , next ) => res.render("500");

/* eslint-enable no-unused-vars */

