const mongoose = require("mongoose");

const OciRoundtripSchema = new mongoose.Schema(
  {
    punchoutURL: String,
    username: String,
    password: String,
    hookURL: String,
  },
  {
    timestamps: true,
    autoIndex: true,
  }
);

const OciRoundtripForm =
  mongoose.models.OciRoundtripForm ||
  mongoose.model("OciRoundtripForm", OciRoundtripSchema);

module.exports = OciRoundtripForm;
