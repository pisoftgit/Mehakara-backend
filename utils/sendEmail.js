const nodemailer = require('nodemailer');
const crypto = require('crypto');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false // This bypasses the self-signed certificate error
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Mehakara <noreply@mehakara.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
