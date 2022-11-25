const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

//jwt middleware function
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).send("Unauthorized access");
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden acccess" });
    }
    req.decoded = decoded;
    next();
  });
}

//run function
async function run() {
  try {
    const usersCollection = client.db("resaleProducts").collection("usersData");
    const categoryCollection = client
      .db("resaleProducts")
      .collection("categoryData");
    const productsCollection = client
      .db("resaleProducts")
      .collection("productsData");
    const blogCollection = client
      .db("resaleProducts")
      .collection("questionAndAnswer");

    //get question and answer
    app.get("/questions", async (req, res) => {
      const query = {};
      const result = await blogCollection.find(query).toArray();
      res.send(result);
    });

    //get three category items
    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await categoryCollection.find(query).toArray();
      res.send(result);
    });

    //get all products items
    app.get("/products/:id", async (req, res) => {
      const category_id = req.params.id;
      const filter = { category_id };
      const result = await productsCollection.find(filter).toArray();
      res.send(result);
    });

    //jwt access token
    // app.get("/jwt", async (req, res) => {
    //   const email = req.query.email;
    //   const query = { email: email };
    // });

    //post method for users information
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
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
