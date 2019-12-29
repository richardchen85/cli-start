const assert = require('assert');
const chalk = require('chalk');
const resolve = require('resolve');
const { winPath } = require('cli-utils');

const debug = require('debug')('cli-service:getPlugin');

module.exports = function getPlugins(opts = {}) {
  const { cwd, plugins = [] } = opts;

  // 内置插件
  const builtInPlugins = [
    './plugins/commands/dev',
    './plugins/commands/build',
    './plugins/commands/version',
    './plugins/commands/help',
    './plugins/mock',
  ];

  const pluginsObj = [
    ...builtInPlugins.map(p => {
      let opts;
      if (Array.isArray(p)) {
        opts = p[1];
        p = p[0];
      }
      const apply = require(p);

      return {
        id: p.replace(/^.\//, 'built-in:'),
        apply,
        opts,
      };
    }),
    ...getUserPlugins(plugins, { cwd }),
  ];

  debug(`plugins: \n${pluginsObj.map(p => `  ${p.id}`).join('\n')}`);
  return pluginsObj;
};

function pluginToPath(plugins, { cwd }) {
  return (plugins || []).map(p => {
    assert(
      Array.isArray(p) || typeof p === 'string',
      `Plugin config should be String or Array, but got ${chalk.red(typeof p)}`,
    );
    if (typeof p === 'string') {
      p = [p];
    }
    const [path, opts] = p;
    try {
      return [
        winPath(
          resolve.sync(path, {
            basedir: cwd,
          }),
        ),
        opts,
      ];
    } catch (e) {
      throw new Error({
        code: 'ERR_CORE_PLUGIN_RESOLVE_FAILED',
        message: `Plugin ${chalk.underline.cyan(path)} can't be resolved`,
      });
    }
  });
}

function getUserPlugins(plugins, { cwd }) {
  const pluginPaths = pluginToPath(plugins, { cwd });

  return pluginPaths.map(p => {
    const [path, opts] = p;
    let apply;
    try {
      apply = require(path);
    } catch (e) {
      throw new Error({
        code: 'ERR_CORE_PLUGIN_INITIALIZE_FAILED',
        message: `Plugin ${chalk.cyan.underline(
          path,
        )} execute failed\n\n${chalk.white(e)}`,
      });
    }
    return {
      id: path.replace(makesureLastSlash(cwd), 'user:'),
      apply: apply.default || apply,
      opts,
    };
  });
}

function makesureLastSlash(path) {
  return path.slice(-1) === '/' ? path : `${path}/`;
}
