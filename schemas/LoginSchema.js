const mongoose = require("mongoose");
const loginSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String, default: "" },
});
module.exports = mongoose.model("Logins", loginSchema);
