const yParser = require('yargs-parser');
const buildDevOpts = require('../buildDevOpts');
const Service = require('../Service');

const args = yParser(process.argv.slice(2));
const opts = buildDevOpts(args);

process.env.NODE_ENV = 'production';

new Service(opts).run('build', args);
