const getConfig = require('cli-webpack/getConfig');

module.exports = function getWebpackConfig(service, opts) {
  const { watch } = opts;

  const baseWebpackConfig = service.applyHooks('baseWebpackConfig', {
    initialValue: {
      cwd: service.cwd,
    },
    args: {},
  });

  const webpackConfig = service.applyHooks('modifyWebpackConfig', {
    initialValue: getConfig({
      ...baseWebpackConfig,
    }),
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev && watch) {
    webpackConfig.devtool = 'eval-source-map';
    webpackConfig.watch = true;
  }

  return webpackConfig;
};
