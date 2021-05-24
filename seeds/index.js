//Delete all entries from DB and add 50 random entries
const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti eius molestias maiores ex culpa saepe explicabo minus beatae quaerat! Sit excepturi voluptate impedit, officiis totam quos soluta deleniti nulla et!",
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      author: "60a526080c266c01e0489efe",
      images: [
        {
          url: "https://res.cloudinary.com/nohero/image/upload/v1621667932/YelpCamp/v01j7hfx5xeukdxa6nyv.jpg",
          filename: "YelpCamp/v01j7hfx5xeukdxa6nyv",
        },
        {
          url: "https://res.cloudinary.com/nohero/image/upload/v1621667943/YelpCamp/lw8gihkv2cpvir5idx6i.jpg",
          filename: "YelpCamp/lw8gihkv2cpvir5idx6i",
        },
        {
          url: "https://res.cloudinary.com/nohero/image/upload/v1621667945/YelpCamp/iltqhejl0rslpbg6vomq.jpg",
          filename: "YelpCamp/iltqhejl0rslpbg6vomq",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
