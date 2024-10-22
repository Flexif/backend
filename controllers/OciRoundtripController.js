const axios = require('axios');
const OciRoundtripForm = require ('../models/OciRoundtripModel');

const OciLogin = async (req, res) => {
    const backendURL = process.env.BACKEND_BASE_URL || '';
    const { baseURL, username, password, hookURL } = req.body;

    // Input validation: Ensure the baseURL, username, and password are provided
    if (!baseURL || !username || !password || !hookURL) {
        return res.status(400).json({
            success: false,
            message: 'Please verify that the username, password, and hook URL are all entered correctly.',
        });
    }

    try {
        // Create URL object from the baseURL
        const url = new URL(baseURL);

        // Use URLSearchParams to extract and modify parameters
        const params = new URLSearchParams(url.search);

        // Update the hook_url parameter with the new backend URL (NO encoding required)
        params.set('hook_url', `${backendURL}/api/oci-data`);

        // Reconstruct the full URL with the updated hook_url parameter
        const OciPunchoutURL = `${url.origin}${url.pathname}?${params.toString()}`;
        console.log('Updated URL:', OciPunchoutURL);

        // Perform the axios POST request to the new URL
        const response = await axios.post(OciPunchoutURL);

        // Save the data to the database
        const newRecord = new OciRoundtripForm({
            punchoutURL: baseURL,
            username: username,
            password: password,
            hookURL: hookURL
        });

        await newRecord.save();

        // Send success response back to the client with the updated URL
        return res.status(200).json({
            success: true,
            OciPunchoutURL: OciPunchoutURL // Include the updated URL in the response
        });

    } catch (error) {
        // Handle any errors and send a response
        console.error("Error making POST request:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error occurred while processing the request.',
            error: error.message,
        });
    }
};

module.exports = {
    OciLogin,
};
