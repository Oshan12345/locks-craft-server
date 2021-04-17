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
  //add a user to db (used)
  app.post("/add-user", (req, res) => {
    console.log(req.body);
    const { name, email } = req.body;
    userCollection.findOne({ email }).then((response) => {
      console.log(response);
      if (response) {
        return res.send({ message: "there is already a user with this email" });
      }
      if (!response) {
        userCollection
          .insertOne({
            name,
            email,
            role: "User",
          })
          .then((result) =>
            res.send({ message: "user has been added to the db" })
          );
      }
    });
  });
  //update user role(used)
  app.patch("/update-role", (req, res) => {
    console.log(req.body);
    const { email, role } = req.body;
    userCollection
      .updateOne(
        { email },
        {
          $set: {
            role,
          },
        }
      )
      .then((result) => {
        res.send("user role updated successfully");
      });
  });
  //get all admin list (used)
  app.get("/all-admin-list", (req, res) => {
    userCollection.find({ role: "admin" }).toArray((err, doc) => {
      res.send(doc);
    });
  });
  //get all service list (used)
  app.get("/all-service", (req, res) => {
    serviceCollection.find().toArray((err, doc) => {
      res.send(doc);
    });
  });
  //adding a service to db (used)
  app.post("/add-new-service", (req, res) => {
    console.log(req.body);
    const { title, categoryName, price, description, image } = req.body;
    serviceCollection
      .insertOne({
        title,
        category: [
          {
            categoryName,
            price,
          },
        ],
        image,
        description,
      })
      .then(function (result) {
        console.log(result.insertedCount);
        res.send({ message: "service has been successfully inserted to db" });
      });
  });
  // add a new category to an existing service (used)
  app.patch("/add-new-category/:serviceId", (req, res) => {
    const serviceId = req.params.serviceId;
    console.log("ddddd----------", serviceId);
    console.log(req.body);
    const category = req.body;
    console.log("ss==============", category);
    serviceCollection
      .updateOne(
        { _id: ObjectId(serviceId) },
        {
          $push: {
            category,
          },
        }
      )
      .then((result) => {
        console.log(result);
      });
  });
  //https://docs.mongodb.com/manual/reference/operator/update/positional/
  //delete a service category
  app.patch("/delete-category/:serviceId", (req, res) => {
    const serviceId = req.params.serviceId;
    const category = req.body;
    console.log(category);
    serviceCollection
      .updateOne(
        { _id: ObjectId(serviceId) },
        {
          $pull: {
            category,
          },
        },
        { multi: true }
      )
      .then((result) =>
        console.log("deleted this catagory successfully sagar")
      );
  });
  //update a service
  app.patch("/update-service/:serviceId", (req, res) => {
    const id = req.params.serviceId;
    const { title, category, image, description, _id } = req.body;
    // console.log("divya--------------", id, updateInfo);

    serviceCollection
      .updateOne(
        { _id: ObjectId(id) },
        {
          $set: { title, category, image, description },
        }
      )
      .then((result) => res.send({ message: "updated successfully", result }));
  });
  //delete a service(used)
  app.delete("/delete-service/:serviceId", (req, res) => {
    serviceCollection
      .deleteOne({
        _id: ObjectId(req.params.serviceId),
      })
      .then(function (result) {
        // process result
        res.send({
          message: "Deleted successfully",
          deleted: result.deletedCount > 0,
        });
      });
  });
  // add an booking order to the db(used)
  app.post("/book-service", (req, res) => {
    console.log(req.body);
    serviceBookings
      .insertOne({
        ...req.body,
        status: "pending",
      })
      .then((result) => res.send({ message: "a new booking added to the db" }));
  });
  // update service delivery status (used)
  app.patch("/update-order-status/:postId", (req, res) => {
    const id = req.params.postId;

    const status = req.body.status;
    serviceBookings
      .updateOne(
        { _id: ObjectId(id) },
        {
          $set: {
            status,
          },
        }
      )
      .then((result) => {
        res.send({
          message: "delivery status updated successfully",
          modified: result.modifiedCount > 0,
        });
      });
  });

  // get all bookings(used)
  app.get("/get-all-bookings", (req, res) => {
    serviceBookings.find().toArray((error, documents) => res.send(documents));
  });
  //get all bookings of an user(used)
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
  //get a service based on id (used)

  app.get("/getService/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);
    serviceCollection
      .findOne({
        _id: ObjectId(id),
      })
      .then((result) => res.send(result));
  });
  // post a user review (used)

  app.post("/post-review", (req, res) => {
    console.log(req.body);
    userReviews
      .insertOne(req.body)
      .then((result) =>
        res.send({ message: "user review has been added to the db" })
      );
  });

  //get all reviews (used)

  app.get("/get-all-reviews", (req, res) => {
    userReviews.find().toArray((err, document) => {
      return res.send(document);
    });
  });
  console.log("connected to db");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
