const mongoose = require('mongoose');

const cXMLCartSchema = new mongoose.Schema({
    cXMLCartPayload: {
        type: String,
        required: true // Ensure that cXMLCartPayload is required
    },
}, { 
    timestamps: true, // Automatically add createdAt and updatedAt fields
    autoIndex: true // Auto create indexes
});

const cXMLCartForm = mongoose.models.cXMLCartForm || mongoose.model("cXMLCartForm", cXMLCartSchema);

module.exports = cXMLCartForm;
