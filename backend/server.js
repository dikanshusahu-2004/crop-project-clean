const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();


// ✅ middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://dikanshusahu_db_user:52D4bAdZxN91xEIL@cluster0.abc123.mongodb.net/cropDB?retryWrites=true&w=majority")
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ DB Error:", err));
// ✅ routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/app", require("./routes/app"));
app.use("/api/patwari", require("./routes/patwari"));
app.use("/api/insurance", require("./routes/insurance"));
app.use("/api/bank", require("./routes/bank"));

// ✅ uploads (image serve)
app.use("/uploads", express.static("uploads"));

// routes
app.get("/", (req, res) => {
  res.send("Crop Insurance API Running 🚀");
});

app.get("/api/claim", (req, res) => {
  res.send("Claim API working 🚀");
});
// server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🔥 Server running on port " + PORT);
});