const nodemailer = require("nodemailer");

const sendMail = async (req, res) => {
  const {mail} = req.query;
  let testAccount = await nodemailer.createTestAccount();
  // connect with the smtp
  let transporter = await nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let info = await transporter.sendMail({
    from: {
      name: "Janifa",
      address: process.env.EMAIL_USER,
    }, // sender address
    to: [`jannatulaxajanifa586@gmail.com, sajjadmolliek@gmail.com,${mail}`], // list of receivers
    subject: "Application is submitted", // Subject line
    
    html: "<b>Successfully SUbmitted Application</b>", // html body
  });

  res.json(info);
  
};

module.exports = sendMail;
