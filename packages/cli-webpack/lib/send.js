const debug = require('debug')('cli-webpack:send');

module.exports = {
  DONE: 'DONE',
  ERROR: 'ERROR',
  STATS: 'STATS',
  STARTING: 'STARTING',
  RESTART: 'RESTART',
  send(message) {
    if (process.send) {
      debug(`send ${JSON.stringify(message)}`);
      process.send(message);
    }
  },
};
