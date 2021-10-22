const mongoose = require("mongoose");

const QuizesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `Please add a quiz name`],
    unique: true,
    trim: true,
    maxLength: [100, `Name can not be longer than 100 carachters`],
  },
  description: {
    type: String,
    required: [true, `Please add a description`],
    maxLength: [500, `Description can not be more than 500 carachters`],
  },
  q_and_a: [{ question: String, answers: Array, correct: String }],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: `User`,
    required: true,
  },
});

module.exports = mongoose.model(`Quizes`, QuizesSchema);
