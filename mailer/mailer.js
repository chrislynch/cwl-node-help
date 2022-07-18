const nodemailer = require("nodemailer");
const htmlToFormattedText = require("html-to-formatted-text");

const options = { 
    host: "",
    port: 25,
    secure: false, // true for 465, false for other ports
    user: '', // generated ethereal user
    pass: '', 
}

function option(key,value){
    if(value !== undefined){
        options[key] = value
    }
    return options[key]
}

async function sendMail(from,to,subject,html,attachments = []){
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  
  var transportOptions = {
    host: options.host,
    port: options.port,
    secure: options.secure, // true for 465, false for other ports
  }
  if (options.user !== ''){
    transportOptions.auth = {
      user: options.user, // generated ethereal user
      pass: options.pass
    }
  }
  let transporter = nodemailer.createTransport(transportOptions);

  // send mail with defined transport object
  var message = {
    from: from, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: htmlToFormattedText(html), // plain text body
    html: html, // html body
    attachments: attachments // attachments as per https://nodemailer.com/message/attachments/
  }
  

  let info = await transporter.sendMail(message);

  // console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou..
}


module.exports = { option,sendMail }