const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const app = express();
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");
const sendMail = require("./sendMail");
const AcceptMail = require("./AcceptMail");
const rejectMail = require("./rejectMail");
const port = process.env.PORT || 5015;

//  <----------Middle ware --------->
app.use(
  cors({
    origin: ["http://localhost:5173","https://scholarshipapplicationform.surge.sh"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

//  <-------------------------------MongoDB Server --------------------------->

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.userNameBistro}:${process.env.userPassBistro}@cluster0.iatiqfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    // <--------------------- Collection in database -------------->

    const usersApplicationData = client
      .db("usersApplicationDB")
      .collection("Application");
    const adminData = client.db("usersApplicationDB").collection("AdminData");

     //  Create Admin Using post method
    app.post("/adminData", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await adminData.insertOne(data);
      res.send(result);
    });

    //<------------------Verify Admin----------------->

    app.post("/verifyAdmin", async (req, res) => {
      const userName = req.body.userName;
      const password = req.body.password;
      // Construct the query
      const query = { userName: userName, password: password };
    

      try {
        // Query on the database
        const user = await adminData.findOne(query);

        if (user) {
          res.send(true);
        } else {
          res.send(false);
        }
      } catch (error) {
        console.error("Error verifying admin:", error);
        res.status(500).json({ message: "Internal server error", error });
      }
    });

    
    //  Application post method
    app.post("/application", async (req, res) => {
      const application = req.body;
      const result = await usersApplicationData.insertOne(application);
      res.send(result);
    });
    // //  Application Accept API
    // app.patch("/applicationAccept", async (req, res) => {
    //   const application = req.body;
    //   const result = await usersApplicationData.insertOne(application);
    //   res.send(result);
    // });
    // Delete Specific Application
    app.delete('/deleteApplication/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const result = await usersApplicationData.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
      }
    });
     // Route to get a specific application by ID
     app.get('/application/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const application = await usersApplicationData.findOne({ _id: new ObjectId(id) });
        if (application) {
          res.status(200).json(application);
        } else {
          res.status(404).json({ message: 'Application not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
      }
    });

    app.get("/allApplication", async (req, res) => {
      const result = await usersApplicationData.find().toArray();
      res.send(result);
    });
    // Sending Application Confirm Mail
    app.get("/application", sendMail);
    // Sending Application Accept Mail
    app.get("/applicationAccept/:id", async(req,res)=>{
      try {
        const id = req.params.id;
        
      // Ensure environment variables are set
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("Email user or password not set in environment variables");
      }
  
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
      // Find Mail Sender
  const query = { _id: new ObjectId(id) };
  const result = await usersApplicationData.findOne(query);
  
      // Send email
      let info = await transporter.sendMail({
        from: {
          name: "Janifa",
          address: process.env.EMAIL_USER,
        },
        to: ["jannatulaxajanifa586@gmail.com", result.emailId],
        subject: "Accept Application",
        text: "Reject?",
        html: "<b>The Application is Accept by Admin</b>",
      });
    
      res.status(200).json(info);
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
    });
    // Sending Application Reject Mail
    app.get("/applicationReject/:id", async(req,res)=>{
      try {
        const id = req.params.id;
        // Ensure environment variables are set
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
          throw new Error("Email user or password not set in environment variables");
        }

    
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
        // Find Mail Sender
        const query = { _id: new ObjectId(id) };
  const result = await usersApplicationData.findOne(query);
    
        // Send email
        let info = await transporter.sendMail({
          from: {
            name: "Janifa",
            address: process.env.EMAIL_USER,
          },
          to: ["jannatulaxajanifa586@gmail.com", result.emailId],
          subject: "Reject Application",
          text: "Reject?",
          html: "<b>Sorry to say that, Your Application has been Rejected by Admin</b>",
        });
    
        console.log("Message sent: %s", info.messageId);
        res.status(200).json(info);
      } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
      }
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("I am The API for Job Task!");
});

app.listen(port, () => {
  console.log(`task is running on port ${port}`);
});
