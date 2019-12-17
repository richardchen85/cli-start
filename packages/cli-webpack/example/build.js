const path = require('path');
const getWebpackConfig = require('../lib/getWebpackConfig');
const build = require('../lib/build');
const config = require('./config');

const webpackConfig = getWebpackConfig({
  cwd: process.cwd(),
  ...config,
  isDev: false,
  hash: true,
  publicPath: '//cdn.jd.com/test',
});

process.env.COMPRESS = true;

build({
  webpackConfig,
  onSuccess: () => {},
  onFail: () => {},
});
