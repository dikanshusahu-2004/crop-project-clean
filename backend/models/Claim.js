const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    location: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Claim", claimSchema);