const xml2js = require('xml2js');
const cXMLCartForm = require('../models/cXMLCartModel'); // Adjust the path if necessary

const POOM = async (req, res) => {

    const frontendURL = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL;
    console.log("Received JSON data:", req.body);

    try {
        // Directly access the 'cxml-urlencoded' field
        const xmlDoc = req.body['cxml-urlencoded'];
        console.log("xmlDoc ----> ", xmlDoc);

        if (!xmlDoc) {
            return res.status(400).json({ error: 'No XML data provided' });
        }

        // Create a new document using the cXMLCartForm model
        const newCart = new cXMLCartForm({
            cXMLCartPayload: xmlDoc, // Save the entire XML payload as a string
        });

        // Save the document to the database
        await newCart.save();

        // Construct the redirect URL with the ID
        const redirectUrl = `${frontendURL}/display-cxml-cart?xmlDocId=${newCart._id.toString()}`;

        // Redirect to the frontend URL
        res.redirect(redirectUrl);

    } catch (error) {
        // Handle errors
        console.error("Error processing data:", error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getXmlDataById = async (req, res) => {
    try {
        console.log('Request from frontend', req.params.id);
        const cart = await cXMLCartForm.findById(req.params.id);
        console.log('CART', cart);

        if (!cart) {
            return res.status(404).json({ message: 'No data found for the given ID' });
        }

        const rawXml = cart.cXMLCartPayload; // Assume this is the raw XML string
        const parser = new xml2js.Parser();

        // Parse XML to JSON
        parser.parseString(rawXml, (err, jsonResult) => {
            if (err) {
                console.error('Error parsing XML:', err);
                return res.status(500).json({ message: 'Error parsing XML' });
            }

            // Send both raw XML and parsed JSON in the response
            res.status(200).json({
                xml: rawXml,
                json: jsonResult
            });
        });
    } catch (error) {
        console.error("Error fetching data:", error.message);
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    POOM,
    getXmlDataById
};
