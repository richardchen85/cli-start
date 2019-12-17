const { join, isAbsolute } = require('path');
const isWindows = require('is-windows');
const { winPath, loadDotEnv } = require('cli-utils');

module.exports = function(opts = {}) {
  loadEnv();

  let cwd = opts.cwd || process.env.APP_ROOT || process.cwd();
  if (cwd) {
    if (!isAbsolute(cwd)) {
      cwd = join(process.cwd(), cwd);
    }
    cwd = winPath(cwd);
    // 原因：webpack 的 include 规则得是 \ 才能判断出是绝对路径
    if (isWindows()) {
      cwd = cwd.replace(/\//g, '\\');
    }
  }

  return {
    cwd,
  };
};

function loadEnv() {
  const basePath = join(process.cwd(), '.env');
  const localPath = `${basePath}.local`;
  loadDotEnv(basePath);
  loadDotEnv(localPath);
}
