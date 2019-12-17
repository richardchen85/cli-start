const { readFileSync, existsSync } = require('fs');
const { parse } = require('dotenv');

module.exports = function loadDotEnv(envPath) {
  if (existsSync(envPath)) {
    const parsed = parse(readFileSync(envPath, 'utf-8')) || {};
    Object.keys(parsed).forEach(key => {
      if (!process.env.hasOwnProperty(key)) {
        process.env[key] = parsed[key];
      }
    });
  }
};
