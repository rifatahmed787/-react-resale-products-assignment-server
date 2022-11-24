const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//database uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bathfkv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//run function
async function run() {
  try {
    const usersCollection = client
      .db("resaleProducts")
      .collection("productsData");
  } finally {
  }
}
run().catch(console.error());

app.get("/", async (req, res) => {
  res.send("Resale products running");
});

app.listen(port, () => {
  console.log(`Resale products running on port : ${port}`);
});
