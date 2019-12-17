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

      const port = parseInt(process.env.PORT || 8000, 10);
      service.port = port;
      process.env.NODE_ENV = 'development';
      require('cli-webpack/dev')({
        cwd,
        port,
        base: config.base,
        webpackConfig: service.webpackConfig,
        proxy: config.proxy || {},
        contentBase: './path-to-no-exists',
        _beforeServerWithApp(app) {
          //console.log('_beforeServerWithApp', app);
        },
        beforeMiddlewares: [],
        afterMiddlewares: [],
        beforeServer(devServer) {
          //console.log('beforeServer', devServer);
        },
        afterServer(devServer, devServerPort) {
          //console.log('afterServer', devServer, devServerPort);
        },
        onFail({ stats }) {
          //console.log('server onFail', stats);
        },
        onCompileDone({ port, stats, server }) {
          //console.log('server compile done', port, stats, server);
        },
      });
    },
  );
};
