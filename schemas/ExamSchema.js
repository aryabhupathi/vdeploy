const mongoose = require("mongoose");
const ExamSchema = new mongoose.Schema(
  {
    examType: { type: String, required: true },
    examName: { type: String, required: true },
    date: { type: Date, required: true },
    fee: { type: Number, required: true },
    classConductedFor: { type: String, required: true },
    reportingOfficer: { type: String, required: true },
    examSubject: { type: String, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Exams", ExamSchema);
