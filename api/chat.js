module.exports = (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Sukoon API is live"
  });
};
