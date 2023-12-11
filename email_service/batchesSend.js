/*
    這邊為書中範例去將大量的收件者進行分批發送的實現 ,
    使用reduce

*/

const nodemailer = require('nodemailer')

const credentials = require('./credential')

const mailTransport = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  auth: {
    user: credentials.sendgrid.user,
    pass: credentials.sendgrid.password,
  },
})




async function go() {
    const largeRecipientList = new Array(2000).fill().map((_, idx) => `customer${idx}@nowhere.com`)
    // largeRecipientList is an array of email addresses
    const recipientLimit = 100

    // 重新拆解書本範例的reduce , 第一個參數是目前為止累積的batches , 第二個則是下一筆收件人地址
    function toBatch( batches , next  ){
        // 從目前累積的batches里取出最後一筆batch
        const lastBatch = batches[batches.length - 1]  
        // 當前batch還沒到達上限 , 添加
        if (lastBatch.length < recipientLimit) {
            lastBatch.push(next) 
        }
        // 當前batch滿了 , 把這筆資料放入下一個batch
        else {
            batches.push( [next] ) 
        }
        return batches 
    }

    // 透過reduce和上面的combine function來對寄件人地址進行分批, 初始的batches參數為 [[]]
    const batches = largeRecipientList.reduce(
        toBatch , [[]]
    )


    try {
    const results = await Promise.all(batches.map(batch =>
        mailTransport.sendMail({
        from: '"Meadowlark Travel", <info@meadowlarktravel.com>',
        to: batch.join(', '),
        subject: 'Special price on Hood River travel package!',
        text: 'Book your trip to scenic Hood River now!',
        })
    ))
    console.log(results)
    } catch(err) {
    console.log('at least one email batch failed: ' + err.message)
    }
}

go()