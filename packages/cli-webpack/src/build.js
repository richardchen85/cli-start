const webpack = require('webpack');
const rimraf = require('rimraf');
const assert = require('assert');
const { isPlainObject } = require('lodash');
const {
  printFileSizesAfterBuild,
} = require('react-dev-utils/FileSizeReporter');

const debug = require('debug')('cli-webpack:build');

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

function getOutputPath(webpackConfig) {
  return Array.isArray(webpackConfig)
    ? webpackConfig[0].output.path
    : webpackConfig.output.path;
}

module.exports = function build(opts = {}) {
  const { webpackConfig, cwd = process.cwd(), onSuccess, onFail } = opts;
  assert(webpackConfig, 'webpackConfig should be supplied.');
  assert(
    isPlainObject(webpackConfig) || Array.isArray(webpackConfig),
    'webpackConfig should be plain object or array.',
  );

  const outputPath = getOutputPath(webpackConfig);

  // 清理 output path
  if (process.env.CLEAR_OUTPUT !== 'none') {
    debug(`Clean output path ${outputPath.replace(`${cwd}/`, '')}`);
    rimraf.sync(outputPath);
  }

  debug('build start');
  webpack(webpackConfig, (err, stats) => {
    debug('build done');

    if (err || stats.hasErrors()) {
      if (onFail) {
        onFail(getErrorInfo(err, stats));
      }

      const isWatch = isPlainObject(webpackConfig)
        ? webpackConfig.watch
        : webpackConfig.some(config => config.watch); /* array */

      if (!isWatch) {
        process.exit(1);
      }
    }

    console.log('File sizes after gzip:\n');
    printFileSizesAfterBuild(
      stats,
      {
        root: outputPath,
        sizes: {},
      },
      outputPath,
      WARN_AFTER_BUNDLE_GZIP_SIZE,
      WARN_AFTER_CHUNK_GZIP_SIZE,
    );
    console.log();

    if (onSuccess) {
      onSuccess({ stats });
    }
  });
};

function getErrorInfo(err, stats) {
  if (!stats.stats) {
    return {
      err:
        err ||
        (stats.compilation &&
          stats.compilation.errors &&
          stats.compilation.errors[0]),
      stats,
      rawStats: stats,
    };
  }
  const [curStats] = stats.stats;
  return {
    err:
      err ||
      (curStats.compilation &&
        curStats.compilation.errors &&
        curStats.compilation.errors[0]),
    stats: curStats,
    rawStats: stats,
  };
}
