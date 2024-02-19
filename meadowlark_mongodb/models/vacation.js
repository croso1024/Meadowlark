/*
    我們使用models資料夾用來存放我們在Database中的Schema ,即資料綱要的模型 .
    一樣使用mongoose , 可以幫助我們定義資料模型.而我們在models資料夾中獨立建立資料的綱要模型,
    某種程度上也是為了達成我們想要的資料庫抽象層的一部份工作.

    這邊的概念比較類似於我們先使用mongoose.Schema定義綱要後 ,才透過mongoose.Model建立一個資料綱要的class
    為了方便辨識, VacationClass就是我們依據schema建立出來的class , 而課本使用的變數名稱叫做Vacation

*/


const mongoose = require("mongoose"); 

const vacationSchema = mongoose.Schema(

    {
        name: String,
        slug: String,
        category: String,
        sku: String,
        description: String,
        location: {
          search: String,
          coordinates: {
            lat: Number,
            lng: Number,
          },
        },
        price: Number,
        tags: [String],
        inSeason: Boolean,
        available: Boolean,
        requiresWaiver: Boolean,
        maximumGuests: Number,
        notes: String,
        packagesSold: Number,
    }

) 



const VacationClass = mongoose.model("Vacation" , vacationSchema) ; 

module.exports = VacationClass 