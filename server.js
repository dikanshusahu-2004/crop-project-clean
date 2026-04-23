const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();


// ✅ middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect("mongodb+srv://dikanshusahu_db_user:V8nkt4xcTcgwpOPO@cluster0.0ci2izn.mongodb.net/cropDB")

// ✅ routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/app", require("./routes/app"));
app.use("/api/patwari", require("./routes/patwari"));
app.use("/api/insurance", require("./routes/insurance"));
app.use("/api/bank", require("./routes/bank"));


// ✅ uploads (image serve)
app.use("/uploads", express.static("uploads"));


// ✅ server start (Render compatible)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🔥 Server running on port " + PORT);
});