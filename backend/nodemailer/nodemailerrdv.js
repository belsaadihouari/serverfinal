"use strict";
const nodemailer = require("nodemailer");

const Nodemailerrdv = async (emaildestinataire, date, hour) => {
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
  const emailBody =  `
    <div dir="rtl" style="text-align: right;">
      يجرى منكم التقرب بتاريخ ${date} على الساعة ${hour} الى مركز تطوير المقاولاتية بطريق كارمان بتيارت من أجل المقابلة الفردية مرفقين بالوثائق التالية:
      <ul style="list-style-position: inside; padding-right: 0; text-align: right;">
        <li>بطاقة التعريف الوطنية</li>
        <li>مخطط الاعمال</li>
        <li>نموذج الأعمال</li>
        <li>الفاتورة الشكلية للعتاد + التأمين</li>
      </ul>
      و اي استفسار يمكنكم مراسلتنا على البريد الإلكتروني: simulationcde@gmail.com
      <br><br>
      يمكنك العثور على الموقع هنا: <a href="https://www.google.com/maps?q=35.379411,1.348485">35.379411, 1.348485</a>
    </div>
  `;

  const message = {
    from: '"CDE SIMULATION" <simulationcde@gmail.com>', // sender address
    to: emaildestinataire,
    subject: "المقابلة الفردية", // Subject line
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

module.exports = Nodemailerrdv;
