const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Quizes = require("../models/Quizes");

//Get all quizes
exports.getQuizes = asyncHandler(async (req, res, next) => {
  const quizes = await Quizes.find();
  res.status(200).json({ success: true, count: quizes.length, data: quizes });
});

//Get single quiz
exports.getQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quizes.findById(req.params.id);
  if (!quiz) {
    return next(
      new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: quiz });
});

//Add quiz
exports.addQuiz = asyncHandler(async (req, res, next) => {
  req.body.user = req.user;
  console.log(req.body.user);
  const quiz = await Quizes.create(req.body);
  res.status(201).json({
    success: true,
    data: quiz,
  });
});

//Delete quiz
exports.deleteQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quizes.findById(req.params.id);
  if (!quiz) {
    return next(
      new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404)
    );
  }

  //make sure the person owns the quiz
  if (quiz.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} not authorized to remove quiz`,
        401
      )
    );
  }
  quiz.remove();
  res.status(200).json({ success: true, data: {} });
});

//Update quiz
exports.updateQuiz = asyncHandler(async (req, res, next) => {
  let quiz = await Quizes.findById(req.params.id);

  //if quiz does not exist
  if (!quiz) {
    return next(
      new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404)
    );
  }
  console.log(req.body);
  quiz = await Quizes.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: quiz });
});
