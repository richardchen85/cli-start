module.exports = function dev(api) {
  const { service, cwd } = api;

  service.registerCommand(
    'build',
    {
      webpack: true,
      description: 'building for production',
    },
    () => {
      process.env.NODE_ENV = 'production';
      service.applyHooks('onStart');
      require('cli-webpack/dev')({
        cwd,
        webpackConfig: service.webpackConfig,
        onSuccess({ stats }) {
          service.applyHooks('onBuildSuccess', { args: { stats } });
        },
        onFail({ err, stats }) {
          service.applyHooks('onBuildFail', {
            args: {
              err,
              stats,
            },
          });
        },
      });
    },
  );
};
