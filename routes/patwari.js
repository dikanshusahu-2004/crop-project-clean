const express = require("express");
const router = express.Router();
const Application = require("../models/Application");

// Get all pending applications
router.get("/pending", async (req, res) => {
    const apps = await Application.find({
        status: "Pending (Patwari Verification)"
    });

    res.json(apps);
});

// Approve application
router.post("/approve/:id", async (req, res) => {
    const app = await Application.findById(req.params.id);

    app.status = "Verified by Patwari";
    await app.save();

    res.json({ message: "Application approved by Patwari" });
});

// Reject application
router.post("/reject/:id", async (req, res) => {
    const app = await Application.findById(req.params.id);

    app.status = "Rejected by Patwari";
    await app.save();

    res.json({ message: "Application rejected" });
});

module.exports = router;