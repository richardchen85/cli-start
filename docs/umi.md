# umi

* af-webpack
* babel-preset-umi
* eslint-config-umi
* umi
* umi-build-dev
* umi-core
* umi-mock
* umi-plugin-auto-externals
* umi-plugin-dll
* umi-plugin-hd
* umi-plugin-locale
* umi-plugin-modern-mode
* umi-plugin-react
* umi-plugin-ui
* umi-serve
* umi-test
* umi-types
  * typescript types define
* umi-ui
* umi-ui-tasks
* umi-ui-theme
* umi-utils

## umi

* bin/umi.js
* src/
  * scripts/
    * build.js
    * dev.js
    * inspect.js
    * realDev.js
    * test.js
    * ui.js
  * babel.js
  * buildDevOpts.js
  * cli.js
  * index.js
  * utils.js
  * ...
* ...react组件

### bin/umi.js

require('../src/cli.js');

### src/cli.js

* Node version check
* Notify update when process exits
* scripts alias: -v --version, -h --help
* Service = require('umi-build-dev')
* switch scripts
  * build, dev, test, inspect, ui -> require('./scripts/${script}')
    * build.js
      * process.env.NODE_ENV = 'production'
      * new Service(buildDevOpts(args)).run('build', args);
    * dev.js
      * realDev.js
    * realDev.js
      * process.env.NODE_ENV = 'development'
      * new Service(buildDevOpts(args)).run('dev', args);
    * inspect.js
      * args.mode 决定 NODE_ENV
      * process.env.NODE_ENV = 'xxx'
      * new Service(buildDevOpts(args)).run('inspect', args);
    * test.js
      * process.env.NODE_ENV = 'development'
      * new Service(buildDevOpts(args)).run('test', args);
    * ui.js
      * new require('umi-ui/src/UmiUI').start()
  * default: new Service(buildDevOpts(args)).run(script)

## umi-build-dev

### src/Service.js

* constructor({ cwd })
  * this.pkg = require(join(this.cwd, 'package.json'))
  * registerBabel({ cwd })
    * require('af-webpack/registerBabel)()
    * 主要是预设一些 babel 配置
  * this.commands = {}
  * this.pluginHooks = {}
  * this.generators = {}
  * this.UmiError = UmiError
  * this.config = UserConfig.getConfig({ cwd, service: this })
    * service.applyPlugins('modifyDefaultConfig')
    * 获取默认的用户配置
  * this.plugins = this.resolvePlugins()
  * this.extraPlugins = []
  * this.paths = getPaths(this)
    * 'umi-core/src/getPaths.ts': 各种文件的 path
    * 各种模板文件的 path
* resolvePlugins()
  * require('./getPlugins.js')({ cwd, plugins })
    * 内置插件
      * './plugins/commands/dev',
      * './plugins/mock'
      * ...
    * getUserPlugins() 嵌入用户定义的插件
    * 插件配置： ['/path/to/plugin.js', opts]
    * 每个插件是 { id, apply: require('plugins.js'), opts } 
  * 合并 this.config.plugins
* registerCommand(name, opts, fn)
  * this.commands[name] = { fn, opts }
* run(name = 'help', args)
  * this.init()
    * this.loadEnv()
      * loadDotEnv('.env')
      * loadDotEnv('.env.local')
    * this.initPlugins()
      * this.plugins.map(plugin => this.initPlugin(plugin))
        * 运行每个 plugin 初始化函数
        * { id, apply, opts } = plugin
        * api = new PluginApi(id, this)
        * api.onOptionChange = fn => plugin.onOptionChange = fn
        * apply(api, opts)
        * plugin._api = api
    * reload user config
    * userConfig = new UserConfig(this)
    * merge(this.config, userConfig.getConfig())
  * this.runCommand(name, args)
* runCommand(rawName, rawArgs = {}, remoteLog)
  * command = this.commands[name]
  * 判断 command 是否存在
  * { fn, opts } = command
  * if (opts.webpack)
    * this.webpackConfig = require('./getWebpackConfig')
  * return fn(args, { remoteLog })

