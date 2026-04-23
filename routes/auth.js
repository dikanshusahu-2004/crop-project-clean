const express = require("express");
const router = express.Router();
const Farmer = require("../models/Farmer");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, mobile, password } = req.body;

        const existing = await Farmer.findOne({ mobile });
        if (existing) {
            return res.status(400).json({ message: "Mobile already registered" });
        }

        const farmerId = "FARM" + Math.floor(10000 + Math.random() * 90000);

        const user = new Farmer({ name, mobile, password, farmerId });
        await user.save();

        res.json({ message: "Registered successfully", farmerId });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});
// LOGIN (mobile + password)
router.post("/login", async (req, res) => {
    const { mobile, password } = req.body;

    const user = await Farmer.findOne({ mobile });

    if (!user || user.password !== password) {
        return res.status(400).json({ message: "Invalid mobile or password" });
    }

    res.json({ message: "Login successful", user });
});

// upload route
router.post("/upload", upload.single("image"), (req, res) => {
    console.log("Auth upload hit");

    res.json({ message: "Upload working (auth)" });
});



// 🔥 HARD-CODED BANK LOGIN (simple project ke liye)
router.post("/bank-login", (req, res) => {

  const { username, password } = req.body;

  if (username === "bank" && password === "1234") {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }

});

module.exports = router;
module.exports = router;