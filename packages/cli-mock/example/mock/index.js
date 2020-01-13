module.exports = ({ Mock }) => ({
  '/api/test1': {
    success: true,
    data: '/api/test1',
  },
  '/api/test2': {
    success: true,
    data: Mock.mock({
      'list|1-10': [
        {
          'id|+1': 1,
        },
      ],
    }),
  },
  'POST /api/test3': (req, res) => {
    res.json({
      success: true,
      data: {
        query: JSON.stringify(req.query),
        body: JSON.stringify(req.body),
      },
    });
  },
});
