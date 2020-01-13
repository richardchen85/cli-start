const express = require('express');
const createMock = require('../lib');

const app = express();

createMock({
  cwd: process.cwd(),
  app,
  watch: true, // 是否监听 mock/**.js 文件的变化
});

app.listen(3003);
