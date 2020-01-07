const path = require('path');
const bodyParser = require('body-parser');
const Mock = require('mockjs');
const glob = require('glob');
const chokidar = require('chokidar');
const chalk = require('chalk');
const { pathToRegexp } = require('path-to-regexp');
const debug = require('debug')('cli-mock');

module.exports = function createMock({ app, cwd, watch = true }) {
  debug(`app: ${app}, cwd: ${cwd}, watch: ${watch}`);

  const root = cwd + '/mock';

  // 收集所有 mock 文件的配置
  function getUrlMap(mockPath) {
    let urlMap = {};
    glob
      .sync(path.join(mockPath, '**/*.js'))
      .map(file => path.resolve(file))
      .forEach(file => {
        delete require.cache[file];
        try {
          let mockFile = require(file);
          mockFile = mockFile.default || mockFile;
          mockFile = mockFile({
            Mock,
          });
          Object.keys(mockFile).forEach(key => {
            urlMap[key] = mockFile[key];
          });
        } catch (e) {
          console.log(chalk.red(`[mock] fail in file ${file}: \n${e.message}`));
        }
      });
    return urlMap;
  }

  function sendJson(res, data) {
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.end(JSON.stringify(data));
  }

  function sendText(res, data) {
    res.setHeader('Content-Type', 'plain/text;charset=utf-8');
    res.end(data);
  }

  let urlMap = getUrlMap(root);
  debug(`urlMap: ${urlMap}`);

  // 文件变动监听
  if (watch) {
    const watcher = chokidar.watch(root, { ignoreInitial: true });
    watcher.on('all', (event, file) => {
      console.log(chalk.yellow(`[${event}] ${file}, reload mock data`));
      urlMap = getUrlMap(root);
      debug(`urlMap: ${urlMap}`);
    });
  }

  // body-parser middleware
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // mock middleware
  app.use((req, res, next) => {
    req.params = {};
    const urlKey = Object.keys(urlMap).find(key => {
      // 寻找匹配当前 url 的 mock 数据
      const keys = [];

      let pattern = key;
      let method = '';

      // 带有 method 的 key
      if (key.indexOf(' ') > 0) {
        [method, pattern] = key.split(/\s+/);
      }

      // method 不匹配
      if (method && req.method.toLowerCase() !== method.toLowerCase()) {
        return false;
      }

      const matched = pathToRegexp(pattern, keys).exec(req.path);
      // 支持路径参数，附加到 req.params
      if (matched) {
        keys.forEach((key, i) => {
          req.params[key.name] = decodeURIComponent(matched[i + 1]);
        });
      }
      return matched;
    });

    if (urlKey) {
      const data = urlMap[urlKey];
      if (typeof data === 'function') {
        res.json = data => sendJson(res, data);
        data(req, res);
      } else if (typeof data === 'object') {
        sendJson(res, data);
      } else {
        sendText(res, data);
      }
    } else {
      next();
    }
  });
};
