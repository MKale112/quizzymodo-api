const mongoose = require("mongoose");
const crypto = require("crypto");
const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `Please add a name`],
  },
  email: {
    type: String,
    required: [true, `Please add an email`],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      `Please add a valid email`,
    ],
  },
  role: {
    type: String,
    enum: [`user`, `publisher`],
    default: `user`,
  },
  password: {
    type: String,
    required: [true, `Please add a password`],
    minlength: 6,
    select: false, //Dont show it in postman
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//Before save encrypt password using bycrpt
UserSchema.pre(`save`, async function (next) {
  //Problem with forgotten password it doesnt have anything to encrypt so skip it
  if (!this.isModified(`password`)) {
    next();
  }
  const salt = await bycrpt.genSalt(10);
  this.password = await bycrpt.hash(this.password, salt);
});

//Used for create token but on user himself(not static)
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//Compare entered špassword and saved one
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bycrpt.compare(enteredPassword, this.password);
};

//Used for generating and hasking reset token
UserSchema.methods.getResetPasswordToken = function () {
  //Generate token
  const resetToken = crypto.randomBytes(20).toString(`hex`);

  //Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash(`sha256`)
    .update(resetToken)
    .digest(`hex`);

  //Set expire date
  this.resetPasswordExpire = Date.now() + 20 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model(`User`, UserSchema);
