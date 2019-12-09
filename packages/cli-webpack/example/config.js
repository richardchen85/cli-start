const path = require('path');

module.exports = {
  cwd: process.cwd(),
  isDev: true,
  hash: false,
  entry: {
    app: './src/app.js',
  },
  outputPath: 'dist',
  publicPath: '/',
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
  disableDynamicImport: false, // 禁止将异步加载的模块分开打包
  urlLoaderExcludes: [], // 不通过 url-loader 加载的文件类型
  inlineLimit: 10000, // file-loader 内嵌文件内容的大小限制
  babel: {
    presets: [],
    plugins: [],
  },
  tsConfigFile: 'tsconfig.json',
  typescript: {},
  disableCSSSourceMap: true,
  cssLoaderOptions: {},
  theme: './theme.js',
  browserslist: [],
  autoprefixer: {},
  extraPostCSSPlugins: [],
  cssnano: false,
  lessLoaderOptions: {},
  styleLoader: false,
  cssPublicPath: '',
  generateCssModulesTypings: false,
  cssModulesExcludes: [],
  sass: {},
  stylus: {},
  cssModulesWithAffix: false,
  define: {}, // DefinePlugin 要注入的内容
  ignoreMomentLocale: false,
  copy: '', // String | Array
  externals: {},
  chainConfig: false,
  SPEED_MEASURE: false,
  devtool: '',
  devServer: {},
  terserJSOptions: {},
};
