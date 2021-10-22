const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

//Load env vars
dotenv.config({ path: "./config/config.env" });

//Load model
const Quizes = require("./models/Quizes");
const User = require("./models/User");

//Conenct to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

//Read JSON files
const quizes = JSON.parse(
  fs.readFileSync(`${__dirname}/data/quizes.json`, `utf-8`)
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, `utf-8`)
);

//Import data to mongoDB
const importData = async () => {
  try {
    await Quizes.create(quizes);
    await User.create(users);
    console.log(`Data imported`.green.inverse);
    process.exit(1);
  } catch (error) {
    console.log(error);
  }
};

//Delete data from mongoDb
const deleteData = async () => {
  try {
    console.log("Radi");
    await Quizes.deleteMany();
    await User.deleteMany();
    console.log(`Data destroyed`.red.inverse);
    process.exit(1);
  } catch (error) {
    console.log(error);
  }
};

//What option to choose
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
