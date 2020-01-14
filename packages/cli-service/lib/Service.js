const { join } = require('path');
const chalk = require('chalk');
const assert = require('assert');
const debug = require('debug');
const { winPath, loadDotEnv } = require('cli-utils');
const getPlugins = require('./getPlugins');
const userConfig = require('./userConfig');

module.exports = class Service {
  constructor({ cwd }) {
    this.cwd = cwd || process.cwd();

    try {
      this.pkg = require(join(this.cwd, 'package.json'));
    } catch (e) {
      this.pkg = {};
    }

    this.commands = {};
    this.config = userConfig.getUserConfig({ cwd: this.cwd });
    this.hooks = {
      baseWebpackConfig: [],
      modifyWebpackConfig: [],
      chainConfig: [], // webpackChainConfig
      onStart: [],
      _beforeServerWithApp: [],
      beforeMiddlewares: [],
      afterMiddlewares: [],
      beforeServer: [],
      afterServer: [],
      onFail: [],
      onCompileDone: [],
      onBuildSuccess: [],
      onBuildFail: [],
    };

    this.plugins = this.resolvePlugins();
  }

  resolvePlugins() {
    try {
      assert(
        Array.isArray(this.config.plugins || []),
        `Configure item ${chalk.underline.cyan(
          'plugins',
        )} should be Array, but got ${chalk.red(typeof this.config.plugins)}`,
      );
      return getPlugins({
        cwd: winPath(this.cwd),
        plugins: this.config.plugins || [],
      });
    } catch (e) {
      console.log(chalk.red(e));
      process.exit(1);
    }
  }

  initPlugins() {
    this.plugins.forEach(({ id, apply, opts }) => {
      try {
        assert(typeof apply === 'function', `plugin must export a function`);
        const api = {
          debug: debug(`cli-plugin: ${id}`),
          service: this,
          cwd: this.cwd,
          config: this.config,
          webpackConfig: this.webpackConfig,
          pkg: this.pkg,
        };
        apply(api, opts);
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    });
  }

  applyHooks(key, opts = {}) {
    debug(`apply hooks ${key}`);
    return (this.hooks[key] || []).reduce((memo, fn) => {
      try {
        return fn({
          memo,
          args: opts.args,
        });
      } catch (e) {
        console.error(chalk.red(`hook apply failed: ${e.message}`));
        throw e;
      }
    }, opts.initialValue);
  }

  registerHook(key, fn) {
    assert(Array.isArray(this.hooks[key]), `hook: ${key} is not exists`);
    this.hooks[key].push(fn);
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
      this.webpackConfig = require('./getWebpackConfig')(this, {
        watch: args.w || args.watch,
      });
    }

    return fn(args);
  }
};
