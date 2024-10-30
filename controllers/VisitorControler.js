let visitorCount = 0; // This is a simple in-memory count

// Increment visitor count and return the current count
const getVisitorCount = (req, res) => {
  visitorCount += 1;
  res.status(200).json({ count: visitorCount });
};

module.exports = { getVisitorCount };