const { join, dirname } = require('path');

module.exports = function mock(api) {
  const { debug, cwd, config } = api;

  api.service.registerHook('baseWebpackConfig', ({ memo, args }) => {
    debug(args);
    const isDev = process.env.NODE_ENV === 'development';
    const entryScript = join(cwd, `./src/main.js`);

    return {
      ...memo,
      entry: isDev ? { cli: [entryScript] } : { cli: [entryScript] },
      publicPath: isDev ? '/' : config.publicPath ? config.publicPath : '/',
      define: {
        'process.env.BASE_URL': config.base || '/',
        ...(config.define || {}),
      },
    };
  });
};
