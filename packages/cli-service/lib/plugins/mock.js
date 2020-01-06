const debug = require('debug');
const createMock = require('cli-mock');

module.exports = function mock(api) {
  const { cwd } = api;

  api.service.registerHook('_beforeServerWithApp', ({ memo, args }) => {
    debug(args);
    const { app } = args;

    if (process.env.MOCK === 'none') return;

    createMock({ app, cwd, watch: true });

    return memo;
  });
};
