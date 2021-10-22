const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//LOAD env variables (hidden variables)
dotenv.config({ path: "./config/config.env" });
console.log(process.env.NODE_ENV);
//Connect to database
connectDB();

//Get routing files
const quizes = require("./routes/quizes");
const auth = require("./routes/auth");
//Create app
const app = express();

//Use body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

//Dev logg middleware
if (process.NODE_ENV === "development") {
  app.use(morgan(`dev`));
}

//Mount routers
app.use("/v1", quizes);
app.use("/v1/auth", auth);

//Error handler
app.use(errorHandler);
//define PORT
const PORT = process.env.PORT || 5000;

//Start server
const server = app.listen(
  PORT,
  console.log(
    `server is running in ${process.env.NODE_ENV} mode on ${PORT}`.yellow.bold
  )
);

//handle unhadled promise rejection
process.on("unhandledRejection", (err, message) => {
  console.log(`Error:${err.message}`.red);
  server.close(() => process.exit(1));
});
