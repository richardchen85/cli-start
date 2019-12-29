const createMock = require('cli-mock');

module.exports = function mock(api) {
  const { cwd } = api;

  api.service.registerHook(
    '_beforeServerWithApp',
    {
      description: 'add mock to devServer',
    },
    args => {
      debug(args);
      const { app } = args;

      if (process.env.MOCK === 'none') return;

      createMock({ app, cwd, watch: true });
    },
  );
};
