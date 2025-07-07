const express = require("express");
const router = express.Router();
const NewAdmission = require("../schemas/StudentAdmissionSchema");
const Transport = require("../schemas/TransportSchema");
const Activity = require("../schemas/ActivitySchema");
const FeePayment = require("../schemas/FeeSchema");
router.get("/students", async (req, res) => {
  try {
    const students = await NewAdmission.find()
      .select("-__v")
      .populate("enrolledActivities")
      .populate("feePayments");
    res.status(200).json({
      count: students.length,
      students,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch students",
      error: err.message,
    });
  }
});
router.get("/student/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const student = await NewAdmission.findById(id)
      .select("-__v")
      .populate("enrolledActivities")
      .populate("feePayments");
    if (!student)
      return res
        .status(404)
        .json({ status: "FAIL", message: "Student not found" });
    res.status(200).json({ status: "PASS", student });
  } catch (err) {
    res.status(500).json({
      status: "FAIL",
      message: "Server error",
      error: err.message,
    });
  }
});
router.get("/student", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({
        status: "FAIL",
        message: "Student name is required in query params",
      });
    }
    const student = await NewAdmission.findOne({
      studentName: { $regex: new RegExp(`^${name}$`, "i") },
    })
      .select("-__v")
      .populate("enrolledActivities")
      .populate("feePayments");
    if (!student) {
      return res.status(404).json({
        status: "FAIL",
        message: "Student not found",
      });
    }
    res.status(200).json({ status: "PASS", student });
  } catch (err) {
    console.error("Error fetching student:", err.message);
    res.status(500).json({
      status: "FAIL",
      message: "Server error while fetching student",
    });
  }
});
router.post("/newAdmission", async (req, res) => {
  try {
    const {
      studentName,
      fatherName,
      motherName,
      mobileNumber,
      fathermobileNumber,
      aadharNumber,
      className,
      sectionName,
      dateofbirth,
      dateofadmission,
      address,
      needTransport,
    } = req.body;
    const requiredFields = {
      studentName,
      fatherName,
      mobileNumber,
      fathermobileNumber,
      className,
      sectionName,
      dateofbirth,
      dateofadmission,
      address,
      aadharNumber,
      needTransport,
    };
    const missingFields = Object.entries(requiredFields).filter(
      ([key, value]) => !value && value !== 0
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "FAIL",
        message: `Missing fields: ${missingFields
          .map(([key]) => key)
          .join(", ")}`,
      });
    }
    if (!/^[0-9]{10}$/.test(mobileNumber)) {
      return res.status(400).json({
        status: "FAIL",
        message: "Student mobile number must be 10 digits",
      });
    }
    if (!/^[0-9]{10}$/.test(fathermobileNumber)) {
      return res.status(400).json({
        status: "FAIL",
        message: "Father mobile number must be 10 digits",
      });
    }
    const dob = new Date(dateofbirth);
    const doa = new Date(dateofadmission);
    if (isNaN(dob.getTime()) || isNaN(doa.getTime())) {
      return res.status(400).json({
        status: "FAIL",
        message: "Invalid date format",
      });
    }
    const existingStudent = await NewAdmission.findOne({
      studentName,
      dateofbirth,
    });
    if (existingStudent) {
      return res.status(409).json({
        status: "FAIL",
        message: "Student already exists",
      });
    }
    const admissionYear = doa.getFullYear();
    const baseRollPrefix = `${admissionYear}${className}${sectionName}`;
    const lastStudent = await NewAdmission.findOne({
      rollNumber: new RegExp(`^${baseRollPrefix}\\d{3}$`),
    }).sort({ rollNumber: -1 });
    let nextSeq = 1;
    if (lastStudent?.rollNumber) {
      const seqPart = lastStudent.rollNumber.slice(-3);
      const seq = parseInt(seqPart, 10);
      if (!isNaN(seq)) nextSeq = seq + 1;
    }
    const rollNumber = `${baseRollPrefix}${String(nextSeq).padStart(3, "0")}`;
    const newStudent = new NewAdmission({
      ...req.body,
      rollNumber,
    });
    await newStudent.save();
    return res.status(201).json({
      status: "PASS",
      message: "Admission successful",
      student: newStudent,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "FAIL",
      message: "Failed to create admission",
    });
  }
});
router.put("/student/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedStudent = await NewAdmission.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedStudent) {
      return res
        .status(404)
        .json({ status: "FAIL", message: "Student not found" });
    }
    return res.status(200).json({
      status: "PASS",
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (err) {
    console.error("Error updating student:", err.message);
    return res.status(500).json({ status: "FAIL", message: "Server error" });
  }
});
router.delete("/student/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await NewAdmission.findByIdAndDelete(id);
    if (!deletedStudent) {
      return res
        .status(404)
        .json({ status: "FAIL", message: "Student not found" });
    }
    await FeePayment.deleteMany({ student: id });
    return res.status(200).json({
      status: "PASS",
      message: "Student deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting student:", err.message);
    return res.status(500).json({ status: "FAIL", message: "Server error" });
  }
});
router.post("/assigntransport", async (req, res) => {
  const { studentId, vehicleNumber } = req.body;
  if (!studentId || !vehicleNumber)
    return res.status(400).json({ status: "FAIL", message: "Missing fields" });
  try {
    const student = await NewAdmission.findById(studentId);
    if (!student)
      return res
        .status(404)
        .json({ status: "FAIL", message: "Student not found" });
    const vehicle = await Transport.findOne({ vehicleNumber });
    if (!vehicle)
      return res
        .status(404)
        .json({ status: "FAIL", message: "Vehicle not found" });
    const studentCount = await NewAdmission.countDocuments({
      transportVehicle: vehicle.vehicleNumber,
    });
    const capacityMap = {
      small: 15,
      medium: 30,
      large: 40,
    };
    if (studentCount >= capacityMap[vehicle.size]) {
      return res.status(400).json({
        status: "FAIL",
        message: "Vehicle at full capacity!",
      });
    }
    student.transportVehicle = vehicle.vehicleNumber;
    await student.save();
    await Transport.updateOne(
      { vehicleNumber },
      { $addToSet: { assignedStudentIds: student._id } }
    );
    return res.json({ status: "PASS", message: "Assigned successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "FAIL", message: "Server error" });
  }
});
router.get("/students/:vehicleNumber", async (req, res) => {
  const { vehicleNumber } = req.params;
  try {
    const vehicle = await Transport.findOne({ vehicleNumber });
    if (!vehicle) {
      return res
        .status(404)
        .json({ status: "FAIL", message: "Vehicle not found" });
    }
    const students = await NewAdmission.find({
      _id: { $in: vehicle.assignedStudentIds },
    });
    return res.status(200).json({
      status: "PASS",
      vehicle: {
        vehicleNumber: vehicle.vehicleNumber,
        driverName: vehicle.driverName,
        size: vehicle.size,
        totalStudents: students.length,
      },
      students,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "FAIL", message: "Server error" });
  }
});
router.post("/enrollactivity", async (req, res) => {
  const { studentId, activityId } = req.body;
  if (!studentId || !activityId)
    return res.status(400).json({ status: "FAIL", message: "Missing fields" });
  try {
    const student = await NewAdmission.findById(studentId);
    const activity = await Activity.findById(activityId);
    if (!student || !activity)
      return res.status(404).json({
        status: "FAIL",
        message: "Student or Activity not found",
      });
    if (!student.enrolledActivities.includes(activity._id)) {
      student.enrolledActivities.push(activity._id);
      await student.save();
    }
    return res.status(200).json({
      status: "PASS",
      message: "Enrolled successfully!",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "FAIL", message: "Server error" });
  }
});
router.get("/student/report/:rollNumber", async (req, res) => {
  const { rollNumber } = req.params;
  try {
    const student = await NewAdmission.findOne({ rollNumber })
      .populate("enrolledActivities")
      .populate("feePayments");
    if (!student)
      return res.status(404).json({
        status: "FAIL",
        message: "Student not found",
      });
    const report = {
      studentName: student.studentName,
      rollNumber: student.rollNumber,
      className: `${student.className} - ${student.sectionName}`,
      activities: [],
    };
    student.enrolledActivities.forEach((act) => {
      const feeRecord = student.feePayments.find(
        (fp) => fp.activity === act.activityName
      );
      report.activities.push({
        name: act.activityName,
        fee: act.fee,
        paid: feeRecord?.paidAmount || 0,
        balance: feeRecord?.balance || act.fee,
        status: feeRecord?.status || "Not Paid",
        dueDate: feeRecord?.dueDate
          ? new Date(feeRecord.dueDate).toLocaleDateString()
          : "-",
      });
    });
    return res.status(200).json({
      status: "PASS",
      report,
    });
  } catch (err) {
    console.error("Error generating report:", err.message);
    return res.status(500).json({ status: "FAIL", message: "Server error" });
  }
});
module.exports = router;
