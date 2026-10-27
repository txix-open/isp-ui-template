const { writeFileSync } = require('node:fs')
const { version } = require('./package.json')
writeFileSync('build/version.json', JSON.stringify({ version }) + '\n')
