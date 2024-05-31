const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const app = express();
const cookieParser = require("cookie-parser");
const sendMail = require("./sendMail");
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
    // Sending Application Reject Mail
    app.get("/applicationReject", rejectMail);

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
