const { join } = require('path');
const chalk = require('chalk');
const assert = require('assert');
const debug = require('debug');
const { cloneDeep } = require('lodash');
const { winPath, loadDotEnv } = require('cli-utils');
const getPlugins = require('./getPlugins');

module.exports = class Service {
  constructor({ cwd }) {
    this.cwd = cwd || process.cwd();

    try {
      this.pkg = require(join(this.cwd, 'package.json'));
    } catch (e) {
      this.pkg = {};
    }

    this.commands = {};

    this.config = {};

    this.plugins = this.resolvePlugins();
  }

  resolvePlugins() {
    return getPlugins({ cwd: winPath(this.cwd), plugins: [] });
  }

  initPlugin(plugin) {
    const { apply, opts } = plugin;
    try {
      assert(typeof apply === 'function', `plugin must export a function`);
      const api = {
        service: this,
        cwd: this.cwd,
        config: this.config,
        webpackConfig: this.webpackConfig,
        pkg: this.pkg,
      };
      apply(api, opts);
      plugin._api = api;
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  initPlugins() {
    const plugins = cloneDeep(this.plugins);
    this.plugins = [];
    plugins.forEach(plugin => {
      this.initPlugin(plugin);
      this.plugins.push(plugin);
    });

    // Throw error for methods that can't be called after plugins is initialized
    this.plugins.forEach(plugin => {
      [
        'onOptionChange',
        'register',
        'registerMethod',
        'registerPlugin',
      ].forEach(method => {
        plugin._api[method] = () => {
          throw new Error(
            `api.${method}() should not be called after plugin is initialized.`,
          );
        };
      });
    });
  }

  loadEnv() {
    const basePath = join(this.cwd, '.env');
    const localPath = `${basePath}.local`;
    loadDotEnv(basePath);
    loadDotEnv(localPath);
  }

  init() {
    this.loadEnv();

    this.initPlugins();
  }

  registerCommand(name, opts, fn) {
    if (typeof opts === 'function') {
      fn = opts;
      opts = null;
    }
    opts = opts || {};
    assert(
      !(name in this.commands),
      `Command ${name} exists, please select another one.`,
    );
    this.commands[name] = { fn, opts };
  }

  run(name = 'help', args) {
    this.init();
    return this.runCommand(name, args);
  }

  runCommand(name, args = {}) {
    debug(`command name: ${name}, args: ${JSON.stringify(args)}`);
    const command = this.commands[name];
    if (!command) {
      console.log(
        chalk.red(`Command ${chalk.underline.cyan(name)} dose not exists`),
      );
      process.exit(1);
    }

    const { fn, opts } = command;
    if (opts.webpack) {
      this.webpackConfig = require('cli-webpack/getConfig')(this);
    }

    return fn(args);
  }
};
