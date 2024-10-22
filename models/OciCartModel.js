const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Import Schema from mongoose

const OciCartSchema = new Schema({
    data: { type: Schema.Types.Mixed, required: true } // Mixed type to store any JSON object
}, {
    timestamps: true,
    autoIndex: true
});

const OciCartForm = mongoose.models.OciCartForm || mongoose.model('OciCartForm', OciCartSchema);

module.exports = OciCartForm; // Export the model, not the schema
