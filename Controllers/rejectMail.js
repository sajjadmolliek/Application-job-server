const nodemailer = require("nodemailer");

const rejectMail = async (req, res) => {
  try {
    // Create a test account (only needed for testing, remove in production)
    let testAccount = await nodemailer.createTestAccount();

    // Create reusable transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // generated ethereal user
        pass: process.env.EMAIL_PASS, // generated ethereal password
      },
    });

    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: {
        name: "Janifa",
        address: process.env.EMAIL_USER,
      }, // sender address
      to: ["jannatulaxajanifa586@gmail.com", "sajjadmolliek2018@gmail.com"], // list of receivers
      subject: "Hello Janifa ✔", // Subject line
      text: "Reject?", // plain text body
      html: "<b>Reject</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
    res.json(info);
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

module.exports = rejectMail;
