const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vnidizo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const artCollection = client.db("artDB").collection("art");

    app.get("/art", async (req, res) => {
      const cursor = artCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/art/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const user = await artCollection.findOne(query);
      res.send(user);
    });

    app.get("/myartlist/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await artCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    app.put("/art/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedArt = req.body;
      const art = {
        $set: {
          artName: updatedArt.artName,
          photoURL: updatedArt.photoURL,
          subcategoryName: updatedArt.subcategoryName,
          customization: updatedArt.customization,
          price: updatedArt.price,
          rating: updatedArt.rating,
          processingTime: updatedArt.processingTime,
          stockStatus: updatedArt.stockStatus,
          description: updatedArt.description,
        },
      };
      const result = await artCollection.updateOne(filter, art, option);
      res.send(result);
    });

    app.delete("/art/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await artCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/art", async (req, res) => {
      const newArt = req.body;
      console.log(newArt);
      const result = await artCollection.insertOne(newArt);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("SImple Crud server is running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
