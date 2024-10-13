"use strict";
const nodemailer = require("nodemailer");

const Nodemailerchangerdv = async (emaildestinataire,generateConfirmationLink) => {
  const transporter = nodemailer.createTransport({
    
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: "simulationcde@gmail.com",
      pass: "dbtylaflbxmahtcz",
      
    },
    
    
  });
  const emailBody = `
  <!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Inline CSS for email compatibility */
    .email-container {
      width: 100%;
      
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      padding: 20px;
      color: #ffffff;
    }
    .email-content {
      max-width: 600px;
      margin: 0 auto;
      background: rgba(0, 0, 0, 0.5);
      padding: 20px;
      border-radius: 10px;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      font-size: 16px;
      font-weight: bold;
      color: #ffffff;
      background-color: #007bff;
      text-align: center;
      text-decoration: none;
      border-radius: 5px;
      border: 1px solid #007bff;
      transition: background-color 0.3s, border-color 0.3s;
    }
    .button:hover {
      background-color: #0056b3;
      border-color: #0056b3;
      color: #FFFFFF;
    }
  </style>
</head>
<body>
  <table class="email-container" role="presentation" cellspacing="0" cellpadding="0">
    <tr>
      <td>
        <table class="email-content" role="presentation" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <p>عزيزي المستخدم،</p>
              <p>إذا كنت بحاجة إلى تغيير موعدك، يمكنك القيام بذلك من خلال الرابط أدناه:</p>
              <p>
                <a href="${generateConfirmationLink}" class="button">
                  تغيير موعدي
                </a>
              </p>
              <p>إذا لم تكن قد حاولت تغيير موعد المحاكاة، يرجى تجاهل هذا البريد الإلكتروني.</p>
              <p>مع أطيب التحيات،<br> NESDA TIARET</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>




  `;

  const message = {
    from: '"simulationcde@gmail.com" <simulationcde@gmail.com>', // sender address
    to: emaildestinataire, 
    subject: "ف/ي تغيير موعد المقابلة الفردية", // Subject line
    html: emailBody,
  };
  await transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Email Sent:" + info.response);
    }
  });
};

module.exports = Nodemailerchangerdv;