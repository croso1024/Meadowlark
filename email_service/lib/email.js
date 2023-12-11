/*
    封裝了一個發送email的function , 稍微改寫了書本上的範例 ,
    提供一個function 讓使用者可以設定發送的信箱
*/

const nodemailer = require('nodemailer')
const htmlToFormattedText = require('html-to-formatted-text')

module.exports = (credentials , from ) => {

	const mailTransport = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    auth: {
      user: credentials.sendgrid.user,
      pass: credentials.sendgrid.password,
    },
	})

	return {
    send: (to, subject, html) => 
      mailTransport.sendMail({
        from,
        to,
        subject,
        html,
        text: htmlToFormattedText(html),
      }),
  }

}