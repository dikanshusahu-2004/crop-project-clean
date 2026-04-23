const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    password: String,
    farmerId: String
});

module.exports = mongoose.model("Farmer", farmerSchema);