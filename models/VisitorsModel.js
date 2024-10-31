const mongoose = require('mongoose');

const VisitorsSchema = new mongoose.Schema({
    counts: Number
}, {
    timestamps: true,
    autoIndex: true
});

const VisitorsForm = mongoose.models.VisitorsForm || mongoose.model('VisitorsForm', VisitorsSchema);

module.exports = VisitorsForm;
