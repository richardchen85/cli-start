const TerserPlugin = require('terser-webpack-plugin');
const { isPlainObject } = require('lodash');

function mergeConfig(config, userConfig) {
  if (typeof userConfig === 'function') {
    return userConfig(config);
  } else if (isPlainObject(userConfig)) {
    return {
      ...config,
      ...userConfig,
    };
  } else {
    return config;
  }
}

module.exports = function(webpackConfig, opts) {
  const disableCompress = process.env.COMPRESS === 'none';

  webpackConfig.mode('production').devtool(opts.devtool);

  if (disableCompress) {
    webpackConfig.output.pathinfo(true);
    webpackConfig.optimization.namedModules(true).namedChunks(true);
  }

  if (opts.hash) {
    webpackConfig.output
      .filename(`[name].[contenthash:8].js`)
      .chunkFilename(`[name].[contenthash:8].async.js`);
  }

  webpackConfig.performance.hints(false);

  webpackConfig.optimization
    // don't emit files if have error
    .noEmitOnErrors(true);

  if (disableCompress) {
    webpackConfig.optimization.minimize(false);
  } else {
    webpackConfig
      .plugin('hash-module-ids')
      .use(require('webpack/lib/HashedModuleIdsPlugin'));

    const minimizerName = 'terserjs';
    const minimizerPlugin = TerserPlugin;
    const minimizerOptions = [
      mergeConfig(
        {
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,

              // turn off flags with small gains to speed up minification
              arrows: false,
              collapse_vars: false, // 0.3kb
              comparisons: false,
              computed_props: false,
              hoist_funs: false,
              hoist_props: false,
              hoist_vars: false,
              inline: false,
              loops: false,
              negate_iife: false,
              properties: false,
              reduce_funcs: false,
              reduce_vars: false,
              switches: false,
              toplevel: false,
              typeofs: false,

              // a few flags with noticable gains/speed ratio
              // numbers based on out of the box vendor bundle
              booleans: true, // 0.7kb
              if_return: true, // 0.4kb
              sequences: true, // 0.7kb
              unused: true, // 2.3kb

              // required features to drop conditional branches
              conditionals: true,
              dead_code: true,
              evaluate: true,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
          sourceMap: !!opts.devtool,
        },
        opts.terserJSOptions,
      ),
    ];

    webpackConfig.optimization
      .minimizer(minimizerName)
      .use(minimizerPlugin, minimizerOptions);
  }
};
