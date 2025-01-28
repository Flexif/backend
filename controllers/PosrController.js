const axios = require("axios");
const cXMLPunchoutForm = require("../models/cXMLModel");

const POSR = async (req, res) => {
  const { formData, cxmlPayload, supplierUrl } = req.body;

  // Input validation
  if (!cxmlPayload || !supplierUrl) {
    return res.status(400).json({
      success: false,
      message: "cxmlPayload and supplierUrl are required.",
    });
  }

  try {
    // Make the POST request to the supplier URL with cxmlPayload
    const response = await axios.post(supplierUrl, cxmlPayload, {
      headers: {
        "Content-Type": "application/xml",
      },
      responseType: "text",
      timeout: 10000, // Increase to 10 seconds or more
    });

    // Regex to extract <Status> details from response.data
    const statusRegex = /<Status code="(\d+)" text="([^"]+)">\s*([\s\S]*?)\s*<\/Status>/;
    const match = response.data.match(statusRegex);

    if (match) {
      const statusCode = parseInt(match[1], 10); // Extracted status code
      const statusMessage = match[3].trim(); // Extracted detailed text inside <Status>

      // If status code is not 200, return error message
      if (statusCode !== 200) {
        return res.status(statusCode).json({
          success: false,
          message: `Error: ${statusMessage}`,
        });
      }
    }

    // Save the data to the database
    const newRecord = new cXMLPunchoutForm({
      punchoutURL: supplierUrl || "",
      cXMLTemp: cxmlPayload || "",
      fromDomain: formData?.fromDomain || "",
      fromIdentity: formData?.fromIdentity || "",
      toDomain: formData?.toDomain || "",
      toIdentity: formData?.toIdentity || "",
      senderDomain: formData?.senderDomain || "",
      senderIdentity: formData?.senderIdentity || "",
      sharedSecret: formData?.sharedSecret || "",
      payloadId: formData?.PayloadId || "",
      timeStamp: formData?.timeStamp || "",
      buyerCookie: formData?.buyerCookie || "",
      browserFormPostURL: formData?.buyerUrl || "",
      extrinsicUser: formData?.extrinsicUser || "",
      extrinsicUsername: formData?.extrinsicUsername || "",
      extrinsicEmail: formData?.extrinsicEmail || "",
    });

    await newRecord.save();

    // Send the successful response back to the client
    return res
      .status(response.status)
      .set("Content-Type", "application/xml")
      .send(response.data);
  } catch (error) {
    console.error("Error making POST request:", error.message);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}. Please verify the Punchout URL.`,
    });
  }
};

module.exports = {
  POSR,
};
