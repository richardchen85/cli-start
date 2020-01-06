const { join, dirname } = require('path');

module.exports = function mock(api) {
  const { cwd } = api;

  api.service.registerHook('modifyWebpackConfig', ({ memo, args }) => {
    const isDev = process.env.NODE_ENV === 'development';
    const entryScript = join(cwd, `./src/main.js`);
    return {
      ...memo,
      entry: entryScript,
      publicPath: '/',
    };
  });
};
