const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const FeePayment = require("../schemas/FeeSchema");
const Student = require("../schemas/StudentAdmissionSchema");
const formatDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};
router.post("/payfee", async (req, res) => {
  try {
    const {
      studentName,
      rollNumber,
      className,
      section,
      feeType,
      activity,
      exam,
      transport,
      term,
      totalFee,
      paidAmount,
      dueDate,
    } = req.body;
    // Validate required fields
    if (
      !studentName ||
      !rollNumber ||
      !className ||
      !section ||
      !feeType ||
      !totalFee
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Find student by roll number
    const student = await Student.findOne({ rollNumber });
    if (!student) return res.status(404).json({ error: "Student not found" });
    const newFee = new FeePayment({
      student: student._id,
      studentName,
      rollNumber,
      className,
      section,
      feeType,
      [feeType]: req.body[feeType], // dynamic field: activity/exam/transport/term
      totalFee,
      paidAmount: paidAmount || 0,
      dueDate: new Date(dueDate),
    });
    await newFee.save();
    res.status(201).json(newFee);
  } catch (err) {
    console.error("Error creating fee:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid fee ID" });
  }
  try {
    const updatedFee = await FeePayment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedFee) {
      return res.status(404).json({ error: "Fee record not found" });
    }
    res.json(updatedFee);
  } catch (err) {
    console.error("Error updating fee:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/", async (req, res) => {
  try {
    const fees = await FeePayment.find().sort({ createdAt: -1 });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/pendingfee", async (req, res) => {
  const { feeType, className, section } = req.query;
  const filter = {};
  if (feeType) filter.feeType = feeType;
  if (className) filter.className = className;
  if (section) filter.section = section;
  try {
    const fees = await FeePayment.find(filter).sort({ dueDate: 1 });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/student", async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "Roll number is required" });
  try {
    const student = await Student.findOne({ rollNumber: name });
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({
      studentName: student.studentName,
      className: student.className,
      section: student.sectionName,
    });
  } catch (err) {
    console.error("Student lookup failed:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
