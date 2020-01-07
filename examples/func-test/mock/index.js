module.exports = ({ Mock }) => ({
  '/api/test1': (req, res) => {
    res.json({
      success: true,
      data: '/api/test1',
    });
  },
  'POST /api/:id': {
    success: false,
    message: '/api/test2 failed',
  },
});
