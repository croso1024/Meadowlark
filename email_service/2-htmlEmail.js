/*
    就只是將原本的信件額外提供HTML的版本 , 我們同時提供純文字與html版本就可以讓接收端去選擇要顯示什麼版本 
    因為可以嵌入html , 我們也可以在我們的信件內放入圖片 , 但放入圖片這件事情也有不同作法
    1. 在email內嵌入圖片,但這會使得email變胖,不是一個非常好的作法
    2. 將傳入的HTML img src指向自己server的資源 , 但對於目前我們自行按照書中內容操作來說 , 我們只能給localhost並且也只有自己能看到

    測試結果 , 我使用gmail打開信件就可以直接看到HTML版本的信件內容 , 
    但使用html嵌入img , 似乎沒有辦法直接讓信件存取到我們的圖片 , 主要有兩個問題 1.我想我們還需要啟動server ,2.路徑地址不太清楚 
    但接下來我們就要做一個完整 , 使用views來作為回傳信箱的模板 ,並且啟動完整server來測試我們的下訂單感謝信功能

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
    try {
    const result = await mailTransport.sendMail({
        from: '"Meadowlark Travel-img" <croso1024@gmail.com>',
        to: ' <croso1024@gmail.com> ', 
        subject: 'Your Meadowlark Travel Tour',

        //   html: '<h1>Meadowlark Travel</h1>\n<p>Thanks for book your trip with ' +
        // 'Meadowlark Travel.  <b>We look forward to your visit!</b>' ,
        
        // 加入圖片的html 
        html : '<h1>Meadowlark Travel</h1>\n<img src="//meadowlarktravel.com/img/chicken.png" alt="CHICKEN"' + 
        '<b>We look forward to your visit!</b>',

        text: 'Thank you for booking your trip with Meadowlark Travel.  ' +
        'We look forward to your visit!',
    })
    console.log('mail sent successfully: ', result)
    } catch(err) {
    console.log('could not send mail: ' + err.message)
    }
}

go()