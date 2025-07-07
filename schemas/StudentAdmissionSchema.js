const mongoose = require("mongoose");
const studentAdmissionSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
    },
    fatherName: {
      type: String,
      required: true,
    },
    motherName: {
      type: String,
    },
    mobileNumber: {
      type: Number,
      required: true,
    },
    fathermobileNumber: {
      type: Number,
      required: true,
    },
    aadharNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
    },
    className: {
      type: String,
      required: true,
    },
    sectionName: {
      type: String,
      required: true,
    },
    dateofbirth: {
      type: Date,
      required: true,
    },
    dateofadmission: {
      type: Date,
      required: true,
    },
    parentOccupation: {
      type: String,
    },
    securityNumber: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    needTransport: {
      type: String,
      required: true,
    },
    transportVehicle: {
      type: String,
      default: null,
    },
    enrolledActivities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activities",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
studentAdmissionSchema.virtual("feePayments", {
  ref: "FeePayment",
  localField: "_id",
  foreignField: "student",
});
studentAdmissionSchema.index({ transportVehicle: 1 });
module.exports = mongoose.model("NewAdmissions", studentAdmissionSchema);
