const mongoose = require("mongoose");
const ActivitySchema = new mongoose.Schema(
  {
    activityName: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    studentClass: { type: String, required: true },
    conductedBy: { type: String, required: true },
    fee: { type: Number, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Activities", ActivitySchema);
