const mongoose = require("mongoose");

const cXMLSchema = new mongoose.Schema(
  {
    punchoutURL: {
      type: String,
      required: [true, "Please enter Punchout URL"],
    },
    fromDomain: String,
    fromIdentity: String,
    toDomain: String,
    toIdentity: String,
    senderDomain: String,
    senderIdentity: String,
    sharedSecret: String,
    payloadId: String,
    timeStamp: String,
    browserFormPostURL: String,
    extrinsicUser: String,
    extrinsicUsername: String,
    extrinsicEmail: String,
    cXMLTemp: String,
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    autoIndex: true, // Auto create indexes
  }
);

const cXMLPunchoutForm =
  mongoose.models.cXMLPunchoutForm ||
  mongoose.model("cXMLPunchoutForm", cXMLSchema);

module.exports = cXMLPunchoutForm;
