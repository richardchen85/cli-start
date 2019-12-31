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



