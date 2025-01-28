const axios = require("axios");
const OciRoundtripForm = require("../models/OciRoundtripModel");

const OciLogin = async (req, res) => {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  const { baseURL, username, password, hookURL, method } = req.body;
  console.log("Method", method);

  // Input validation: Ensure the baseURL, username, and password are provided
  if (!baseURL?.trim() || !username?.trim() || !password?.trim() || !hookURL?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please verify that the username, password, and hook URL are all entered correctly.",
    });
  }

  try {
    // Create URL object from the baseURL
    const url = new URL(baseURL.trim());

    // Use URLSearchParams to extract and modify parameters
    const params = new URLSearchParams(url.search);

    // Update the hook_url parameter with the new backend URL
    params.set("hook_url", `${backendURL}/api/oci-data`);

    // Reconstruct the full URL with the updated hook_url parameter
    const OciPunchoutURL = `${url.origin}${url.pathname}?${params.toString()}`;

    let response;
    try {
      // Check the method and choose the appropriate axios request
      if (method === "POST") {
        response = await axios.post(OciPunchoutURL, null, {
          timeout: 10000, // Timeout in milliseconds (10 seconds in this example)
        });
      } else if (method === "GET") {
        response = await axios.post(OciPunchoutURL, null, {
          timeout: 10000, // Timeout in milliseconds (10 seconds in this example)
        });
      } else {
        return res.status(400).json({
          success: false,
          message: `Invalid ${method} request. Switch the method.`,
        });
      }
    } catch (error) {
      console.error(`${method} request failed:`, error.response?.data || error.message);
      return res.status(400).json({
        success: false,
        message: `Failed to make the ${method} request to the OCI Punchout URL. ${error.message}`,
      });
    }

    // Ensure response exists before proceeding
    if (!response) {
      return res.status(400).json({
        success: false,
        message: "No response received from the OCI Punchout URL.",
      });
    }

    // Save the data to the database
    const newRecord = new OciRoundtripForm({
      punchoutURL: baseURL.trim(),
      username: username.trim(),
      password: password.trim(),
      hookURL: hookURL.trim(),
    });

    await newRecord.save();

    // Send success response back to the client with the updated URL
    return res.status(200).json({
      success: true,
      response: response.config.url, // Include the updated URL in the response
    });
  } catch (error) {
    // Handle any errors and send a response
    return res.status(500).json({
      success: false,
      message: `${error.message}. Please review your configurations.`,
    });
  }
};

module.exports = {
  OciLogin,
};
