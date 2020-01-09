const fs = require('fs');
const openBrowser = require('react-dev-utils/openBrowser');
const webpack = require('webpack');
const assert = require('assert');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk');
const { isPlainObject } = require('lodash');
const prepareUrls = require('./prepareUrls');
const clearConsole = require('./clearConsole');
const { send, STARTING, DONE, ERROR } = require('./send');
const errorOverlayMiddleware = require('./errorOverlayMiddleware');

const isInteractive = process.stdout.isTTY;

const HOST = process.env.HOST || '0.0.0.0';
const PROTOCOL = process.env.HTTPS === 'true' ? 'https' : 'http';
const CERT =
  process.env.HTTPS && process.env.CERT
    ? fs.readFileSync(process.env.CERT)
    : '';
const KEY =
  process.env.HTTPS && process.env.KEY ? fs.readFileSync(process.env.KEY) : '';
const noop = () => {};

process.env.NODE_ENV = 'development';

function getWebpackConfig(webpackConfig) {
  return Array.isArray(webpackConfig) ? webpackConfig[0] : webpackConfig;
}

module.exports = function dev({
  webpackConfig,
  port,
  base,
  contentBase,
  _beforeServerWithApp,
  beforeMiddlewares,
  afterMiddlewares,
  beforeServer,
  afterServer,
  onFail = noop,
  onCompileDone = noop,
}) {
  assert(webpackConfig, 'webpackConfig should be supplied.');
  assert(
    isPlainObject(webpackConfig) || Array.isArray(webpackConfig),
    'webpackConfig should be plain object or array.',
  );

  const compiler = webpack(webpackConfig);
  const urls = prepareUrls(PROTOCOL, HOST, port, base);
  let server = null;
  let isFirstCompile = true;

  compiler.hooks.done.tap('cli-webpack done', stats => {
    if (stats.hasErrors()) {
      // make sound
      // ref: https://github.com/JannesMeyer/system-bell-webpack-plugin/blob/bb35caf/SystemBellPlugin.js#L14
      if (process.env.SYSTEM_BELL !== 'none') {
        process.stdout.write('\x07');
      }
      send({ type: ERROR });
      onFail({ stats });
      return;
    }

    let copied = '';
    if (isFirstCompile) {
      try {
        require('clipboardy').writeSync(urls.localUrlForBrowser);
        copied = chalk.dim('(copied to clipboard)');
      } catch (e) {
        copied = chalk.red(`(copy to clipboard failed)`);
      }
      console.log();
      console.log(
        [
          `  App running at:`,
          `  - Local:   ${chalk.cyan(urls.localUrlForTerminal)} ${copied}`,
          urls.lanUrlForTerminal
            ? `  - Network: ${chalk.cyan(urls.lanUrlForTerminal)}`
            : '',
        ].join('\n'),
      );
      console.log();
    }

    onCompileDone({
      isFirstCompile,
      stats,
      port,
      server,
    });

    if (isFirstCompile) {
      isFirstCompile = false;
      openBrowser(urls.localUrlForBrowser);
      send({
        type: DONE,
        urls: {
          local: urls.localUrlForTerminal,
          lan: urls.lanUrlForTerminal,
          rawLocal: urls.localUrlForBrowser,
          rawLanUrl: urls.rawLanUrl,
        },
      });
    }
  });

  const serverConfig = {
    disableHostCheck: true,
    compress: true,
    clientLogLevel: 'none',
    hot: true,
    quiet: true,
    headers: {
      'access-control-allow-origin': '*',
    },
    publicPath: getWebpackConfig(webpackConfig).output.publicPath,
    watchOptions: {
      ignored: /node_modules/,
    },
    historyApiFallback: false,
    overlay: false,
    host: HOST,
    https: !!process.env.HTTPS,
    cert: CERT,
    key: KEY,
    contentBase: contentBase || process.env.CONTENT_BASE,
    before(app) {
      (beforeMiddlewares || []).forEach(middleware => {
        app.use(middleware);
      });
      // internal usage for proxy
      if (_beforeServerWithApp) {
        _beforeServerWithApp(app);
      }
      app.use(errorOverlayMiddleware());
    },
    after(app) {
      (afterMiddlewares || []).forEach(middleware => {
        app.use(middleware);
      });
    },
    ...(getWebpackConfig(webpackConfig).devServer || {}),
  };
  server = new WebpackDevServer(compiler, serverConfig);

  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      server.close(() => {
        process.exit(0);
      });
    });
  });

  if (beforeServer) {
    beforeServer(server);
  }

  server.listen(port, HOST, err => {
    if (err) {
      console.log(err);
      return;
    }
    if (isInteractive) {
      clearConsole();
    }
    console.log(chalk.cyan('Starting the development server...\n'));
    send({ type: STARTING });
    if (afterServer) {
      afterServer(server, port);
    }
  });
};
