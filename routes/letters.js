var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const {EMAIL_HOST, EMAIL_HOST_PASSWORD, EMAIL_HOST_USER, EMAIL_PORT} = process.env


router.get('/', function(req, res) {
  res.send('letters');
});

router.post('/', async (req, res) => {
 const {email, password} = req.body
 let testEmailAccount = await nodemailer.createTestAccount()

 let transporter = nodemailer.createTransport({
  //  host: 'smtp.sendgrid.net',
  //  port: 587,
  //  secure: false,
  //  auth: {
  //    user: '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',
  //    pass: 'koza1501koza1501',

     host: 'smtp.ethereal.email',
   port: 587,
   secure: false,
   auth: {
    user: testEmailAccount.user,
    pass: testEmailAccount.pass,
   }
  // host: 'smtp.gmail.com',
  // port: 465,
  // secure: true,
  //  auth: {
  //    user: 'kozhevnikovajulia1501@gmail.com',
  //    pass: 'koza2603092',
  //  },
 }
 )
 
 let result = await transporter.sendMail({
   from: 'Kozhevnikova1501@yandex.ru',
   to: email,
   subject: 'Password',
   text: password,
   html:
     'This <i>message</i> was sent from <strong>Node js</strong> server.',
     attachments: [ ],
 })

console.log(result, EMAIL_HOST, EMAIL_HOST_PASSWORD, EMAIL_HOST_USER, EMAIL_PORT)
 res.send({result});

});

module.exports = router;

