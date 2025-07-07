const express = require("express");
const router = express.Router();
const Logins = require("../schemas/LoginSchema");
router.post("/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
      return res
        .status(400)
        .json({ status: "FAIL", message: "All fields are required" });
    }
    const existingUser = await Logins.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ status: "FAIL", message: "User already exists" });
    }
    const newUser = new Logins({ fullname, email, password });
    await newUser.save();
    res
      .status(201)
      .json({ status: "PASS", message: "Registered successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ status: "FAIL", message: "Server error during registration" });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "FAIL", message: "Email and password required" });
    }
    const user = await Logins.findOne({ email });
    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ status: "FAIL", message: "Invalid credentials" });
    }
    const token = Date.now().toString(); 
    user.token = token;
    await user.save();
    res.status(200).json({
      status: "PASS",
      token: token,
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: "FAIL", message: "Server error during login" });
  }
});
router.get("/users", async (req, res) => {
  try {
    const users = await Logins.find();
    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: err.message });
  }
});
module.exports = router;
