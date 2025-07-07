const mongoose = require("mongoose");
const transportNewSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    driverName: {
      type: String,
      required: true,
      trim: true,
    },
    driverMobileNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"],
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    routeNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    size: {
      type: String,
      required: true,
      enum: {
        values: ["small", "medium", "large"],
        message: "{VALUE} is not supported. Use small, medium or large.",
      },
    },
    fee: {
      type: Number,
      required: false, // optional; set by pre-hook
    },
    assignedStudentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewAdmissions",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
transportNewSchema.virtual("studentCapacity").get(function () {
  const capacities = {
    small: 15,
    medium: 30,
    large: 40,
  };
  return capacities[this.size] || 0;
});
transportNewSchema.virtual("currentStudentCount", {
  ref: "NewAdmissions",
  localField: "vehicleNumber",
  foreignField: "transportVehicle",
  justOne: false,
  count: true,
});
transportNewSchema.methods.getAssignedStudents = async function () {
  const students = await mongoose.model("NewAdmissions").find({
    transportVehicle: this.vehicleNumber,
  });
  return students;
};
transportNewSchema.pre("save", function (next) {
  const feeStructure = {
    small: 500,
    medium: 800,
    large: 1000,
  };
  this.fee = feeStructure[this.size] || 0;
  next();
});
module.exports = mongoose.model("TransportNew", transportNewSchema);
