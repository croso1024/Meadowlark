/*
    處理第十五章最後，作者要求我們自行實做的Delete , 我這邊打算開一個額外的Document , 
    用來紀錄使用者向管理員發起的Delete request ,
    資料表的格式就相當簡單 , 發起人email以及想要刪除的sku
*/


const mongoose = require('mongoose') ; 

const vacationDeleteRequestSchema = mongoose.Schema(
    {
        email : String , 
        sku : String ,
        notes : String , 
    }
)

const vacationDeleteRequestListener = mongoose.model("VacationDeleteRequestListener" , vacationDeleteRequestSchema) ; 
module.exports = vacationDeleteRequestListener ;