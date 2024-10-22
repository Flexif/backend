const axios = require('axios');

const POSR = async (req, res) => {
  const { cxmlPayload, supplierUrl } = req.body;

  if (!cxmlPayload || !supplierUrl) {
    return res.status(400).json({
      success: false,
      message: "cxmlPayload and supplierUrl are required."
    });
  }

  try {
    // Log session ID and other details
    console.log("Session ID:", req.sessionID);
    console.log("cxmlPayload:", cxmlPayload);
    console.log("Supplier URL:", supplierUrl);

    // Make the POST request to the supplier URL with cxmlPayload
    const response = await axios.post(supplierUrl, cxmlPayload, {
      headers: {
        'Content-Type': 'application/xml',
      },
      responseType: 'text',
    });

    console.log('Response:', response.data);
    
    // Respond to the client
    res.status(response.status)
       .set('Content-Type', 'application/xml')
       .send(response.data);
    
  } catch (error) {
    console.error("Error making POST request:", error.message);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data || error.message;
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
};

module.exports = {
  POSR,
};
