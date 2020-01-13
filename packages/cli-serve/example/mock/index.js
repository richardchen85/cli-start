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
});
