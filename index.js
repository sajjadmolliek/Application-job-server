const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5007;

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
const uri = `mongodb+srv://${process.env.userNameBistro}:${process.env.userPassBistro}@cluster0.rsgizg7.mongodb.net/?retryWrites=true&w=majority`;

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

    const usersApplicationData = client.db("usersApplicationDB").collection("Application");


    //<------------------Verify Admin----------------->

    // const verifyAdmin = async (req, res, next) => {
    //   const email = req.user.sendingUser;
    //   const query = { email: email };
    //   const AdminCK = await usersData.findOne(query);
    //   if (AdminCK?.role !== "Admin") {
    //     res.status(403).send({ message: "Forbidden Access" });
    //   }
    //   next();
    // };





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
  console.log(`Bistro Boss sitting on port ${port}`);
});
