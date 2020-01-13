# cli-mock

express 的接口数据模拟中间件，支持使用 [mockjs](https://github.com/nuysoft/Mock) 快速生成模拟数据，内置 `body-parser` 来读取 `request.body` 的内容。

## 开始使用

创建模拟数据

```javascript
// ./mock/index.js
module.exports = ({ Mock }) => ({
  '/api/test1': {
    success: true,
    data: '/api/test1',
  },
  '/api/test2': {
    success: true,
    data: Mock.mock({
      'list|1-10': [
        {
          'id|+1': 1,
        },
      ],
    }),
  },
});
```

在 express 中启用

```javascript
const express = require('express');
const createMock = require('cli-mock');

const app = express();

createMock({
  cwd: process.cwd(),
  app,
  watch: true // 是否监听 mock/**.js 文件的变化
});

app.listen(3000);
```
