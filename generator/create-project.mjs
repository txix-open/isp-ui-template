import { spawn } from 'node:child_process'
import {
  cp,
  lstat,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile
} from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { normalizeBasePath } from '../scripts/config.mjs'

import { configureDeployment, normalizeUpstream } from './deployment.mjs'

export const templateRoot = fileURLToPath(new URL('../', import.meta.url))
export const presets = ['minimal', 'isp-app', 'isp-admin']
const files = [
  'package.json',
  'package-lock.json',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.node.json',
  'eslint.config.js',
  '.prettierrc',
  '.prettierignore',
  '.gitignore',
  '.nvmrc',
  '.browserslistrc',
  '.dockerignore',
  'Dockerfile',
  'entrypoint.sh',
  'index.html',
  '.env.example',
  'generateVersionFile.cjs'
]
const directories = ['src', 'cfg', 'public', 'scripts', '.husky', 'demo']
const protectedDirectories = [
  ...directories,
  'presets',
  'bin',
  'generator',
  'docs',
  '.git',
  '.agents',
  '.codex',
  'node_modules',
  'build'
]
const excluded = new Set([
  'node_modules',
  '.git',
  '.idea',
  '.agents',
  '.codex',
  'build',
  'dist',
  'coverage',
  '.cache',
  'test-results'
])

const json = (value) => `${JSON.stringify(value, null, 2)}\n`
const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ]
  )
const escapeMarkdown = (value) =>
  value.replace(/[\\`*_{}[\]()#+.!|<>]/g, '\\$&')

function isWithin(parent, target) {
  const relative = path.relative(parent, target)
  return (
    relative === '' ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== '..' &&
      !path.isAbsolute(relative))
  )
}

async function exists(file) {
  try {
    await lstat(file)
    return true
  } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}

// Resolve existing parent symlinks before creating the target.
async function canonicalTarget(target) {
  const missing = []
  let current = target
  while (!(await exists(current))) {
    missing.unshift(path.basename(current))
    const parent = path.dirname(current)
    if (parent === current) throw new Error('Cannot resolve project directory')
    current = parent
  }
  return path.join(await realpath(current), ...missing)
}

function validateName(name) {
  if (
    name.length > 214 ||
    !/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(name) ||
    ['node_modules', 'favicon.ico'].includes(name)
  ) {
    throw new Error(
      'Invalid npm name: use lowercase letters, digits, hyphens, dots or underscores (my-app or @team/my-app). Use --name to override the directory name.'
    )
  }
}

async function copyEntry(source, destination, required = false) {
  if (!(await exists(source))) {
    if (required)
      throw new Error(`Missing template file: ${path.basename(source)}`)
    return
  }
  await cp(source, destination, {
    recursive: true,
    errorOnExist: true,
    force: false,
    filter: async (entry) => {
      const name = path.basename(entry)
      if (
        excluded.has(name) ||
        (name.startsWith('.env') && name !== '.env.example') ||
        name === 'version.json' ||
        name === '_'
      )
        return false
      if (/^generator.*\.test\.mjs$/.test(name)) return false
      if ((await lstat(entry)).isSymbolicLink())
        throw new Error(
          `Cannot copy symlink: ${path.relative(templateRoot, entry)}`
        )
      return true
    }
  })
}

function setEnvValue(contents, key, value) {
  const line = `${key}=${value}`
  const pattern = new RegExp(`^${key}=.*$`, 'm')
  return pattern.test(contents)
    ? contents.replace(pattern, line)
    : `${contents.trimEnd()}\n${line}\n`
}

export async function createProject(options) {
  const { preset = 'minimal', cwd = process.cwd() } = options
  if (!presets.includes(preset))
    throw new Error(
      `Unknown preset: ${preset}. Available: ${presets.join(', ')}`
    )
  if (typeof options.directory !== 'string' || !options.directory.trim())
    throw new Error('Specify a new project directory')
  const directory = path.resolve(cwd, options.directory)
  const name = options.name ?? path.basename(directory)
  validateName(name)
  const title = (options.title ?? name).trim()
  if (!title || title.length > 120 || /\p{Cc}/u.test(title))
    throw new Error('App title must be a single line of 1–120 characters')
  const publicPath = normalizeBasePath(options.publicPath ?? '/')
  const apiUpstream = normalizeUpstream(options.apiUpstream)
  if (await exists(directory))
    throw new Error(
      `Directory already exists: ${directory}. Choose a new directory; existing files are never overwritten.`
    )
  const canonical = await canonicalTarget(directory)
  const root = await realpath(templateRoot)
  if (
    canonical === root ||
    protectedDirectories.some((entry) =>
      isWithin(path.join(root, entry), canonical)
    )
  ) {
    throw new Error(
      'Cannot create a project inside template source trees or service directories'
    )
  }
  const source =
    preset === 'minimal'
      ? templateRoot
      : path.join(templateRoot, 'presets', preset)
  // Validate manifest and lockfile before creating output.
  const metadata = JSON.parse(
    await readFile(path.join(source, 'package.json'), 'utf8')
  )
  const lock = JSON.parse(
    await readFile(path.join(source, 'package-lock.json'), 'utf8')
  )
  if (lock.lockfileVersion !== 3 || !lock.packages?.[''])
    throw new Error('Template requires a current npm lockfile v3')
  await mkdir(path.dirname(directory), { recursive: true })
  await mkdir(directory) // Non-recursive: atomically refuse a concurrently created target.
  try {
    for (const file of files)
      await copyEntry(
        path.join(source, file),
        path.join(directory, file),
        [
          'package.json',
          'package-lock.json',
          'vite.config.ts',
          'index.html',
          '.env.example'
        ].includes(file)
      )
    for (const entry of directories)
      await copyEntry(
        path.join(source, entry),
        path.join(directory, entry),
        entry === 'src'
      )
    if (preset !== 'minimal')
      await copyEntry(path.join(source, 'docs'), path.join(directory, 'docs'))

    const deployment = await configureDeployment(directory, {
      name,
      publicPath,
      apiUpstream
    })

    metadata.name = name
    metadata.version = '0.1.0'
    metadata.config = { ...metadata.config, appName: title }
    delete metadata.scripts.create
    delete metadata.scripts['test:docker']
    delete metadata.bin
    if (preset === 'minimal') {
      metadata.scripts.lint = 'eslint src scripts --max-warnings 0'
      metadata.scripts.format = 'prettier --write src scripts vite.config.ts'
      metadata.scripts['format:check'] =
        'prettier --check src scripts vite.config.ts'
    }
    lock.name = name
    lock.version = metadata.version
    lock.packages[''].name = name
    lock.packages[''].version = metadata.version
    delete lock.packages[''].bin
    await writeFile(path.join(directory, 'package.json'), json(metadata))
    await writeFile(path.join(directory, 'package-lock.json'), json(lock))
    const examplePath = path.join(directory, '.env.example')
    let example = await readFile(examplePath, 'utf8')
    example = setEnvValue(example, 'PUBLIC_PATH', publicPath)
    await writeFile(examplePath, example)
    // Copy safe examples, never the source checkout’s local .env.
    await writeFile(
      path.join(directory, '.env'),
      setEnvValue(example, 'PROXY_URL', '')
    )
    await writeFile(
      path.join(directory, 'public/config.js'),
      '// Public configuration. Docker entrypoint generates this file at startup.\nwindow.config = {}\n'
    )
    const htmlPath = path.join(directory, 'index.html')
    await writeFile(
      htmlPath,
      (await readFile(htmlPath, 'utf8')).replace(
        /<title>[\s\S]*?<\/title>/i,
        `<title>${escapeHtml(title)}</title>`
      )
    )

    const readme =
      preset === 'minimal'
        ? await readFile(
            path.join(templateRoot, 'generator/templates/minimal/README.md'),
            'utf8'
          )
        : await readFile(path.join(source, 'README.md'), 'utf8')
    const body = readme
      .replace(/^# .*\r?\n/, '')
      .replaceAll('cfg/template_cfg.conf', `cfg/${deployment.nginxConfig}`)
      .trim()
    const command = preset === 'minimal' ? 'npm run dev' : 'npm run dev:demo'
    const port = { minimal: 8000, 'isp-app': 8002, 'isp-admin': 8001 }[preset]
    const intro = `# ${escapeMarkdown(title)}\n\nPreset: \`${preset}\`. Package: \`${name}\`.\n\n\`\`\`sh\nnpm ci\n${command}\n\`\`\`\n\nOpen http://localhost:${port}${publicPath}. Settings: \`.env\`.\nDefault title: \`package.json → config.appName\`; supported build/runtime settings can override it.\n\nContainer: \`/opt/msp/${deployment.deploymentName}${publicPath}\`. Nginx: \`cfg/${deployment.nginxConfig}\`.\n\n## Project guide\n\n`
    await writeFile(path.join(directory, 'README.md'), intro + body + '\n')
    await mkdir(path.join(directory, 'docs'), { recursive: true })
    const deploymentGuide = await readFile(
      path.join(templateRoot, 'docs/deployment.md'),
      'utf8'
    )
    await writeFile(
      path.join(directory, 'docs/deployment.md'),
      deploymentGuide
        .replaceAll('cfg/template_cfg.conf', `cfg/${deployment.nginxConfig}`)
        .replaceAll(
          '/etc/nginx/conf.d/template_cfg.conf',
          `/etc/nginx/conf.d/${deployment.nginxConfig}`
        )
        .replaceAll(
          '/opt/msp/project-name',
          `/opt/msp/${deployment.deploymentName}`
        )
    )
    const instructions =
      preset === 'minimal'
        ? path.join(templateRoot, 'generator/templates/minimal/AGENTS.md')
        : path.join(source, 'AGENTS.md')
    await copyEntry(instructions, path.join(directory, 'AGENTS.md'), true)
    const ci = `image: node:24-alpine\n\nstages: [verify]\n\nverify:\n  stage: verify\n${preset === 'isp-admin' ? '  variables:\n    NODE_OPTIONS: --max-old-space-size=4096\n' : ''}  script:\n    - npm ci\n    - npm run check\n    - npm run build\n`
    await writeFile(path.join(directory, '.gitlab-ci.yml'), ci)
    return {
      directory,
      preset,
      name,
      title,
      publicPath,
      command,
      port,
      ...deployment
    }
  } catch (error) {
    // Remove only the directory exclusively created by this call.
    await rm(directory, { recursive: true, force: true })
    throw error
  }
}

export async function installDependencies(directory) {
  const npmCli = process.env.npm_execpath
  const command = npmCli
    ? process.execPath
    : process.platform === 'win32'
      ? 'npm.cmd'
      : 'npm'
  const args = npmCli ? [npmCli, 'ci'] : ['ci']
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: directory,
      stdio: 'inherit',
      shell: false
    })
    child.on('error', reject)
    child.on('exit', (code, signal) =>
      code === 0
        ? resolve()
        : reject(
            new Error(
              `npm ci failed with ${signal || `code ${code}`}. Project files preserved; retry npm ci in ${directory}.`
            )
          )
    )
  })
}
