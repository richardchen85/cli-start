const eslintFormatter = require('react-dev-utils/eslintFormatter');

// TODO 是否开放配置，开放哪些配置？
module.exports = function(webpackConfig, opts) {
  const eslintOptions = {
    formatter: eslintFormatter,
    useEslintrc: false,
    ignore: false,
    eslintPath: require.resolve('eslint'),
    resolvePluginsRelativeTo: __dirname,
    baseConfig: {
      // 同时需要安装：
      // babel-eslint eslint-plugin-flowtype eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react
      // @typescript-eslint/eslint-plugin @typescript-eslint/parser
      extends: [require.resolve('eslint-config-react-app')],
    },
  };

  webpackConfig.module
    .rule('eslint')
    .test(/\.(js|jsx)$/)
    .include.add(opts.cwd)
    .end()
    .exclude.add(/node_modules/)
    .end()
    .enforce('pre')
    .use('eslint-loader')
    .loader(require.resolve('eslint-loader'))
    .options(eslintOptions);
};
