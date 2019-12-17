const chalk = require('chalk');

module.exports = function help(api) {
  const { service } = api;
  service.registerCommand(
    'help',
    {
      hide: true,
    },
    args => {
      const helpInfo = service.commands;
      const command = args._[0];
      if (!command) {
        logMainHelp(helpInfo);
      } else {
        logHelpFormCommand(command, helpInfo);
      }
    },
  );
};

function logMainHelp(helpInfo) {
  console.log(`\n Usage: <command> [options]\n`);
  console.log(`  Commands:\n`);
  for (const name in helpInfo) {
    const opts = helpInfo[name].opts || {};
    if (opts.hide !== true) {
      console.log(`    ${chalk.green(name)}    ${opts.description || ''}`);
    }
  }
  console.log(
    `\n  run ${chalk.blue(
      'help [command]',
    )} for usage of a specific command.\n`,
  );
}

function logHelpFormCommand(name, helpInfo) {
  if (!helpInfo || !helpInfo[name]) {
    console.log(chalk.red(`\n  command "${name}" does not exist.`));
  } else {
    const opts = helpInfo[name].opts || {};
    if (opts.usage) {
      console.log(`\n  Usage: ${opts.usage}`);
    }
    if (opts.options) {
      console.log(`\n  Options:\n`);
      for (const name in opts.options) {
        console.log(`    ${chalk.green(name)}    ${opts.options[name]}`);
      }
    }
    if (opts.details) {
      console.log();
      console.log(
        opts.details
          .split('\n')
          .map(line => `  ${line}`)
          .join('\n'),
      );
    }
    console.log();
  }
}
