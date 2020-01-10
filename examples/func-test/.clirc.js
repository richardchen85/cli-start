module.exports = {
  devServer: {
    proxy: {
      '/mengtan/userInfo': {
        target: 'https://api.mocky.chenliqiang.cn/dataView/6',
        changeOrigin: true,
      },
    },
  },
  chainConfig: webpackConfig => {
    // webpackConfig.entry('a').add('a.js');
  },
  plugins: [['./plugins/test.js', { test: 'test' }]],
};
