const express = require("express");
const router = express.Router();
const Transport = require("../schemas/TransportSchema");
const Student = require("../schemas/StudentAdmissionSchema");
router.post("/addTransport", async (req, res) => {
  try {
    const transport = new Transport(req.body);
    await transport.save();
    res.status(201).json({ status: "PASS", transport });
  } catch (error) {
    res.status(400).json({ status: "FAIL", message: error.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const transports = await Transport.find().select("-__v");
    res.status(200).json({ count: transports.length, transports });
  } catch (error) {
    res.status(500).json({ status: "FAIL", message: error.message });
  }
});
router.get("/transports/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const transport = await Transport.findById(id).select("-__v");
    if (!transport)
      return res
        .status(404)
        .json({ status: "FAIL", message: "Vehicle not found" });
    res.status(200).json({ status: "PASS", transport });
  } catch (error) {
    res.status(500).json({ status: "FAIL", message: error.message });
  }
});
router.get("/transports/number/:vehicleNumber", async (req, res) => {
  try {
    const { vehicleNumber } = req.params;
    const transport = await Transport.findOne({ vehicleNumber }).select("-__v");
    if (!transport)
      return res
        .status(404)
        .json({ status: "FAIL", message: "Vehicle not found" });
    res.status(200).json({ status: "PASS", transport });
  } catch (error) {
    res.status(500).json({ status: "FAIL", message: error.message });
  }
});
router.put("/transports/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedVehicle = await Transport.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatedVehicle)
      return res
        .status(404)
        .json({ status: "FAIL", message: "Vehicle not found" });
    res.status(200).json({
      status: "PASS",
      message: "Vehicle updated",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    res.status(400).json({ status: "FAIL", message: error.message });
  }
});
router.delete("/transports/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVehicle = await Transport.findByIdAndDelete(id);
    if (!deletedVehicle)
      return res
        .status(404)
        .json({ status: "FAIL", message: "Vehicle not found" });
    res
      .status(200)
      .json({ status: "PASS", message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "FAIL", message: error.message });
  }
});
router.post("/transports/assign-student", async (req, res) => {
  const { studentId, vehicleNumber } = req.body;
  if (!studentId || !vehicleNumber)
    return res.status(400).json({ status: "FAIL", message: "Missing fields" });
  try {
    const student = await Student.findById(studentId);
    if (!student)
      return res
        .status(404)
        .json({ status: "FAIL", message: "Student not found" });
    const vehicle = await Transport.findOne({ vehicleNumber });
    if (!vehicle)
      return res
        .status(404)
        .json({ status: "FAIL", message: "Vehicle not found" });
    const studentCount = await Student.countDocuments({
      transportVehicle: vehicle.vehicleNumber,
    });
    const capacityMap = {
      small: 15,
      medium: 30,
      large: 40,
    };
    if (studentCount >= capacityMap[vehicle.size]) {
      return res
        .status(400)
        .json({ status: "FAIL", message: "Vehicle at full capacity!" });
    }
    student.transportVehicle = vehicle.vehicleNumber;
    await student.save();
    return res.json({ status: "PASS", message: "Assigned successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "FAIL", message: "Server error" });
  }
});
router.get("/transports/students/:vehicleNumber", async (req, res) => {
  try {
    const { vehicleNumber } = req.params;
    const students = await Student.find({
      transportVehicle: vehicleNumber,
    }).select("-__v");
    if (students.length === 0) {
      return res.status(404).json({
        status: "FAIL",
        message: "No students found for this vehicle",
      });
    }
    return res.status(200).json({
      status: "PASS",
      count: students.length,
      students,
    });
  } catch (err) {
    console.error("Error fetching students by vehicle:", err.message);
    return res.status(500).json({ status: "FAIL", message: "Server error" });
  }
});
router.get("/report/:className", async (req, res) => {
  const { className } = req.params;
  try {
    const students = await Student.find({
      className,
      transportVehicle: { $exists: true, $ne: null },
    });
    if (!students.length) {
      return res.json({ status: "PASS", vehicles: [] });
    }
    const vehicleNumbers = [
      ...new Set(students.map((s) => s.transportVehicle)),
    ];
    const vehicles = await Transport.find({
      vehicleNumber: { $in: vehicleNumbers },
    });
    const report = vehicles.map((vehicle) => {
      const studentsInVehicle = students.filter(
        (s) => s.transportVehicle === vehicle.vehicleNumber
      );
      return {
        vehicleNumber: vehicle.vehicleNumber,
        driverName: vehicle.driverName,
        size: vehicle.size,
        totalStudents: studentsInVehicle.length,
        students: studentsInVehicle.map((s) => ({
          id: s._id,
          name: s.studentName,
          className: s.className,
        })),
      };
    });
    res.json({ status: "PASS", report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "FAIL", message: "Server error" });
  }
});
module.exports = router;
