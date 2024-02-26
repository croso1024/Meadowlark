/*
    這邊的內容就是對於我們這一章設計的四個API的implement. 
    實際上大多都是使用db的呼叫 , 注意我們也要在抽象層的db.js去實現相應的資料庫操作
*/

const database = require('../db') ;  


exports.getVacationsApi = async (req, res) => {
    const vacations = await database.getVacations({ available: true })
    res.json(vacations)
}
  
exports.getVacationBySkuApi = async (req, res) => {
    const vacation = await database.getVacationBySku(req.params.sku)
    res.json(vacation)
}
  
exports.addVacationInSeasonListenerApi = async (req, res) => {
    await database.addVacationInSeasonListener(req.params.sku, req.body.email)
    res.json({ message: 'success' })
}
  
exports.requestDeleteVacationApi = async (req, res) => {
    const { email, notes } = req.body
    res.status(500).json({ message: 'not yet implemented' })
}
  