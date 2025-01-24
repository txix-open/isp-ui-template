const fs = require('fs');
const packageJson = require('./package.json');

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data));
}

function readHtmlFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeHtmlFile(filePath, data) {
  fs.writeFileSync(filePath, data);
}

const welcomePagePath = 'build/index.html';

let indexHtml = readHtmlFile(welcomePagePath);

const scriptTagRegex = /<script type="module">window\.AppVersion\s*=\s*'.*';<\/script>/;
const scriptTag = `<script type="module">window.AppVersion = '${packageJson.version}';</script>`;
indexHtml = indexHtml
  .replace(scriptTagRegex, '')
  .replace('</head>', `${scriptTag}</head>`);

writeHtmlFile(welcomePagePath, indexHtml);

const versionData = {
  version: packageJson.version,
};

writeJsonFile('build/version.json', versionData);
writeJsonFile('version.json', versionData);
