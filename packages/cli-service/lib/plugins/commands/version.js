module.exports = function version(api) {
  api.service.registerCommand(
    'version',
    {
      description: 'show related versions',
    },
    args => {
      if (args.verbos) {
        const versions = [
          `cli-service@${process.env.CLI_VERSION}`,
          `${process.platform}`,
          `node@${process.version}`,
          `cli-webpack@${require('cli-webpack/package').version}`,
        ];
        versions.forEach(version => {
          console.log(version);
        });
      } else {
        console.log(process.env.CLI_VERSION);
      }
    },
  );
};
