# vue-cli 调研

* babel-preset-app
* cli
  * @vue/cli-shared-utils
  * @vue/cli-ui
  * @vue/cli-ui-addon-webpack
  * @vue/cli-ui-addon-widgets
* cli-plugin-babel
  * @vue/babel-preset-app
  * @vue/cli-shared-utils
* cli-plugin-e2e-cypress
  * @vue/cli-shared-utils
* cli-plugin-e2e-nightwatch
  * @vue/cli-shared-utils
* cli-plugin-eslint
  * @vue/cli-shared-utils
* cli-plugin-pwa
  * @vue/cli-shared-utils
* cli-plugin-router
  * @vue/cli-shared-utils
* cli-plugin-typescript
  * @vue/cli-shared-utils
* cli-plugin-unit-jest
  * @vue/cli-shared-utils
* cli-plugin-unit-mocha
  * @vue/cli-shared-utils
* cli-plugin-vuex
* cli-service
  * @vue/cli-overlay
  * @vue/cli-plugin-router
  * @vue/cli-plugin-vuex
  * @vue/cli-shared-utils
  * @vue/component-compiler-utils
  * @vue/preload-webpack-plugin
  * @vue/web-component-wrapper
* cli-service-global 全局的 cli-service
  * @vue/babel-preset-app
  * @vue/cli-plugin-babel
  * @vue/cli-plugin-eslint
  * @vue/cli-service
* cli-shared-utils
  * chalk, execa, launch-editor, node-ipc, open, ora, request, request-promise-native
  * semver, strip-ansi
* cli-test-utils
* cli-ui
* cli-ui-addon-webpack
* cli-ui-addon-widgets

## babel-preset-app

* @babel/core
* @babel/helper-module-imports
* @babel/plugin-proposal-class-properties
* @babel/plugin-proposal-decorators
* @babel/plugin-syntax-dynamic-import
* @babel/plugin-syntax-jsx
* @babel/plugin-transform-runtime
* @babel/preset-env
* @babel/runtime
* @vue/babel-preset-jsx
* babel-plugin-dynamic-import-node
* core-js
* core-js-compat

## cli

### bin/vue.js

* didYouMean 判断命令拼写错误
* checkNodeVersion 判断 node 版本是否兼容
* commander 命令交互
  * create -> ../lib/create
      * validateProjectName  校验项目名称合法性
      * 判断目录是否存在
      * Creator.js：new Creator().create()
        * 选择预设 (babel，eslint) 或者 手动选择
        * 通过 promptModules/目录下的选项收集 plugins：
        * @vue/cli-service, @vue/cli-plugin-router, @vue/cli-plugin-vuex ...
        * Generator.js: new Generator(plugins).generate()
          * 调用 @vue/cli-service 的 generator 先创建项目
          * 调用各种 plugins 的 generator
        * writeFile package.json
        * ./util/setupDevProject // in development, avoid installation process
        * writeFile readme.md, .npmrc
  * add -> ../lib/add
    * install a plugin and invoke its generator in an already created project
  * invoke -> ../lib/invoke
    * invoke the generator of a plugin in an already created project
  * inspect -> ../lib/inspect
    * inspect the webpack config in a project with vue-cli-service
  * serve -> @vue/cli-service-global
    * serve a .js or .vue file in development mode with zero config
  * build -> @vue/cli-service-global
    * build a .js or .vue file in production mode with zero config
  * ui -> ../lib/ui
    * start and open the vue-cli ui
  * init -> @vue/cli-init
    * generate a project from a remote template (legacy API, requires @vue/cli-init)
  * config -> ../lib/config
    * inspect and modify the config
  * outdated -> ../lib/outdated
    * (experimental) check for outdated vue cli service / plugins
  * upgrade -> ../lib/upgrade
    * (experimental) upgrade vue cli service / plugins
  * info -> envinfo
    * print debugging information about your environment
  * --help

## cli-service

### bin/vue-cli-service.js

* 检查 nodejs 版本
* 接收 process.argv，提取 command 和 args
* ../lib/Service.js：new Service(cwd).run(command, args)
  * constructor()
    * resolvePkg()
    * resolvePlugins()
      * buildInPlugins
        * commands: serve, build, inspect, help
        * config: base, css, prod, app
  * run(name, args, rawArgv)
    * init(mode)
      * loadEnv(mode)
      * loadEnv()
      * loadUserOptions()
        * 读取 vue.config.js
      * apply Plugins
      * apply webpack config from project config file
    * 找到 command 并执行 command.fn()
    
### lib/commands/serve.js

* api.chainWebpack(webpackConfig => {})
  * 非生产环境添加 webpack 配置
  * webpackConfig.devtool('cheap-module-eval-source-map)
  * webpackConfig.plugin('hmr').use(require('webpack/lib/HotModuleReplacementPlugin'))
  * 如果 options.devServer.progress
    * webpackConfig.plugin('progress').use(require('webpack/lib/ProgressPlugin'))
* resolve webpack config
* load user devServer options with higher priority than devServer in webpack config
* expose advanced stats
* entry arg
* resolve server options
  * protocol, host, port, publicPath
* localUrlForBrowser
* prepare proxy
* inject dev & hot-reload middleware entries
* create compiler
  * const compiler = webpack(webpackConfig)
* create server
  * const server = new WebpackDevServer(compiler, config)
    * allow other plugins to register middlewares, e.g. PWA
    * apply in project middlewares
  * log instructions & open browser on first compilation complete
    * copy localUrlForBrowser
    * log server running
    * openBrowser(localUrlForBrowser)
  * server.listen
  * 执行成功回调
  
### lib/commands/build.js

* 判断是不是 app 模式编译
* build()
  * 通过 target 生成不同的 webpackConfig
  * api.resolveWebpackConfig()
  * Expose advanced stats
  * webpack(webpackConfig)
  
### lib/commands/inspect.js

审查一个 Vue CLI 项目的 webpack config
