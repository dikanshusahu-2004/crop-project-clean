const express = require("express");
const router = express.Router();
const Application = require("../models/Application");

// Get Insurance Approved Applications
router.get("/approved", async (req, res) => {
    const apps = await Application.find({
        status: "Approved by Insurance"
    });

    res.json(apps);
});

// Final Payment Approval
router.post("/pay/:id", async (req, res) => {
    const app = await Application.findById(req.params.id);

    app.status = "Payment Completed";
    await app.save();

    res.json({ message: "Payment Successful" });
});

module.exports = router;