const semver = require('semver');
const chalk = require('chalk');
const yParser = require('yargs-parser');
const packageInfo = require('../package.json');

const script = process.argv[2];
const args = yParser(process.argv.slice(3));

// 检查 node 版本
const nodeVersion = process.version;
const requiredVersion = packageInfo.engines.node;
if (!semver.satisfies(nodeVersion, requiredVersion)) {
  console.log(
    chalk.red(`Node version must ${requiredVersion}, but got ${nodeVersion}`),
  );
  process.exit(1);
}

// 检查 cli 是否最新版本
require('./upgradeChecker')(packageInfo.version);

// 接收命令行参数，参数较验，执行对应命令
const aliasMap = {
  '-v': 'version',
  '--version': 'version',
  '-h': 'help',
  '--help': 'help',
};

switch (script) {
  case 'dev':
  case 'build':
    require(`./scripts/${script}`);
    break;
  default: {
    const Service = require('./Service');
    new Service().run(aliasMap[script] || script, args);
  }
}
