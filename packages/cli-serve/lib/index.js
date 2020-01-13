const os = require('os');
const yParser = require('yargs-parser');
const chalk = require('chalk');

const args = yParser(process.argv.slice(2));
if (args.v || args.version) {
  console.log(require('../package.json').version);
  process.exit(0);
}

// update check...

const express = require('express');
const compression = require('compression');
const clipboardy = require('clipboardy');
const port = process.env.PORT || 4000;
const cwd = process.cwd();

const app = express();

// Gzip support
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        // don't compress responses with this request header
        return false;
      }
      // fallback to standard filter function
      return compression.filter(req, res);
    },
  }),
);

// mock support
require('cli-mock')({
  cwd,
  app,
});

app.use(require('serve-static')('dist'));

app.listen(port, () => {
  const ip = getNetworkAddress();
  const localAddress = `http://localhost:${port}`;
  const networkAddress = `http://${ip}:${port}`;
  const message = [
    chalk.green("Serving your project's dist directory!"),
    '',
    `${chalk.bold(`- Local:`)}            ${localAddress}`,
    `${chalk.bold('- On Your Network:')}  ${networkAddress}`,
    '',
    `${chalk.grey('Copied local address to clipboard!')}`,
  ];
  if (process.platform !== `linux` || process.env.DISPLAY) {
    clipboardy.writeSync(localAddress);
  }
  console.log(message.join('\n'));
});

function getNetworkAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const it of interfaces[name]) {
      const { address, family, internal } = it;
      if (family === 'IPv4' && !internal) {
        return address;
      }
    }
  }
}
