const mongoose = require("mongoose");

const appSchema = new mongoose.Schema({

  // ✅ ADD THIS (VERY IMPORTANT)
  applicationId: {
    type: Number,
    unique: true,
    required: true
  },

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

  // Patwari
  patwariStatus: { type: String, default: "Pending" },
  patwariNotes: { type: String, default: "" },
  actualYield: { type: Number, default: 0 },

  // Insurance
  insuranceStatus: { type: String, default: "Pending" },

  // Bank
  bankStatus: { type: String, default: "Pending" },

  transactionId: String,
  paymentDate: Date,
  amount: Number

});

module.exports = mongoose.model("Application", appSchema);