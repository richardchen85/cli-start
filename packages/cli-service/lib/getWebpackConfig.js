const getConfig = require('cli-webpack/getConfig');

module.exports = function getWebpackConfig(service, opts) {
  const { config } = service;
  const { watch } = opts;

  const baseWebpackConfig = service.applyHooks('baseWebpackConfig', {
    initialValue: {
      cwd: service.cwd,
    },
    args: {},
  });

  // cli-webpack 支持 chainConfig 选项
  baseWebpackConfig.chainConfig = webpackConfig => {
    service.applyHooks('chainConfig', {
      args: webpackConfig,
    });
    if (config.chainConfig) {
      config.chainConfig(webpackConfig, {
        webpack: require('cli-webpack/webpack'),
      });
    }
  };

  const webpackConfig = service.applyHooks('modifyWebpackConfig', {
    initialValue: getConfig({
      ...config,
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
