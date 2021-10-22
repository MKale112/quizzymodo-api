const ErrorResponse = require("../utils/errorResponse");

//ovo je middleware za upravljanje errorima
const errorHandler = (err, req, res, next) => {
  //napravi kopiju errora
  let error = { ...err };
  error.message = err.message;
  //Log errora
  console.log(err);
  console.log(err.code);

  //Tipovi errora

  //Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  //Mongoose duplicate key
  if (err.code === 11000) {
    const message = `Duplicate fields`;
    error = new ErrorResponse(message, 400);
    console.log("bok");
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || `Server error` });
};

module.exports = errorHandler;
