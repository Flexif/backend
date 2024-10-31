const VisitorsForm = require('../models/VisitorsModel'); 

// Retrieve and increment visitor count from database
const getVisitorCount = async (req, res) => {
  try {
    // Retrieve the latest visitor count from the database
    const latestEntry = await VisitorsForm.findOne().sort({ createdAt: -1 });

    // If there is a previous count, increment it; otherwise, start at 1
    const newCount = latestEntry ? latestEntry.counts + 1 : 1;

    // Create a new document with the updated count
    const newVisitor = new VisitorsForm({ counts: newCount });

    // Save the new visitor count to the database
    await newVisitor.save();

    // Respond with the updated visitor count
    res.status(200).json({ count: newCount });
  } catch (error) {
    // Handle any errors that occur during the save operation
    console.error("Error retrieving or saving visitor count:", error);
    res.status(500).json({ error: "Failed to retrieve and save visitor count" });
  }
};

module.exports = { getVisitorCount };
