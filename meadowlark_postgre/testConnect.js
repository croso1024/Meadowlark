
const mongoose = require('mongoose') ; 

let mongoDB = "mongodb://127.0.0.1";
mongoose.connect(mongoDB) ; 

const db = mongoose.connection ; 

db.on("error" , err=>{
    console.error("Mongo DB error" + err.message) ; 
    process.exit(1);
})
db.once("open" , ()=>{console.log("MongoDB connection established !")})