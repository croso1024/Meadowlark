/*
    在此的vacationInSeasonListener , 我們想要實現讓顧客去訂閱目前非該季節的旅遊行程,
    一旦該旅遊行程的季節到來後去提醒顧客的功能,這邊我們在我們的database中加入一種新的資料模型

    該資料模型基本上就是儲存 "每個使用者訂閱了哪些sku"
*/


const mongoose = require("mongoose") ; 

const vacationInSeasonListenerSchema = mongoose.Schema(
    {
        email : String , 
        skus : [String] , 
    }
)

const vacationInSeasonListener = mongoose.model("VacationInSeasonListener" , vacationInSeasonListenerSchema) ; 

module.exports = vacationInSeasonListener ; 