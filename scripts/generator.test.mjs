import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import {
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
  mkdir
} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import {
  createProject,
  presets,
  templateRoot
} from '../generator/create-project.mjs'

async function workspace(t) {
  const folder = await mkdtemp(path.join(os.tmpdir(), 'isp-generator-'))
  t.after(() => rm(folder, { recursive: true, force: true }))
  return folder
}

async function command(args, cwd, environment = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.join(templateRoot, 'bin/create-isp-ui.mjs'), ...args],
      {
        cwd,
        env: { ...process.env, ...environment },
        stdio: ['ignore', 'pipe', 'pipe']
      }
    )
    let output = ''
    child.stdout.on('data', (data) => {
      output += data
    })
    child.stderr.on('data', (data) => {
      output += data
    })
    child.on('error', reject)
    child.on('exit', (code) => resolve({ code, output }))
  })
}

for (const preset of presets) {
  test(`${preset}: omitted public path stays at root regardless of directory, package or title`, async (t) => {
    const cwd = await workspace(t)
    const result = await createProject({
      directory: 'nested/folder-ui',
      cwd,
      preset,
      name: '@team/package-ui',
      title: 'Different application title'
    })
    assert.equal(result.publicPath, '/')
    for (const file of ['.env', '.env.example']) {
      assert.match(
        await readFile(path.join(result.directory, file), 'utf8'),
        /^PUBLIC_PATH=\/$/m
      )
    }
    const docker = await readFile(
      path.join(result.directory, 'Dockerfile'),
      'utf8'
    )
    assert.equal((docker.match(/^ARG PUBLIC_PATH=\/$/gm) || []).length, 2)
    const readme = await readFile(
      path.join(result.directory, 'README.md'),
      'utf8'
    )
    assert.ok(readme.includes(`http://localhost:${result.port}/.`))
    assert.equal(
      readme.includes(`http://localhost:${result.port}/folder-ui/`),
      false
    )
    const instructions = await readFile(
      path.join(result.directory, 'AGENTS.md'),
      'utf8'
    )
    assert.ok(instructions.includes('Never infer it from the directory'))
  })

  test(`${preset}: creates an independent project with matching manifest/lock and selected env`, async (t) => {
    const cwd = await workspace(t)
    const result = await createProject({
      directory: 'new-app',
      cwd,
      preset,
      name: '@team/project-ui',
      title: 'Панель «Проект» $HOME <script>',
      publicPath: '/team/app'
    })
    assert.equal(result.publicPath, '/team/app/')
    const read = (file) => readFile(path.join(result.directory, file), 'utf8')
    const metadata = JSON.parse(await read('package.json'))
    const lock = JSON.parse(await read('package-lock.json'))
    assert.equal(metadata.name, '@team/project-ui')
    assert.equal(metadata.config.appName, 'Панель «Проект» $HOME <script>')
    assert.equal(metadata.version, '0.1.0')
    assert.equal(lock.name, metadata.name)
    assert.equal(lock.version, metadata.version)
    assert.equal(lock.packages[''].name, metadata.name)
    assert.equal(lock.packages[''].version, metadata.version)
    assert.deepEqual(lock.packages[''].dependencies, metadata.dependencies)
    assert.deepEqual(
      lock.packages[''].devDependencies,
      metadata.devDependencies
    )
    assert.equal(metadata.scripts.create, undefined)
    assert.match(await read('.env'), /^PUBLIC_PATH=\/team\/app\/$/m)
    assert.match(await read('.env'), /^PROXY_URL=$/m)
    assert.match(await read('index.html'), /&lt;script&gt;/)
    assert.equal((await read('index.html')).includes('<script>'), false)
    assert.match(await read('README.md'), /http:\/\/localhost:/)
    assert.equal((await read('.gitlab-ci.yml')).includes('presets/'), false)
    assert.match(await read('AGENTS.md'), /npm/)
    const entries = await readdir(result.directory)
    for (const entry of [
      'node_modules',
      'build',
      'presets',
      '.git',
      '.env.local',
      'bin',
      'generator'
    ])
      assert.equal(entries.includes(entry), false)
    if (preset === 'minimal') {
      assert.equal(metadata.dependencies['isp-ui-kit'], undefined)
      assert.equal((await read('AGENTS.md')).includes('presets/'), false)
      assert.equal(
        (await readdir(path.join(result.directory, 'scripts'))).includes(
          'generator.test.mjs'
        ),
        false
      )
    } else {
      assert.ok(metadata.dependencies['isp-ui-kit'])
      assert.equal(
        Boolean(metadata.dependencies['isp-admin-ui-kit']),
        preset === 'isp-admin'
      )
    }
    assert.equal(result.deploymentName, 'project-ui')
    assert.equal(result.nginxConfig, 'project-ui.conf')
    const docker = await read('Dockerfile')
    const entrypoint = await read('entrypoint.sh')
    const nginx = await read('cfg/project-ui.conf')
    assert.ok(
      docker.includes(
        'COPY cfg/project-ui.conf /etc/nginx/conf.d/project-ui.conf'
      )
    )
    assert.ok(docker.includes('/opt/msp/project-ui${PUBLIC_PATH}/'))
    assert.equal(
      (docker.match(/^ARG PUBLIC_PATH=\/team\/app\/$/gm) || []).length,
      2
    )
    assert.ok(entrypoint.includes('/etc/nginx/conf.d/project-ui.conf'))
    assert.ok(entrypoint.includes('/opt/msp/project-ui${PUBLIC_PATH}'))
    assert.ok(nginx.includes('root  /opt/msp/project-ui/;'))
    assert.equal(nginx.includes('return 502'), false)
    assert.equal(
      (await readdir(path.join(result.directory, 'cfg'))).includes(
        'template_cfg.conf'
      ),
      false
    )
  })
}

test('refuses existing output without modifying files, including an empty directory', async (t) => {
  const cwd = await workspace(t)
  await mkdir(path.join(cwd, 'existing'))
  await writeFile(path.join(cwd, 'existing/keep.txt'), 'user work')
  await assert.rejects(
    createProject({ directory: 'existing', cwd }),
    /already exists/
  )
  assert.equal(
    await readFile(path.join(cwd, 'existing/keep.txt'), 'utf8'),
    'user work'
  )
  await mkdir(path.join(cwd, 'empty'))
  await assert.rejects(
    createProject({ directory: 'empty', cwd }),
    /already exists/
  )
  assert.deepEqual(await readdir(path.join(cwd, 'empty')), [])
})

test('validates preset, npm name, title and public path before creating output', async (t) => {
  const cwd = await workspace(t)
  for (const options of [
    { preset: '../isp-app' },
    { name: 'BAD NAME' },
    { title: 'bad\nname' },
    { publicPath: '/../../app/' }
  ]) {
    await assert.rejects(
      createProject({ directory: 'new-app', cwd, ...options })
    )
  }
  assert.deepEqual(await readdir(cwd), [])
})

test('rejects output inside source trees, also through a symlinked parent', async (t) => {
  const cwd = await workspace(t)
  await symlink(
    path.join(templateRoot, 'src'),
    path.join(cwd, 'source-link'),
    'dir'
  )
  await assert.rejects(
    createProject({ directory: path.join(templateRoot, 'src/new-app') }),
    /source trees/
  )
  await assert.rejects(
    createProject({ directory: 'source-link/new-app', cwd }),
    /source trees/
  )
})

test('concurrent creation cannot overwrite another result', async (t) => {
  const cwd = await workspace(t)
  const results = await Promise.allSettled([
    createProject({ directory: 'new-app', cwd, title: 'One' }),
    createProject({ directory: 'new-app', cwd, title: 'Two' })
  ])
  assert.equal(
    results.filter((result) => result.status === 'fulfilled').length,
    1
  )
  assert.equal(
    results.filter((result) => result.status === 'rejected').length,
    1
  )
  const metadata = JSON.parse(
    await readFile(path.join(cwd, 'new-app/package.json'), 'utf8')
  )
  assert.ok(['One', 'Two'].includes(metadata.config.appName))
})

test('CLI accepts equals options and a directory with spaces from another cwd', async (t) => {
  const cwd = await workspace(t)
  const result = await command(
    [
      'folder with spaces',
      '--name=new-app',
      '--preset=isp-app',
      '--title',
      'Название приложения',
      '--public-path=/tools',
      '--yes'
    ],
    cwd
  )
  assert.equal(result.code, 0, result.output)
  assert.match(result.output, /npm run dev:demo/)
  assert.equal(
    JSON.parse(
      await readFile(path.join(cwd, 'folder with spaces/package.json'), 'utf8')
    ).config.appName,
    'Название приложения'
  )
})

test('CLI defaults public path to root without deriving it from the output directory', async (t) => {
  const cwd = await workspace(t)
  const result = await command(
    ['folder-ui', '--name', 'package-ui', '--title', 'App title', '--yes'],
    cwd
  )
  assert.equal(result.code, 0, result.output)
  assert.match(result.output, /http:\/\/localhost:8000\/(?:\s|$)/)
  assert.match(
    await readFile(path.join(cwd, 'folder-ui/.env'), 'utf8'),
    /^PUBLIC_PATH=\/$/m
  )
})

test('CLI help and invalid arguments never create a project', async (t) => {
  const cwd = await workspace(t)
  assert.equal((await command(['--help'], cwd)).code, 0)
  for (const args of [
    [],
    ['new-app', '--unknown'],
    ['new-app', '--preset'],
    ['new-app', '--install', '--no-install'],
    ['new-app', '--preset', 'wrong']
  ]) {
    const result = await command(args, cwd)
    assert.notEqual(result.code, 0)
    assert.match(result.output, /Error:/)
  }
  assert.deepEqual(await readdir(cwd), [])
})

test('failed optional installation preserves the generated project and reports failure', async (t) => {
  const cwd = await workspace(t)
  const fakeNpm = path.join(cwd, 'fake-npm.mjs')
  await writeFile(fakeNpm, 'process.exit(23)\n')
  const result = await command(
    ['new-app', '--preset', 'minimal', '--yes', '--install'],
    cwd,
    { npm_execpath: fakeNpm }
  )
  assert.notEqual(result.code, 0)
  assert.match(result.output, /Project files preserved/)
  const metadata = JSON.parse(
    await readFile(path.join(cwd, 'new-app/package.json'), 'utf8')
  )
  assert.equal(metadata.name, 'new-app')
})

test('generator configures explicit API upstream and validates it before writing output', async (t) => {
  const cwd = await workspace(t)
  const result = await createProject({
    directory: 'my-app',
    cwd,
    apiUpstream: 'http://gateway:9003/'
  })
  assert.equal(result.apiUpstream, 'http://gateway:9003')
  assert.match(
    await readFile(path.join(result.directory, 'cfg/my-app.conf'), 'utf8'),
    /proxy_pass http:\/\/gateway:9003;/
  )
  for (const apiUpstream of [
    'file:///tmp/gateway',
    'http://user:pass@gateway',
    'http://gateway/other',
    'http://gateway;bad'
  ]) {
    await assert.rejects(
      createProject({ directory: 'invalid', cwd, apiUpstream })
    )
  }
  await assert.rejects(readFile(path.join(cwd, 'invalid/package.json')))
})
