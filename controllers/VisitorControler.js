const VisitorsForm = require('../models/VisitorsModel');

// Retrieve and increment visitor count from database
const getVisitorCount = async (req, res) => {
  try {
    // Find or create the visitor count document
    let visitorDoc = await VisitorsForm.findOne();
    if (!visitorDoc) {
      visitorDoc = new VisitorsForm({ counts: 1 });
    } else {
      visitorDoc.counts += 1;
    }

    // Save the updated count
    await visitorDoc.save();

    // Respond with the updated visitor count
    res.status(200).json({ count: visitorDoc.counts });
  } catch (error) {
    console.error("Error updating visitor count:", error);
    res.status(500).json({ count: null, error: "Failed to retrieve and save visitor count" });
  }
};

module.exports = { getVisitorCount };
