const { ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");

const AcceptMail = async (req, res) => {
    
    try {
      const id = req.params.id;
      
    // Ensure environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email user or password not set in environment variables");
    }
// console.log(id);
const query = { _id: new ObjectId(id) };
const result = await usersApplicationData.findOne(query);
    // const result = await usersApplicationData.findOne({ _id: new ObjectId(id) });
        console.log(result);

    // Create transporter object using SMTP
    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    let info = await transporter.sendMail({
      from: {
        name: "Janifa",
        address: process.env.EMAIL_USER,
      },
      to: ["jannatulaxajanifa586@gmail.com", "sajjadmolliek2018@gmail.com"],
      subject: "Accept Application",
      text: "Reject?",
      html: "<b>The Application is Accept by Admin</b>",
    });

    console.log("Message sent: %s", info.messageId);
    res.status(200).json(info);
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = AcceptMail;
