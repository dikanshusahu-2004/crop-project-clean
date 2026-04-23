const express = require("express");
const router = express.Router();
const upload = multer({ dest: "uploads/" });
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");

const Application = require("../models/Application");

// ================= MULTER SETUP =================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ================= UPLOAD + ML DETECTION =================
router.post("/upload", upload.single("file"), async (req, res) => {
  console.log("🔥 API HIT");
  console.log("📁 File:", req.file);

  if (!req.file) {
    return res.status(400).json({ message: "No file received" });
  }

  try {
    const formData = new FormData();

    // ✅ FIX: proper file append
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // ✅ ML API CALL
    const response = await axios.post(
      "http://127.0.0.1:5001/predict",
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 10000 // optional safety
      }
    );

    console.log("🤖 ML RESPONSE:", response.data);

    // ✅ SAFE RESPONSE HANDLE
    const result = response.data?.result || response.data;

    res.json({
      success: true,
      result: result
    });

  } catch (err) {
    console.error("❌ ERROR:", err.message);

    // 🔥 detailed error
    if (err.response) {
      console.error("ML ERROR RESPONSE:", err.response.data);
    }

    res.status(500).json({
      success: false,
      message: "ML API failed"
    });
  }
});

// ================= CREATE APPLICATION =================
router.post("/create", upload.single("damage_image"), async (req, res) => {
  try {
    const app = new Application({
      name: req.body.name,
      mobile: req.body.mobile,
      aadhaar: req.body.aadhaar,
      khasra: req.body.khasra,
      land_area: req.body.land_area,
      village: req.body.village,
      district: req.body.district,
      crop_name: req.body.crop_name,
      sowing_date: req.body.sowing_date,
      season: req.body.season,
      damage_type: req.body.damage_type,
      incident_date: req.body.incident_date,
      bank_name: req.body.bank_name,
      account_number: req.body.account_number,
      ifsc_code: req.body.ifsc_code,
      policy_number: req.body.policy_number,
      sum_insured: req.body.sum_insured,
      image: req.file?.filename   // 👈 image save
    });

    await app.save();

    res.json({ message: "✅ Claim Submitted Successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});
// ================= GET STATUS =================
router.get("/status/:farmerId", async (req, res) => {
  try {
    const apps = await Application.find({
      farmerId: req.params.farmerId
    });

    res.json(apps);

  } catch (err) {
    res.status(500).json({
      message: "Server error"
    });
  }
});

router.get("/status/all", async (req, res) => {
  const apps = await Application.find();
  res.json(apps);
});
module.exports = router;