const express = require("express");
const router = express.Router();
const Exam = require("../schemas/ExamSchema");
router.post("/", async (req, res) => {
  try {
    const newExam = new Exam(req.body);
    await newExam.save();
    res.status(201).json(newExam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const ExamList = await Exam.find();
    res.status(200).json(ExamList);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: err.message });
  }
});
module.exports = router;
