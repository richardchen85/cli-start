# vue-cli 调研

## cli

### bin/vue.js

didYouMean 判断命令拼写错误

checkNodeVersion 判断 node 版本是否兼容

commander 命令交互

* create -> ../lib/create
* add -> ../lib/add
* invoke -> ../lib/invoke
* inspect -> ../lib/inspect
* serve -> @vue/cli-service-global
* build -> @vue/cli-service-global
* ui -> ../lib/ui
* init -> @vue/cli-init
* config -> ../lib/config
* outdated -> ../lib/outdated
* upgrade -> ../lib/upgrade
* info -> envinfo
* --help

### lib/create.js

validateProjectName  校验项目名称合法性

判断目录是否存在

Creator.js 创建项目：new Creator().create()

#### Creator.js

选择预设 (babel，eslint) 或者 手动选择

writeFile package.json

// in development, avoid installation process
./util/setupDevProject

writeFile readme.md, .npmrc
