/*
    透過nodemailer ,以及我們註冊好的SendGrid SMTP api去寄信件 ,
    這邊實做的時候發現說有一些部份和書上的內容已經不同 , 包括:
    - sendgrid使用的user一律為"apikey"這個字串 ,密碼則是註冊的api key , 
    - 現在寄送郵件內容的"from"似乎一定要與自己註冊的single sender信箱一樣 , 不能像書上那樣隨便給( 例如 NO-NOT-REPLY@xxx.com )

  在使用如sendgrid的服務時有幾點注意 : 
  1.  我們自己做的try-catch只能捕捉到SMTP server返回給我們的error , 
      如果是在API服務幫我們寄信的過程出錯我們沒辦法在這邊抓到 , 因此要確保信件真的有送到收信者 ,我們應該要使用sendgrid提供的服務( MSA服務提供的錯誤處理 )

  2.  寄送大量email的時候 , 不同的mail sumbitssion agent有不同的限制 ,我們使用的sendgrid就建議不要一封信件一次寄超過1000人 
      因此需要寄給多人的時候 ,可以考慮把收信者的地址從一個list內"分batch"取出後用 await promise.all做發送 
  

*/
const nodemailer = require('nodemailer')

const credentials = require("./credential") 

console.log(credentials.sendgrid.user  );
console.log(credentials.sendgrid.password) ; 
const mailTransport = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port : 587 ,
  auth: {
    user: credentials.sendgrid.user ,
    pass: credentials.sendgrid.password,
    
  },
})

async function go() {
  try {

    /*
      我們這邊測試了寄送給單一收件者與多個收件者的方式 ,
      另外再寄給多個收件者的時候可以混合 純信箱位置以及 帶有收件者名稱+信箱位置的模式
    */

    const result = await mailTransport.sendMail({
      from: '"Meadowlark Travel" <croso1024@gmail.com>',
      // 寄送給單一收件者
      // to: 'croso1024@gmail.com',

      // 寄送給多個收件者
      to: 'ed870214ed@gmail.com, "Test" <croso1024@gmail.com>, ' ,
      subject: 'Your Meadowlark Travel Tour',
      text: 'Thank you for booking your trip with Meadowlark Travel.  ' +
        'We look forward to your visit!',
    })
    console.log('mail sent successfully: ', result)
  } catch(err) {
    console.log('could not send mail: ' + err.message)
  }
}

go()
