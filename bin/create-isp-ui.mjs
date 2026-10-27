#!/usr/bin/env node
import { createInterface } from 'node:readline/promises'

import {
  createProject,
  installDependencies,
  presets
} from '../generator/create-project.mjs'

const help = `Create an ISP UI project (Node.js 24)

  npm run create -- <directory> [options]
  node /path/to/isp-ui-template/bin/create-isp-ui.mjs <directory> [options]

  --preset <minimal|isp-app|isp-admin>  Default: minimal
  --name <npm-name>                    Default: directory basename
  --title <title>                      Default: package name
  --public-path </path/>               Default: /; never inferred from names
  --api-upstream <http(s)://host:port>  Enable production nginx proxy
  --install                           Run npm ci after creation
  --no-install                        Files only (default)
  --yes                               Skip prompts
  --help, -h                          Usage

Existing directories are refused. No Git operations or npm publication.
`

function parseArgs(args) {
  const options = {}
  const seen = new Set()
  const values = new Map([
    ['preset', 'preset'],
    ['name', 'name'],
    ['title', 'title'],
    ['public-path', 'publicPath'],
    ['api-upstream', 'apiUpstream']
  ])
  for (let index = 0; index < args.length; index++) {
    const argument = args[index]
    if (argument === '--help' || argument === '-h') {
      options.help = true
      continue
    }
    if (['--install', '--no-install', '--yes'].includes(argument)) {
      const key = argument === '--yes' ? 'yes' : 'install'
      if (seen.has(key)) throw new Error(`Duplicate option: ${argument}`)
      seen.add(key)
      options[key] = argument !== '--no-install'
      continue
    }
    if (argument.startsWith('--')) {
      const equals = argument.indexOf('=')
      const flag = equals < 0 ? argument.slice(2) : argument.slice(2, equals)
      const key = values.get(flag)
      if (!key) throw new Error(`Unknown option: --${flag}`)
      if (seen.has(key)) throw new Error(`Duplicate option: --${flag}`)
      seen.add(key)
      const value = equals < 0 ? args[++index] : argument.slice(equals + 1)
      if (value === undefined || value.startsWith('--') || !value.trim())
        throw new Error(`Option --${flag} requires a value`)
      options[key] = value
      continue
    }
    if (argument.startsWith('-')) throw new Error(`Unknown option: ${argument}`)
    if (options.directory !== undefined)
      throw new Error('Specify one project directory')
    options.directory = argument
  }
  return options
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    console.log(help)
    return
  }
  if (!options.yes && process.stdin.isTTY && process.stdout.isTTY) {
    const prompt = createInterface({
      input: process.stdin,
      output: process.stdout
    })
    try {
      options.directory ??=
        (await prompt.question('Project directory [my-isp-app]: ')).trim() ||
        'my-isp-app'
      if (!options.preset) {
        console.log(
          '1. minimal: small SPA\n2. isp-app: custom ISP shell\n3. isp-admin: AdminBase'
        )
        const choice = (await prompt.question('Preset [1]: ')).trim() || '1'
        options.preset = presets[Number(choice) - 1] || choice
      }
      if (!options.title)
        options.title =
          (await prompt.question('App title [package name]: ')).trim() ||
          undefined
      if (!options.publicPath)
        options.publicPath =
          (await prompt.question('Public path [/]: ')).trim() || '/'
    } finally {
      prompt.close()
    }
  }
  if (!options.directory)
    throw new Error('Specify a new directory. Usage: npm run create -- --help')
  const result = await createProject(options)
  if (options.install) await installDependencies(result.directory)
  console.log(
    `\nCreated ${result.name} (${result.preset}) in ${result.directory}`
  )
  const quote = (value) => `'${value.replace(/'/g, "'\\''")}'`
  console.log(
    `\n  cd ${quote(result.directory)}\n${options.install ? '' : '  npm ci\n'}  ${result.command}`
  )
  console.log(`\n  http://localhost:${result.port}${result.publicPath}`)
  if (result.preset !== 'minimal')
    console.log(
      '  Demo: editor@example.test or viewer@example.test, password demo.'
    )
  console.log(
    `\nDocker: /opt/msp/${result.deploymentName}${result.publicPath}; nginx: cfg/${result.nginxConfig}.`
  )
}

main().catch((error) => {
  console.error(`Error: ${error.message}`)
  process.exitCode = 1
})
