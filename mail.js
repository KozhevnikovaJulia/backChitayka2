const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const {EMAIL_HOST, EMAIL_HOST_PASSWORD, EMAIL_HOST_USER, EMAIL_PORT} = process.env

let transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false,
  auth: {
    user: EMAIL_HOST_USER,
    pass: EMAIL_HOST_PASSWORD,
  },
})

const sendMail = async (email, password) => {
    let result = await transporter.sendMail({
        from: '"Node js" <nodejs@example.com>',
        to: email,
        subject: 'Password',
        text: password,
        html:
          'This <i>message</i> was sent from <strong>Node js</strong> server.',
      })
    return result
}
exports.sendMail = sendMail



