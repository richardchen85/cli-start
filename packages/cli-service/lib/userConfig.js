const { join } = require('path');
const { existsSync } = require('fs');
const chalk = require('chalk');
const chokidar = require('chokidar');
const { assign } = require('lodash');

module.exports = {
  getUserConfig({ cwd, defaultConfig = {} }) {
    const absConfigFile = this.getConfigFile(cwd);
    if (absConfigFile) {
      return this.getConfigByConfigFile(absConfigFile, {
        defaultConfig,
      });
    } else {
      return {};
    }
  },

  getConfigFile(cwd) {
    const configFile = join(cwd, '.clirc.js');
    return existsSync(configFile) ? configFile : '';
  },

  getConfigByConfigFile(configFile, opts = {}) {
    const { defaultConfig } = opts;

    return assign({}, defaultConfig, require(configFile));
  },

  cleanConfigRequiredCache(cwd) {
    const absConfigFile = this.getConfigFile(cwd);
    delete require.cache[absConfigFile];
  },

  watchConfigFile({ cwd, onChange }) {
    const absConfigFile = this.getConfigFile(cwd);
    const watcher = chokidar.watch(absConfigFile, { ignoreInitial: true });
    watcher.on('all', (event, file) => {
      console.log(chalk.yellow(`config file: ${file} changed`));
      this.cleanConfigRequiredCache(cwd);
      onChange(this.getUserConfig({ cwd }));
    });
  },
};
