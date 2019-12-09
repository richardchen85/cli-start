const path = require('path');
const getWebpackConfig = require('../src/getWebpackConfig');
const dev = require('../src/dev');
const config = require('./config');

const webpackConfig = getWebpackConfig({
  cwd: process.cwd(),
  ...config,
});

dev({
  webpackConfig,
  port: 3003,
  contentBase: path.resolve('./src'),
});
