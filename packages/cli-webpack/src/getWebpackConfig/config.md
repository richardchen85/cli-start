# webpack config

## npm 依赖

```bash
# webpack baseic
yarn add address assert lodash webpack webpack-chain webpack-dev-middleware webpack-dev-server html-webpack-plugin mini-css-extract-plugin terser-webpack-plugin progress-bar-webpack-plugin webpackbar speed-measure-webpack-plugin copy-webpack-plugin friendly-errors-webpack-plugin react-dev-utils

# loader
yarn add style-loader url-loader css-loader css-modules-typescript-loader
yarn add less less-loader
yarn add node-sass sass-loader
yarn add stylus stylus-loader
yarn add postcss-loader postcss-preset-env autoprefixer cssnano postcss-flexbugs-fixes

# babel
yarn add typescript ts-loader babel-loader @babel/cli @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript @babel/runtime @babel/plugin-transform-runtime @babel/plugin-proposal-decorators @babel/plugin-proposal-class-properties @babel/plugin-proposal-object-rest-spread @babel/plugin-syntax-dynamic-import babel-plugin-transform-react-remove-prop-types

# eslint
yarn add eslint eslint-config-react-app eslint-loader eslint-plugin-flowtype eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks
```

## config.js

```javascript
module.exports = {
  cwd: process.cwd(),
  isDev: true,
  hash: false,
  entry: {
    app: '/path/to/app.js',
  },
  outputPath: 'dist',
  publicPath: 'https://cdn.example.com/assets/[hash]/',
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
  copy: String || Array,
  externals: {},
  chainConfig: false,
  SPEED_MEASURE: false,
  devtool: '',
  devServer: {}
};
```

## ENV

```nohighlight
ESLINT=true
HOST=0.0.0.0
HTTPS=
CERT=
KEY=
CONTENT_BASE=
CSS_COMPRESS=none
COMPRESS=none
NO_COMPRESS=none
PROGRESS=true
ANALYZE=
ANALYZE_MODE=server
ANALYZE_PORT=8888
ANALYZE_OPEN=none
ANALYZE_DUMP=stats.json
ANALYZE_LOG_LEVEL=info
ANALYZE_REPORT=
CLEAR_CONSOLE=
SPEED_MEASURE=CONSOLE
DUPLICATE_CHECKER=true
FORK_TS_CHECKER=true
CI=
SILENT=
SYSTEM_BELL=none
CLEAR_OUTPUT=none
```
