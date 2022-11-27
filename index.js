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
    const bookingCollection = client
      .db("resaleProducts")
      .collection("bookingData");
    const categoryCollection = client
      .db("resaleProducts")
      .collection("categoryData");
    const productsCollection = client
      .db("resaleProducts")
      .collection("productsData");
    const blogCollection = client
      .db("resaleProducts")
      .collection("questionAndAnswer");

    // jwt access token
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "6h",
        });
        return res.send({ accessToken: token });
      }
      console.log(user);
      res.status(403).send({ accessToken: "" });
    });

    //verify admin
    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);
      if (user.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    //get method for checking admin
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

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

    //get method for booking product
    app.get("/booking", async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const query = { email: email };
      const booking = await bookingCollection.find(query).toArray();
      res.send(booking);
    });

    //get users by get method
    app.get("/users", async (req, res) => {
      const user = req.body;
      const query = {};
      const filter = await usersCollection.find(query).toArray();
      res.send(filter);
    });

    //post method for post products
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    //post method for users information
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //put method for upsert and make admin
    app.put("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //post methods for booking items
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
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
