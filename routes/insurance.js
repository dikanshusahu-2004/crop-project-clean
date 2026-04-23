const express = require("express");
const router = express.Router();
const Application = require("../models/Application");

// Get applications verified by Patwari
router.get("/verified", async (req, res) => {
    const apps = await Application.find({
        status: "Verified by Patwari"
    });

    res.json(apps);
});

// Approve by Insurance
router.post("/approve/:id", async (req, res) => {
    const app = await Application.findById(req.params.id);

    app.status = "Approved by Insurance";
    await app.save();

    res.json({ message: "Approved by Insurance" });
});

// Reject by Insurance
router.post("/reject/:id", async (req, res) => {
    const app = await Application.findById(req.params.id);

    app.status = "Rejected by Insurance";
    await app.save();

    res.json({ message: "Rejected by Insurance" });
});

module.exports = router;