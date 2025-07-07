const mongoose = require("mongoose");
const PaymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: [0, "Payment cannot be negative"],
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  paymentMode: {
    type: String,
    enum: ["Cash", "Card", "UPI", "Bank Transfer", "Other"],
    default: "Cash",
  },
  notes: {
    type: String,
    trim: true,
  },
});
const FeePaymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NewAdmissions",
    required: true,
    index: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  rollNumber: {
    type: String,
    required: true,
    index: true,
  },
  className: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  feeType: {
    type: String,
    enum: ["exam", "activity", "transport", "term"],
    required: true,
    index: true,
  },
  exam: {
    type: String,
    default: null,
  },
  activity: {
    type: String,
    default: null,
  },
  transport: {
    type: String,
    default: null,
  },
  term: {
    type: String,
    default: null,
  },
  totalFee: {
    type: Number,
    required: true,
    min: [0, "Total fee cannot be negative"],
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, "Paid amount cannot be negative"],
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, "Balance cannot be negative"],
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Paid", "Partially Paid", "Overdue"],
    default: "Partially Paid",
  },
  paymentHistory: [PaymentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
FeePaymentSchema.pre("save", function (next) {
  this.balance = Math.max(this.totalFee - this.paidAmount, 0);
  if (this.balance <= 0) {
    this.status = "Paid";
  } else if (new Date() > this.dueDate) {
    this.status = "Overdue";
  } else {
    this.status = "Partially Paid";
  }
  this.updatedAt = Date.now();
  next();
});
module.exports = mongoose.model("FeePayment", FeePaymentSchema);
