const { existsSync } = require('fs');
const { join, resolve, relative, dirname } = require('path');
const { EOL } = require('os');
const assert = require('assert');
const Config = require('webpack-chain');
const resolveDefine = require('./resolveDefine');

function makeArray(item) {
  if (Array.isArray(item)) return item;
  return [item];
}

module.exports = function(opts) {
  const { cwd } = opts || {};
  const isDev = opts.isDev || process.env.NODE_ENV === 'development';

  const webpackConfig = new Config();

  // mode
  webpackConfig.mode('development');

  // entry
  if (opts.entry) {
    for (const key in opts.entry) {
      const entry = webpackConfig.entry(key);
      makeArray(opts.entry[key]).forEach(file => {
        entry.add(file);
      });
    }
  }

  // output
  const absOutputPath = resolve(cwd, opts.outputPath || 'dist');
  webpackConfig.output
    .path(absOutputPath)
    .filename('[name].js')
    .chunkFilename('[name].async.js')
    .publicPath(opts.publicPath || undefined)
    .devtoolModuleFilenameTemplate(info => {
      return relative(cwd, info.absoluteResourcePath).replace(/\\/g, '/');
    });

  // resolve
  webpackConfig.resolve
    // 不能设为 false，因为 tnpm 是通过 link 处理依赖，设为 false tnpm 下会有大量冗余模块
    .set('symlinks', true)
    .modules.add('node_modules')
    .add(join(__dirname, '../../node_modules'))
    .end()
    .extensions.merge([
      '.web.js',
      '.wasm',
      '.mjs',
      '.js',
      '.web.jsx',
      '.jsx',
      '.web.ts',
      '.ts',
      '.web.tsx',
      '.tsx',
      '.json',
    ]);

  if (opts.alias) {
    for (const key in opts.alias) {
      webpackConfig.resolve.alias.set(key, opts.alias[key]);
    }
  }

  // resolveLoader
  webpackConfig.resolveLoader.modules
    .add('node_modules')
    .add(join(__dirname, '../../node_modules'))
    .end();

  if (!opts.disableDynamicImport) {
    webpackConfig.optimization
      .splitChunks({
        chunks: 'async',
        name: 'vendors',
      })
      .runtimeChunk(false);
  }

  // module -> exclude
  const DEFAULT_INLINE_LIMIT = 10000;
  const rule = webpackConfig.module
    .rule('exclude')
    .exclude.add(/\.json$/)
    .add(/\.ejs/)
    .add(/\.(js|jsx|ts|tsx|mjs|wasm)$/)
    .add(/\.(graphql|gql)$/)
    .add(/\.(css|less|scss|sass|styl(us)?)$/);
  if (opts.urlLoaderExcludes) {
    opts.urlLoaderExcludes.forEach(exclude => {
      rule.add(exclude);
    });
  }
  rule
    .end()
    .use('url-loader')
    .loader(require.resolve('url-loader'))
    .options({
      limit: opts.inlineLimit || DEFAULT_INLINE_LIMIT,
      name: 'static/[name].[hash:8].[ext]',
    });

  // babel options
  const babel = opts.babel || {};
  const babelOpts = {
    presets: [
      require.resolve('@babel/preset-env'),
      require.resolve('@babel/preset-react'),
      require.resolve('@babel/preset-typescript'),
      ...(babel.presets || []),
    ],
    plugins: [
      [
        require.resolve('@babel/plugin-transform-runtime'),
        {
          // 文档未标记配置，用以将 @babel/runtime 指向 cli
          absoluteRuntime: dirname(
            require.resolve('@babel/runtime/package.json'),
          ),
          corejs: false,
          regenerator: true,
        },
      ],
      [require.resolve('@babel/plugin-syntax-dynamic-import')],
      [
        require.resolve('@babel/plugin-proposal-object-rest-spread'),
        { useBuiltIns: true },
      ],
      [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
      [
        require.resolve('@babel/plugin-proposal-class-properties'),
        { loose: true },
      ],
      ...(babel.plugins || []),
    ],
  };

  if (!isDev) {
    babelOpts.plugins = [
      ...babelOpts.plugins,
      [
        require.resolve('babel-plugin-transform-react-remove-prop-types'),
        { removeImport: true },
      ],
    ];
  }

  if (opts.disableDynamicImport) {
    babelOpts.plugins = [
      ...babelOpts.plugins,
      require.resolve('babel-plugin-dynamic-import-node'),
    ];
  }

  // module -> eslint
  if (process.env.ESLINT && process.env.ESLINT !== 'none') {
    require('./eslint')(webpackConfig, opts);
  }

  // Avoid "require is not defined" errors
  webpackConfig.module
    .rule('mjs-require')
    .test(/\.mjs$/)
    .type('javascript/auto')
    .include.add(opts.cwd);

  // module -> mjs
  webpackConfig.module
    .rule('mjs')
    .test(/\.mjs$/)
    .include.add(opts.cwd)
    .end()
    .use('babel-loader')
    .loader(require.resolve('babel-loader'))
    .options(babelOpts);

  // module -> js
  webpackConfig.module
    .rule('js')
    .test(/\.js$/)
    .include.add(opts.cwd)
    .end()
    .exclude.add(/node_modules/)
    .end()
    .use('babel-loader')
    .loader(require.resolve('babel-loader'))
    .options(babelOpts);

  // module -> jsx
  // jsx 不 exclude node_modules
  webpackConfig.module
    .rule('jsx')
    .test(/\.jsx$/)
    .include.add(opts.cwd)
    .end()
    .use('babel-loader')
    .loader(require.resolve('babel-loader'))
    .options(babelOpts);

  // module -> tsx?
  const tsConfigFile =
    opts.tsConfigFile ||
    (existsSync(join(opts.cwd, 'tsconfig.json'))
      ? join(opts.cwd, 'tsconfig.json')
      : join(__dirname, 'tsconfig.default.json'));
  webpackConfig.module
    .rule('ts')
    .test(/\.tsx?$/)
    .use('babel-loader')
    .loader(require.resolve('babel-loader'))
    .options(babelOpts)
    .end()
    .use('ts-loader')
    .loader(require.resolve('ts-loader'))
    .options({
      configFile: tsConfigFile,
      transpileOnly: true,
      // ref: https://github.com/TypeStrong/ts-loader/blob/fbed24b/src/utils.ts#L23
      errorFormatter(error, colors) {
        const messageColor =
          error.severity === 'warning' ? colors.bold.yellow : colors.bold.red;
        return (
          colors.grey('[tsl] ') +
          messageColor(error.severity.toUpperCase()) +
          (error.file === ''
            ? ''
            : messageColor(' in ') +
              colors.bold.cyan(
                `${relative(cwd, join(error.context, error.file))}(${
                  error.line
                },${error.character})`,
              )) +
          EOL +
          messageColor(`      TS${error.code}: ${error.content}`)
        );
      },
      ...(opts.typescript || {}),
    });

  // module -> css
  require('./css')(webpackConfig, opts);

  // plugins -> html
  webpackConfig.plugin('html').use(require('html-webpack-plugin'), [
    Object.assign(
      {
        template: resolve(cwd, './src/index.ejs'),
      },
      isDev
        ? undefined
        : {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            },
          },
    ),
  ]);

  // plugins -> define
  webpackConfig
    .plugin('define')
    .use(require('webpack/lib/DefinePlugin'), [resolveDefine(opts)]);

  // plugins -> progress bar
  const NO_PROGRESS = process.env.PROGRESS === 'none';
  if (!NO_PROGRESS) {
    if (process.platform === 'win32') {
      webpackConfig
        .plugin('progress')
        .use(require('progress-bar-webpack-plugin'));
    } else {
      webpackConfig.plugin('progress').use(require('webpackbar'), [
        {
          color: 'green',
          reporters: ['fancy'],
        },
      ]);
    }
  }

  // plugins -> ignore moment locale
  if (opts.ignoreMomentLocale) {
    webpackConfig
      .plugin('ignore-moment-locale')
      .use(require('webpack/lib/IgnorePlugin'), [/^\.\/locale$/, /moment$/]);
  }

  // plugins -> analyze
  if (process.env.ANALYZE) {
    webpackConfig
      .plugin('bundle-analyzer')
      .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [
        {
          analyzerMode: process.env.ANALYZE_MODE || 'server',
          analyzerPort: process.env.ANALYZE_PORT || 8888,
          openAnalyzer: process.env.ANALYZE_OPEN !== 'none',
          // generate stats file while ANALYZE_DUMP exist
          generateStatsFile: !!process.env.ANALYZE_DUMP,
          statsFilename: process.env.ANALYZE_DUMP || 'stats.json',
          logLevel: process.env.ANALYZE_LOG_LEVEL || 'info',
          defaultSizes: 'parsed', // stat  // gzip
        },
      ]);
  }

  // plugins -> analyze report
  if (process.env.ANALYZE_REPORT) {
    webpackConfig
      .plugin('bundle-analyzer-reporter')
      .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [
        {
          analyzerMode: 'disabled', // 关闭 analyzer server
          generateReportFile: true, // 开启报告生成功能
          reportDepth: 2, // 裁剪深度 2
          reportDir: process.cwd(),
          statsFilename: process.env.ANALYZE_DUMP || 'bundlestats.json', // 默认生成到 bundlestats.json
        },
      ]);
  }

  // plugins -> copy
  if (existsSync(join(opts.cwd, 'public'))) {
    webpackConfig.plugin('copy-public').use(require('copy-webpack-plugin'), [
      [
        {
          from: join(opts.cwd, 'public'),
          to: absOutputPath,
          toType: 'dir',
        },
      ],
    ]);
  }
  if (opts.copy) {
    makeArray(opts.copy).forEach((copy, index) => {
      if (typeof copy === 'string') {
        copy = {
          from: join(opts.cwd, copy),
          to: absOutputPath,
        };
      }
      webpackConfig
        .plugin(`copy-${index}`)
        .use(require('copy-webpack-plugin'), [[copy]]);
    });
  }

  // plugins -> friendly-errors
  const { CLEAR_CONSOLE = 'none' } = process.env;
  webpackConfig
    .plugin('friendly-errors')
    .use(require('friendly-errors-webpack-plugin'), [
      {
        clearConsole: CLEAR_CONSOLE !== 'none',
      },
    ]);

  // externals
  if (opts.externals) {
    webpackConfig.externals(opts.externals);
  }

  // node
  webpackConfig.node.merge({
    setImmediate: false,
    process: 'mock',
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  });

  if (isDev) {
    require('./dev')(webpackConfig, opts);
  } else {
    require('./prod')(webpackConfig, opts);
  }

  if (opts.chainConfig) {
    assert(
      typeof opts.chainConfig === 'function',
      `opts.chainConfig should be function, but got ${opts.chainConfig}`,
    );
    opts.chainConfig(webpackConfig);
  }
  let config = webpackConfig.toConfig();
  if (process.env.SPEED_MEASURE) {
    const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
    const smpOption =
      process.env.SPEED_MEASURE === 'CONSOLE'
        ? { outputFormat: 'human', outputTarget: console.log }
        : {
            outputFormat: 'json',
            outputTarget: join(process.cwd(), 'speed-measure.json'),
          };
    const smp = new SpeedMeasurePlugin(smpOption);
    config = smp.wrap(config);
  }
  return config;
};
