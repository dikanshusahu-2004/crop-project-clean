const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const multer = require("multer");

// Image Upload Config
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// Create Application
router.post("/create", async (req, res) => {
    const { farmerId, crop, location } = req.body;

    const app = new Application({
        farmerId,
        crop,
        location
    });

    await app.save();

    res.json({ message: "Application created", app });
});

// Upload Image
router.post("/upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        console.log("File received:", req.file.originalname);

        res.json({ damage: true }); // testing
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get Applications
router.get("/status/:farmerId", async (req, res) => {
    const apps = await Application.find({ farmerId: req.params.farmerId });
    res.json(apps);
});

module.exports = router;

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

// Upload + AI Check
router.post("/upload/:id", upload.single("image"), async (req, res) => {
    try {
        // Send image to AI model
        const formData = new FormData();
        formData.append("image", fs.createReadStream(req.file.path));

        const aiRes = await axios.post("http://localhost:5001/predict", formData, {
            headers: formData.getHeaders()
        });

        const { damage, confidence } = aiRes.data;

        const app = await Application.findById(req.params.id);

        if (!damage) {
            return res.json({
                message: "No crop damage detected. Application not allowed.",
                damage: false
            });
        }

        // Save image + allow
        app.image = req.file.filename;
        app.status = "Pending (Patwari Verification)";
        await app.save();

        res.json({
            message: "Damage detected. Application submitted.",
            damage: true,
            confidence
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error processing image" });
    }
});

const mongoose = require("mongoose");

const appSchema = new mongoose.Schema({

  // Farmer
  name: String,
  mobile: String,
  aadhaar: String,
  village: String,
  district: String,

  // Land
  khasra: String,
  land_area: String,

  // Crop
  crop_name: String,
  season: String,
  damage_type: String,

  // Insurance
  policy_number: String,
  sum_insured: Number,

  // Bank
  bank_name: String,
  account_number: String,
  ifsc_code: String,

  // Images
  image: String,
  surveyImage: String,

  // 🔥 PATWARI
  patwariStatus: { type: String, default: "Pending" },
  patwariNotes: { type: String, default: "" },
  actualYield: { type: Number, default: 0 },

  // Insurance
  insuranceStatus: { type: String, default: "Pending" },

  // Bank
  bankStatus: { type: String, default: "Pending" }

});

module.exports = mongoose.model("Application", appSchema);
const applicationSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  aadhaar: String,
  khasra: String,
  land_area: String,
  village: String,
  district: String,
  crop_name: String,
  sowing_date: String,
  season: String,
  damage_type: String,
  incident_date: String,
  bank_name: String,
  account_number: String,
  ifsc_code: String,
  policy_number: String,
  sum_insured: Number,
  image: String,

  patwariStatus: { type: String, default: "Pending" },
  insuranceStatus: { type: String, default: "Pending" },
  bankStatus: { type: String, default: "Pending" }
});

module.exports = mongoose.model("Application", applicationSchema);
