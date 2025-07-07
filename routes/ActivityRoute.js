const express = require("express");
const router = express.Router();
const Activity = require("../schemas/ActivitySchema");
router.get("/", async (req, res) => {
  try {
    const activities = await Activity.find();
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});
router.get("/:name", async (req, res) => {
  try {
    const activityName = req.params.name;
    const activity = await Activity.findOne({ activityName });
    if (!activity) {
      return res
        .status(404)
        .json({ error: `Activity "${activityName}" not found` });
    }
    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching activity" });
  }
});
router.post("/", async (req, res) => {
  try {
    const newActivity = new Activity(req.body);
    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
module.exports = router;
