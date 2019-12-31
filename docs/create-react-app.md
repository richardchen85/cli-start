# create-react-app

* babel-plugin-named-asset-import
* babel-preset-react-app
* cra-template
* cra-template-typescript
* create-react-app
* eslint-config-react-app
* react-app-polyfill
  * ie9, ie11, jsdom, stable
* react-dev-utils
  * browserHelper, chalk, checkRequiredFiles, clearConsole, crossSpawn, errorOverlayMiddleware
  * eslintFormatter, evalSourceMapMiddleware, FileSizeReporter, ForkTsCheckerWebpackPlugin
  * formatWebpackMessages, getCacheIdentifier, getCSSModuleLocalIdent, getProcessForPort, globby
  * ignoredFiles, immer, InlineChunkHtmlPlugin, inquirer, InterpolateHtmlPlugin, launchEditor
  * launchEditorEndpoint, ModuleNotFoundPlugin, ModuleScopePlugin, noopServiceWorkerMiddleware
  * openBrowser, openChrome.applescript, printBuildError, printHostingInstructions
  * typescriptFormatter, WatchMissingNodeModulesPlugin, WebpackDevServerUtiles
  * webpackHotDevClient
* react-error-overlay
* react-scripts

## babel-preset-react-app

* @babel/core
* @babel/plugin-proposal-class-properties
* @babel/plugin-proposal-decorators
* @babel/plugin-proposal-nullish-coalescing-operator
* @babel/plugin-proposal-numeric-separator
* @babel/plugin-proposal-object-rest-spread
* @babel/plugin-proposal-optional-chaining
* @babel/plugin-syntax-dynamic-import
* @babel/plugin-transform-destructuring
* @babel/plugin-transform-flow-strip-types
* @babel/plugin-transform-react-display-name
* @babel/plugin-transform-runtime
* @babel/preset-env
* @babel/preset-react
* @babel/preset-typescript
* @babel/runtime
* babel-plugin-dynamic-import-node
* babel-plugin-macros
* babel-plugin-transform-react-remove-prop-types

## create-react-app

### useage

`create-react-app <project-directory> [options]`

options: verbose, scriptVersion, template, useNpm, usePnp, typescript

> typescript 选项已废弃，通过 template 决定要使用哪个模板创建项目

createApp(name, verbose, version, template, useNpm, usePnp, useTypescript)
  * 检查 nodejs 版本
  * 安全地创建项目目录
  * write package.json
  * run(root, appName, version, verbose, originalDirectory, template, useYarn, usePnp)
    * getInstallPackage
      * react-scripts
    * getTemplateInstallPackage
      * cra-template
    * allDependencies: 'react', 'react-dom', packageToInstall
    * 获取要安装的依赖的信息：packageInfo, templateInfo
    * 检查依赖是否存在
    * 检查依赖的版本
    * install(root, useYarn, usePnp, allDependencies, verbose, isOnline)
      * 构建安装命令，用 npm install 或者 yarn add
      * 运行安装命令
    * install 成功
      * 检查 react-scripts 和 当前 nodejs 版本是否匹配
      * 执行 react-scripts/scripts/init.js
    * install 出错删除已创建的文件
    
## react-scripts

scripts: build, eject, init, start, test

* bin/react-scripts.js
* config
  * jest...
  * env.js
  * webpack.config.js...
* lib
  * react-app.d.ts
* scripts
  * utils...
  * build.js
  * eject.js
  * init.js
  * start.js
  * test.js
* template 普通项目模板
* template-typescript typescript 项目模板

### bin/react-scripts.js

* 通过 argv 获取 script 和 args
* const result = spawn.sync('node', '../scripts/xxx ...args')
* 通过 result.signal 判断进程结束原因
* ../scripts/build.js
  * require('../config/env')
    * dotenvFiles: .env.local, .env
  * 文件太大时要警告
  * 如果要 require 的文件不存在，警告并退出
  * 获取通用配置 configFactory('production')
    * ../config/webpack.config.js
    * getStyleLoaders()
    * return { ...webpackConfig }
      * entry: isEnvDevelopment && require.resolve('react-dev-utils/webpackHotDevClient'),
  * const { checkBrowsers } = require('react-dev-utils/browsersHelper');
  * checkBrowser()
  * copyPublicFolder()
  * build()
    * const compiler = webpack(config);
    * compiler.run()
  * printFileSizesAfterBuild()
  * printHostingInstructions()
* ../scripts/eject.js
* ../scripts/init.js
  * function(appPath, appName, verbose, originalDirectory, templateName)
  * appPackage = {}
  * 检查以 templateName 为名的模板项目是否存在
  * templatePath = '../cra-template[-typescript]'
  * appPackage.dependencies
  * appPackage.scripts
  * appPackage.eslintConfig
  * appPackage.browserlist
  * writeFile package.json
  * writeFile readme.md
  * copy templatePath to appPath
  * create .gitignore
  * 判断使用 npm install 或者 yarn add
  * 初始化 git
* ../scripts/start.js
  * require('../config/env')
    * dotenvFiles: .env.local, .env
  * 检查 appHtml 和 appIndexJs 是否存在
  * 获取 port
  * 获取 host
  * const { checkBrowsers } = require('react-dev-utils/browsersHelper');
  * checkBrowser()
  * choosePort(port)
  * 获取通用配置 configFactory('development')
    * ...上面有
  * const compiler = createCompiler({})
    * require('react-dev-utils/WebpackDevServerUtils')
    * function createCompiler(webpack, config, appName, urls, useYarn)
    * compiler = webpack(config, handleCompile)
  * load proxy config
  * prepareProxy()
  * const serverConfig = createDevServerConfig()
    * return devServerConfig = {}
      * before(app, server) {}
        * require(proxySetup)(app)
        * app.use(evalSourceMapMiddleware(server))
        * app.use(errorOverlayMiddleware());
        * app.use(noopServiceWorkerMiddleware());
  * const devServer = new WebpackDevServer(compiler, serverConfig)
  * devServer.listen(port, host, err => {})
  * isInteractive && clearConsole()
  * openBrowser()
* ../scripts/test.js
  * require('../config/env')
  * ...
  * jest.run


