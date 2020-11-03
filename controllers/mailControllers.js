const nodemailer = require("nodemailer");
const config = require("../config/default.json");

const userMail = async (email, subject, html) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.hostinger.in",
    port: 587,
    secure: false,
    auth: {
      user: config.EMAIL_USERNAME,
      pass: config.EMAIL_PASSWORD
    }
  });

  let info = await transporter.sendMail({
    from: '"iSharu Infotech Solutions 👻" <admin@isharu.in>',
    to: email,
    subject: subject,
    html: html
  });
  console.log("Message sent: %s", info.messageId);
};

module.exports = userMail;
