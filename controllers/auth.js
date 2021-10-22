const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../utils/sendMail");

//Create user POST /v1/auth/register
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  // if (name === "") {
  //   return next(new ErrorResponse(`Please add username`, 401));
  // }
  //Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

//Login user POST /v1/auth/login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse(`Please provide an email and password`, 400));
  }

  //Check for user
  const user = await User.findOne({ email }).select(`+password`);

  if (!user) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  //Ckeck if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse(`Wrong password`, 401));
  }

  sendTokenResponse(user, 200, res);
});

//Get user POST /v1/auth/me
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
});

//Logout user GET /v1/auth/logout
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie(`token`, `none`, {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

//Update details PUT /v1/auth/updatedetails
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = { name: req.body.name, email: req.body.email };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

//Update password PUT /api/v1/auth/updatepassword
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select(`+password`);

  //Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse(`Password is incorrect`, 401));
  }

  user.password = req.body.newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

//Forgot password POST /v1/auth/forgotpassword
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse(`There is no user with that email`, 404));
  }

  //Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //Create reset url
  // const resetUrl = `${req.protocol}://${req.get(
  //   `host`
  // )}/v1/auth/resetPassword/${resetToken}`;
  const resetUrl = `http://localhost:3000/resetpassword/${resetToken}`;
  console.log(resetToken);
  const message = `You are recieving mail beacuse you requested a reset of password \n \n Please click ${resetUrl} \n \n Your secret code :${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Password reset token`,
      message,
    });
    res
      .status(200)
      .json({ success: true, data: user, message: `You asked reset` });
  } catch (error) {
    //return reset token and expire to undifined for fail
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse(`Email could not be sent`), 500);
  }
});

//Reset password  PUT /v1/auth/resetpassword/:resettoken
exports.resetPassword = asyncHandler(async (req, res, next) => {
  console.log(req.body.resetToken);
  const resetPasswordToken = crypto
    .createHash(`sha256`)
    .update(req.body.resetToken)
    .digest(`hex`);

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse(`Invalid token`, 400));
  }
  console.log("smile1");
  //Set new password
  user.password = req.body.password; // encrypted before save by model
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  console.log("smile2");
  await user.save();
  console.log("smile3");
  sendTokenResponse(user, 200, res);
});

//Kreiranje jsonwebtokena
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === `production`) {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie(`token`, token, options)
    .json({ success: true, token });
};
