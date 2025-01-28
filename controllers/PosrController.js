const axios = require("axios");
const cXMLPunchoutForm = require("../models/cXMLModel");

const POSR = async (req, res) => {
  const { formData, cxmlPayload, supplierUrl } = req.body;

  if (!cxmlPayload || !supplierUrl) {
    return res.status(400).json({
      success: false,
      message: "cxmlPayload and supplierUrl are required.",
    });
  }

  try {
    // Logs
    console.log("cxmlPayload:", cxmlPayload);
    console.log("formdata:", formData);
    // Make the POST request to the supplier URL with cxmlPayload
    const response = await axios.post(supplierUrl, cxmlPayload, {
      headers: {
        "Content-Type": "application/xml",
      },
      responseType: "text",
    });

    console.log("Response:", response.data);
    // Regex to extract the code and text from the <Status> tag
    const statusRegex =
      /<Status code="(\d+)" text="([^"]+)">\s*([\s\S]*?)\s*<\/Status>/;

    const match = response.data.match(statusRegex);

    if (match) {
      const statusCode = parseInt(match[1], 10); // Extracted status code
      const statusText = match[3].trim(); // Extracted detailed text inside <Status>

      if (statusCode !== 200) {
        // If the status code is not 200, return an error message
        return res.status(statusCode).send({
          success: false,
          message: `Error: ${statusText}`,
        });
      }
    }

    // Respond to the client
    res
      .status(response.status)
      .set("Content-Type", "application/xml")
      .send(response.data);

    const newRecord = new cXMLPunchoutForm({
      punchoutURL: supplierUrl || "",
      cXMLTemp: cxmlPayload || "",
      fromDomain: formData.fromDomain || "",
      fromIdentity: formData.fromIdentity || "",
      toDomain: formData.toDomain || "",
      toIdentity: formData.toIdentity || "",
      senderDomain: formData.senderDomain || "",
      senderIdentity: formData.senderIdentity || "",
      sharedSecret: formData.sharedSecret || "",
      payloadId: formData.PayloadId || "",
      timeStamp: formData.timeStamp || "",
      buyerCookie: formData.buyerCookie || "",
      browserFormPostURL: formData.buyerUrl || "",
      extrinsicUser: formData.extrinsicUser || "",
      extrinsicUsername: formData.extrinsicUsername || "",
      extrinsicEmail: formData.extrinsicEmail || "",
    });

    await newRecord.save();
  } catch (error) {
    console.error("Error making POST request:", error.message);
    return res.status(500).json({
      success: false,
      message: `${error.message}. Please enter a valid Punchout URL.`,
    });
  }
};

module.exports = {
  POSR,
};
