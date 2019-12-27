const chalk = require('chalk');
const request = require('superagent');

module.exports = async localVersion => {
  try {
    const { body, status } = await request
      .get('http://registry.m.jd.com/@jd/ola-cli')
      .timeout(2000);
    if (status === 200) {
      const latest = body['dist-tags']['latest'].split('.');
      const current = localVersion.split('.');

      if (latest[0] !== current[0]) {
        console.log(`\n`);
        console.log(
          chalk.yellow(
            `感谢使用 ola cli, 我们现已对 ola cli 进行了 Major 升级，请前往官网查看: http://ui.ola.jd.com`,
          ),
        );
        console.log(`\n`);
      } else if (latest[1] !== current[1] || latest[2] !== current[2]) {
        console.log(`\n`);
        console.log(
          chalk.yellow(
            `感谢使用 ola cli, 版本现已更新至 ${latest.join('.')}, 推荐升级:`,
          ),
        );
        console.log(
          `npm update -g @jd/ola-cli --registry=http://registry.m.jd.com`,
        );
        console.log(`\n`);
      }
    }
  } catch (e) {
    // no-empty
  }
};
