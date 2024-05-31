const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const app = express();
const sendMail = require("../server-job/Controllers/sendMail");
const port = process.env.PORT || 5015;

//  <----------Middle ware --------->
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
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
    // Sending Application Confirm Mail
    app.get("/application", sendMail);

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
