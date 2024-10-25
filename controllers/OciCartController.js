const OciCartForm = require('../models/OciCartModel'); // Adjust the path if necessary

const OciCart = async (req, res) => {
    const frontendURL = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL; // Correct way to access environment variables

    console.log('Oci Cart', req.body);

    try {
        // Create a new document with the entire request body
        const newItem = new OciCartForm({
            data: req.body
        });

        // Save the document to the database
        const savedItem = await newItem.save();

        // Redirect to frontend with the saved item's ID
        const redirectUrl = `${frontendURL}/display-oci-cart?id=${savedItem._id}`;
        res.redirect(redirectUrl);

    } catch (error) {
        console.error("Error processing request:", error.message);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}

const getDataById = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the document by ID
        const item = await OciCartForm.findById(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Data not found',
            });
        }

        // Send the data back to the client
        res.status(200).json({
            success: true,
            data: item.data,
        });
    } catch (error) {
        console.error("Error retrieving data:", error.message);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}

module.exports = {
    OciCart,
    getDataById
};
