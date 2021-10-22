const express = require("express");
const {
  getQuizes,
  addQuiz,
  deleteQuiz,
  getQuiz,
  updateQuiz,
} = require("../controllers/quizes");

const router = express.Router();

//get middlewares
const { protect } = require("../middleware/auth");

router.route("/").get(getQuizes).post(protect, addQuiz);

router
  .route("/:id")
  .delete(protect, deleteQuiz)
  .get(getQuiz)
  .put(protect, updateQuiz);

module.exports = router;
