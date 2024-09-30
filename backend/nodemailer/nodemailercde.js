"use strict";
const nodemailer = require("nodemailer");

const Nodemailercde = async (emaildestinataire,generateConfirmationLink) => {
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Inline CSS for email compatibility */
    .email-container {
      width: 100%;
      background-image: url('https://res.cloudinary.com/dtjpxlbkn/image/upload/v1726183308/cde/lafauj7oomuh4bs5tb9n.jpg'); /* Change this to your image URL */
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      padding: 20px;
      color: #ffffff; /* Adjust text color to ensure readability */
    }
    .email-content {
      max-width: 600px;
      margin: 0 auto;
      background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
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
      color:#FFFFFF;
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
              <p>Dear user,</p>
              <p>Thank you for registering on CDE simulation. To complete your registration, please click on the button below to confirm your email address:</p>
              <p>
                <a href="${generateConfirmationLink}" class="button">
                  Confirm email address
                </a>
              </p>
              <p>If you did not attempt to register on this platform, please ignore this email.</p>
              <p>Best regards,<br>NESDA TIARET</p>
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
    from: '"CDE SIMULATION" <simulationcde@gmail.com>', // sender address
    to: emaildestinataire, 
    subject: "In reference to your registration", // Subject line
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
module.exports = Nodemailercde;