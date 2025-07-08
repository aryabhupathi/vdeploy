const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());
dotenv.config();
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));
const db = mongoose.connection;
db.on("error", (error) => console.error("Error in DB connection:", error));
db.on("open", () => console.log("Connected to MongoDB"));
const PORT = process.env.PORT || 1111;
const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
app.use(
  cors({
    origin: allowedOrigin,
    methods: "GET,POST,PUT,PATCH,DELETE",
    credentials: true,
  })
);
const Login = require("./routes/LoginRoute");
app.use("/auth", Login);
const NewAdmission = require("./routes/NewAdmissionRoute");
app.use("/admission", NewAdmission);
const Transport = require("./routes/TransportRoute");
app.use("/transport", Transport);
const Exams = require("./routes/ExamRoute");
app.use("/exam", Exams);
const Activity = require("./routes/ActivityRoute");
app.use("/activity", Activity);
const FeeRoutes = require('./routes/FeeRoutes');
app.use("/fee", FeeRoutes);
app.get("/", (req, res) => {
  res.send("Backend is working!");
});
app.listen(PORT, () => {
  console.log(`Server is live on port ${PORT}`);
});
