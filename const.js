const fs = require('fs');
const path = require('path');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  //loginHtml: 'login.html',
  mainHtml: 'src/index.html',
  theme: {
    'primary-color': '#0FCFBF',
    '@icon-url': '~app/fonts/iconfont/iconfont',
  },
};
