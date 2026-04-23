const express = require("express");
const router = express.Router();
const Claim = require("../models/Claim");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const Application = require("../models/Application");

// file memory में रखेंगे (ML के लिए best)


// ✅ ONLY ONE STORAGE (disk)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});



const upload = multer({ storage });
// 🔥 FINAL UPLOAD ROUTE
router.post("/upload", upload.single("file"), async (req, res) => {

  console.log("🔥 API HIT");

  if (!req.file) {
    return res.status(400).json({ message: "No file received" });
  }

  try {
    const formData = new FormData();

    const fs = require("fs");

formData.append("file", fs.createReadStream(req.file.path));

    console.log("📤 Sending to ML API...");

    const response = await axios.post(
      "http://127.0.0.1:5001/predict",
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    console.log("🤖 ML RESPONSE:", response.data);

    // ✅ FINAL OUTPUT (frontend को यही चाहिए)
    res.json({
      result: response.data.result
    });

  } catch (err) {
    console.log("❌ ERROR:", err.message);
    res.status(500).json({ error: "ML API failed" });
  }
});

// ================= CLAIM =================



router.post("/claim", async (req, res) => {
    try {
        const newClaim = new Claim(req.body);
        await newClaim.save();

        res.json({ message: "Claim saved in DB" });

    } catch (err) {
        res.status(500).json({ error: "DB Error" });
    }
});

router.post("/create", upload.single("damage_image"), async (req, res) => {

  try {

    // ✅ UNIQUE ID GENERATE
    let appId;
    let exists = true;

    while (exists) {
      appId = Math.floor(100000 + Math.random() * 900000);
      const check = await Application.findOne({ applicationId: appId });
      if (!check) exists = false;
    }

    const app = new Application({

      applicationId: appId,

      farmerId: req.body.farmerId,

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

      // ✅ FIX
      sum_insured: Number(req.body.sum_insured),

      // ✅ SAFE FILE
      image: req.file ? req.file.filename : ""

    });

    await app.save();

    res.json({ msg: "✅ Saved", id: app._id });

  } catch (err) {
    console.log("❌ ERROR:", err);
    res.status(500).json({ error: "Save failed", details: err.message });
  }

});
router.get("/status", async (req, res) => {
  try {
    const data = await Application.find();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 🔥 PATWARI VERIFY
router.post("/patwari/:id", async (req, res) => {

  try {
    console.log("🔥 ID:", req.params.id);
    console.log("🔥 BODY:", req.body);

    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ msg: "Not found" });

    app.patwariStatus = req.body.status;
    app.patwariNotes = req.body.notes || "";
    app.actualYield = Number(req.body.yield) || 0;

    await app.save();

    res.json({ msg: "Updated", data: app });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Update failed" });
  }

});
// 🔥 Upload survey image (Patwari)
router.post("/upload-survey/:id", upload.single("image"), async (req, res) => {

  try {

    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ msg: "Not found" });

    app.surveyImage = req.file.filename;
    await app.save();

    res.json({ msg: "Uploaded", filename: req.file.filename });

  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }

});

// 🔥 GET ALL CLAIMS (Insurance Dashboard)
// 🔥 INSURANCE DASHBOARD DATA (ONLY PATWARI APPROVED)
router.get("/insurance", async (req, res) => {
  try {

    const data = await Application.find({
      patwariStatus: { $regex: /^approved$/i } // 🔥 FIX
    });

    console.log("🔥 INSURANCE DATA:", data); // DEBUG

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/insurance/:id", async (req, res) => {
  try {

    await Application.findByIdAndUpdate(req.params.id, {
      insuranceStatus: req.body.status
    });

    res.json({ msg: "Insurance Updated" });

  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});


// 🔥 BANK DASHBOARD DATA (ONLY INSURANCE APPROVED)
router.get("/bank", async (req, res) => {
  try {
    const data = await Application.find({
      insuranceStatus: "Approved"
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔥 GET SINGLE CLAIM (BANK VIEW)
router.get("/bank/:id", async (req, res) => {
  try {
    const data = await Application.findById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔥 VERIFY (ACCOUNT / AADHAAR / DBT)
router.post("/bank/verify/:id", async (req, res) => {
  try {

    const update = {};

    if (req.body.type === "account") update.accountVerified = "Verified";
    if (req.body.type === "aadhaar") update.aadhaarVerified = "Verified";
    if (req.body.type === "dbt") update.dbtStatus = "Eligible";

    await Application.findByIdAndUpdate(req.params.id, update);

    res.json({ msg: "Verified" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔥 APPROVE / REJECT (BANK)
router.post("/bank/status/:id", async (req, res) => {
  try {

    await Application.findByIdAndUpdate(req.params.id, {
      bankStatus: req.body.status
    });

    res.json({ msg: "Bank Status Updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/bank/:id", async (req, res) => {
  await Application.findByIdAndUpdate(req.params.id, {
    bankStatus: req.body.status
  });
  res.json({ msg: "Bank updated" });
});
router.post("/pay/:id", async (req, res) => {

  console.log("BODY:", req.body); // 👈 debug

  const { fromAccount, toAccount, amount } = req.body || {};

  if(!fromAccount || !toAccount || !amount){
    return res.status(400).json({ msg: "Missing data ❌" });
  }

  const transactionId = "TXN" + Date.now();

  await Application.findByIdAndUpdate(req.params.id, {
    bankStatus: "Paid",
    transactionId,
    paymentDate: new Date(),
    amount
  });

  res.json({
    msg: "Payment done",
    transactionId,
    fromAccount,
    toAccount,
    amount,
    date: new Date()
  });

});
router.get("/transactions", async (req, res) => {

  const data = await Application.find({
    bankStatus: "Paid"
  });

  res.json(data);

});
// 🔥 GET SINGLE APPLICATION (Verify page ke liye)
router.get("/:id", async (req, res) => {
  try {
    const data = await Application.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ msg: "Not found" });
    }

    res.json(data);

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;