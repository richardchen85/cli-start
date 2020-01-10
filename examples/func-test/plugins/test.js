module.exports = function test(api, opts) {
  const { service } = api;

  service.registerCommand(
    'test',
    {
      webpack: true,
      description: 'this is a test command',
    },
    args => {
      console.log('args:', args);
    },
  );
};
