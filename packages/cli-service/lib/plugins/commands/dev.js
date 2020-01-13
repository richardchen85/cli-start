const chalk = require('chalk');
const debug = require('debug')('cli-service:commands/dev');

module.exports = function dev(api) {
  const { service, config, cwd } = api;

  service.registerCommand(
    'dev',
    {
      webpack: true,
      description: 'start a dev server from development',
    },
    (args = {}) => {
      debug(args);

      const port = parseInt(process.env.PORT || 3000, 10);
      service.port = port;
      process.env.NODE_ENV = 'development';
      service.applyHooks('onStart');
      require('cli-webpack/dev')({
        cwd,
        port,
        base: config.base,
        webpackConfig: service.webpackConfig,
        proxy: config.proxy || {},
        //contentBase: './path-do-not-exists',
        _beforeServerWithApp(app) {
          service.applyHooks('_beforeServerWithApp', { args: { app } });
        },
        beforeMiddlewares: service.applyHooks('beforeMiddlewares', {
          initialValue: [],
        }),
        afterMiddlewares: service.applyHooks('afterMiddlewares', {
          initialValue: [],
        }),
        beforeServer(devServer) {
          service.applyHooks('beforeServer', { args: { server: devServer } });
        },
        afterServer(devServer, devServerPort) {
          service.applyHooks('afterServer', {
            args: { server: devServer, port: devServerPort },
          });
        },
        onFail({ stats }) {
          console.log(chalk.red(stats.compilation.errors));
        },
        onCompileDone({ isFirstCompile, stats, port, server }) {
          service.applyHooks('onCompileDone', {
            args: { isFirstCompile, stats, port, server },
          });
        },
      });
    },
  );
};
