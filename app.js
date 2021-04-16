const express = require("express");
const app = express();
const port = 4000;
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1wwfw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const serviceCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("services");
  const userCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("users");
  const serviceBookings = client
    .db(`${process.env.DB_NAME}`)
    .collection("bookings");
  const userReviews = client.db(`${process.env.DB_NAME}`).collection("reviews");
  // perform actions on the collection object
  //add a user to db
  app.post("/add-user", (req, res) => {
    userCollection
      .insertOne({
        name: "sagar",
        email: "sagar@gmail.com",
        role: "User",
      })
      .then((result) => res.send({ message: "user added to the db" }));
  });
  //update user role
  app.patch("/update-role", (req, res) => {
    userCollection
      .updateOne(
        { _id: ObjectId("6079811009651f2b484ad140") },
        {
          $set: {
            role: "admin",
          },
        }
      )
      .then((result) => {
        res.send("user role updated successfully");
      });
  });
  //adding a service to db
  app.post("/add-new-service", (req, res) => {
    serviceCollection
      .insertOne({
        title: "canvas",
        category: [
          {
            categoryName: "name",
            price: 23,
          },
        ],
        image: "jhgg.jpg",
        description: "hah hah hah hah",
      })
      .then(function (result) {
        console.log(result);
      });
  });
  // add a new category to an existing service
  app.patch("/update-one", (req, res) => {
    serviceCollection
      .updateOne(
        { _id: ObjectId("607976addc7d4c244852d668") },
        {
          $push: {
            category: {
              categoryName: "mobile",
              price: 33,
            },
          },
        }
      )
      .then((result) => {
        console.log(result);
      });
  });
  //https://docs.mongodb.com/manual/reference/operator/update/positional/
  //delete a service category
  app.patch("/delete-category", (req, res) => {
    serviceCollection
      .updateOne(
        { _id: ObjectId("607976addc7d4c244852d668") },
        {
          $pull: {
            category: { categoryName: "mobile", price: 33 },
          },
        },
        { multi: true }
      )
      .then((result) =>
        console.log("deleted this catagory successfully sagar")
      );
  });
  // add an order to the db
  app.post("/book-service", (req, res) => {
    serviceBookings
      .insertOne({
        name: "sagar",
        userId: "6079811009651f2b484ad140",
        email: "sagar@gmail.com",
        serviceTitle: "commercial service",
        category: "Lock Repairs",
        price: 23,
        date: new Date(),
        status: "pending",
      })
      .then((result) => res.send({ message: "a new booking added to the db" }));
  });
  // update service delivery status
  app.patch("/update-order-status", (req, res) => {
    serviceBookings
      .updateOne(
        { _id: ObjectId("60798414276e0c3678693dec") },
        {
          $set: {
            status: "on going",
          },
        }
      )
      .then((result) => {
        res.send("delivery status updated successfully");
      });
  });

  // get all bookings
  app.get("/get-all-bookings", (req, res) => {
    serviceBookings.find().toArray((error, documents) => res.send(documents));
  });
  //get all bookings of an user
  app.get("/get-user-bookings/:email", (req, res) => {
    const email = req.params.email;
    serviceBookings
      .find({
        email,
      })
      .toArray((err, document) => {
        res.send(document);
      });
  });
  //get a service based on id

  app.get("/getService/:id", (req, res) => {
    const id = req.params.id;
    serviceCollection
      .findOne({
        _id: ObjectId(id),
      })
      .then((result) => res.send(result));
  });
  // post a user review

  app.post("/post-review", (req, res) => {
    console.log(req.body);
    userReviews
      .insertOne({
        name: "sagar",
        email: "sagar@gmail.com",
        image: "",
        reviewText: "this is a good service",
      })
      .then((result) => res.send({ message: "user added to the db" }));
  });
  console.log("connected to db");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
