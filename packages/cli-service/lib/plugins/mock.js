const createMock = require('cli-mock');

module.exports = function mock(api) {
  const { cwd } = api;
  const mockPath = cwd + '/mock';

  api.service.registerHook(
    '_beforeServerWithApp',
    {
      description: 'add mock to devServer',
    },
    args => {
      debug(args);
      const { app } = args;

      if (process.env.MOCK === 'none') return;

      app.use(createMock({ mockPath, watch: true }));
    },
  );
};
