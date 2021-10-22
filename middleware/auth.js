const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

//Middleware to stop unauthorized access
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  console.log(req.headers);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith(`Bearer`)
  ) {
    token = req.headers.authorization.split(` `)[1];
    console.log(token);
  }
  console.log(req.headers);

  if (!token) {
    return next(new ErrorResponse(`Not authorized to access this route`, 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("hej");
    console.log(decoded);
    req.user = await User.findById(decoded.id); //id which is packed with jwt.sign

    next();
  } catch (error) {
    return next(new ErrorResponse(`Not authorized to access this route`, 401));
  }
});

//Only specific roles can access route
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to acces this route`,
          403
        )
      );
    }
  };
};
