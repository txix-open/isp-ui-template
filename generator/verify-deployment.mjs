import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { runInNewContext } from 'node:vm'

import { createProject } from './create-project.mjs'

const exec = promisify(execFile)
async function docker(args, allowFailure = false) {
  try {
    return await exec('docker', args, {
      maxBuffer: 16 * 1024 * 1024,
      timeout: 300000
    })
  } catch (error) {
    if (allowFailure)
      return {
        code: error.code,
        stdout: error.stdout || '',
        stderr: error.stderr || ''
      }
    throw new Error(
      `docker ${args.slice(0, 2).join(' ')} failed:\n${String(error.stderr || error.stdout || error.message).slice(-16000)}`
    )
  }
}

const directory = await mkdtemp(path.join(os.tmpdir(), 'isp-docker-contract-'))
const id = randomUUID().slice(0, 8)
const network = `isp-ui-contract-${id}`
const containers = []
const images = []
let success = false
let networkCreated = false

async function waitReady(url, name) {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      if ((await fetch(url)).status === 200) return
    } catch {
      /* startup */
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  const logs = await docker(['logs', name], true)
  throw new Error(
    `Container did not become ready: ${logs.stdout}\n${logs.stderr}`
  )
}

async function verifyHttp({
  image,
  preset,
  label,
  publicPath,
  name,
  defaults = false,
  appName
}) {
  const container = `isp-ui-${label}-${defaults ? 'defaults' : 'env'}-${id}`
  const token = 'deployment-test-token'
  const button = `Войти ' " \\\nпроверка\n`
  const expected = defaults
    ? {
        APP_TOKEN: 'default_token',
        CLIENT_NAME: name,
        ENABLE_PASSWORD_LOGIN: true,
        ENABLE_OAUTH_LOGIN: false,
        OAUTH_LOGIN_BUTTON_TEXT: 'Войти с помощью OAuth'
      }
    : {
        APP_TOKEN: token,
        CLIENT_NAME: 'deployment-client',
        ENABLE_PASSWORD_LOGIN: false,
        ENABLE_OAUTH_LOGIN: true,
        OAUTH_LOGIN_BUTTON_TEXT: button,
        ...(appName === undefined ? {} : { APP_NAME: appName })
      }
  const environment = defaults
    ? []
    : Object.entries(expected).flatMap(([key, value]) => [
        '-e',
        `${key}=${value}`
      ])
  await docker([
    'run',
    '-d',
    '--rm',
    '--name',
    container,
    '--network',
    network,
    '-p',
    '127.0.0.1::8001',
    ...environment,
    image
  ])
  containers.push(container)
  const inspect = JSON.parse(
    (
      await docker([
        'inspect',
        container,
        '--format',
        '{{json .NetworkSettings.Ports}}'
      ])
    ).stdout
  )
  const port = inspect['8001/tcp'][0].HostPort
  const origin = `http://127.0.0.1:${port}`
  const base = `${origin}${publicPath}`
  await waitReady(base, container)
  const htmlResponse = await fetch(base)
  const html = await htmlResponse.text()
  assert.match(htmlResponse.headers.get('cache-control'), /no-cache/)
  assert.ok(html.includes(`<title>Deployment ${preset}</title>`))
  const deep = await fetch(`${base}items/deep/link`)
  assert.equal(deep.status, 200)
  assert.equal(await deep.text(), html)

  const runtime = await fetch(`${base}config.js`)
  assert.match(runtime.headers.get('cache-control'), /no-store/)
  const checkRuntime = (source) => {
    const context = { window: {} }
    runInNewContext(source, context)
    assert.deepEqual(
      JSON.parse(JSON.stringify(context.window.config)),
      expected
    )
  }
  checkRuntime(await runtime.text())
  const asset = html.match(/<script[^>]+src="([^"]*\/assets\/[^"]+)"/)[1]
  assert.ok(asset.startsWith(`${publicPath}assets/`))
  const assetResponse = await fetch(origin + asset, {
    headers: { 'Accept-Encoding': 'gzip' }
  })
  assert.equal(assetResponse.status, 200)
  assert.match(
    assetResponse.headers.get('cache-control'),
    /public.*max-age=604800/
  )
  assert.equal(assetResponse.headers.get('content-encoding'), 'gzip')
  assert.ok((await assetResponse.text()).length > 100)
  assert.equal((await fetch(`${base}assets/not-found.js`)).status, 404)
  assert.equal(
    (await (await fetch(`${base}version.json`)).json()).version,
    '0.1.0'
  )

  const payload = JSON.stringify({ test: 'proxy-body' })
  const api = await fetch(`${base}api/probe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-APPLICATION-TOKEN': token,
      'X-Forwarded-For': '203.0.113.10'
    },
    body: payload
  })
  assert.equal(api.status, 200)
  const forwarded = await api.json()
  assert.equal(forwarded.url, '/api/probe')
  assert.equal(forwarded.method, 'POST')
  assert.equal(forwarded.body, payload)
  assert.equal(forwarded.host, '127.0.0.1')
  assert.equal(forwarded.token, token)
  assert.ok(forwarded.forwarded.startsWith('203.0.113.10, '))
  assert.ok(forwarded.realIp)

  const login = await fetch(`${origin}/login?from=test`, { redirect: 'manual' })
  if (publicPath === '/') assert.equal(login.status, 200)
  else {
    assert.equal(login.status, 302)
    assert.equal(
      new URL(login.headers.get('location'), origin).pathname,
      `${publicPath}login`
    )
    assert.equal(
      new URL(login.headers.get('location'), origin).search,
      '?from=test'
    )
  }
  const appDirectory = `/opt/msp/${name}${publicPath}`
  await docker([
    'exec',
    container,
    'sh',
    '-c',
    'test -f "$1/config.js" && test -x "$1/entrypoint.sh" && test -f "$2"',
    'sh',
    appDirectory,
    `/etc/nginx/conf.d/${name}.conf`
  ])
  await docker(['exec', container, 'nginx', '-t'])
  const node = await docker(
    ['exec', container, 'sh', '-c', 'command -v node'],
    true
  )
  assert.notEqual(node.code, undefined, 'Runtime must not require Node.js')
  await docker(['restart', container])
  const restarted = JSON.parse(
    (
      await docker([
        'inspect',
        container,
        '--format',
        '{{json .NetworkSettings.Ports}}'
      ])
    ).stdout
  )
  const restartedBase = `http://127.0.0.1:${restarted['8001/tcp'][0].HostPort}${publicPath}`
  await waitReady(restartedBase, container)
  const restartedRuntime = await fetch(`${restartedBase}config.js`)
  assert.equal(restartedRuntime.status, 200)
  checkRuntime(await restartedRuntime.text())
  console.log(
    `PASS ${preset} ${publicPath} (${defaults ? 'default config' : 'Docker env'}): paths, config, SPA/assets, proxy, cache, gzip, login and restart`
  )
}

try {
  await docker(['info'])
  await docker(['network', 'create', network])
  networkCreated = true
  console.log('Preparing isolated mock gateway...')
  const gateway = `isp-ui-gateway-${id}`
  const gatewayCode = `require('node:http').createServer((req,res)=>{let body='';req.on('data',chunk=>body+=chunk);req.on('end',()=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify({url:req.url,method:req.method,body,host:req.headers.host,forwarded:req.headers['x-forwarded-for'],realIp:req.headers['x-real-ip'],token:req.headers['x-application-token']}))})}).listen(9003,'0.0.0.0')`
  await docker([
    'run',
    '-d',
    '--rm',
    '--name',
    gateway,
    '--network',
    network,
    '--network-alias',
    'mock-gateway',
    'node:24-alpine',
    'node',
    '-e',
    gatewayCode
  ])
  containers.push(gateway)
  const cases = [
    { preset: 'minimal', label: 'root', publicPath: '/' },
    {
      preset: 'minimal',
      label: 'nested',
      publicPath: '/nested/',
      buildPath: '/nested',
      generatedPath: '/original/'
    },
    { preset: 'isp-app', label: 'app-root', publicPath: '/' },
    { preset: 'isp-app', label: 'app', publicPath: '/apps/demo/' },
    { preset: 'isp-admin', label: 'admin-root', publicPath: '/' },
    { preset: 'isp-admin', label: 'admin', publicPath: '/admin/' }
  ]
  for (const scenario of cases) {
    const name = `deploy-${scenario.label}`
    const result = await createProject({
      directory: path.join(directory, scenario.label),
      name,
      title: `Deployment ${scenario.preset}`,
      preset: scenario.preset,
      ...(scenario.publicPath === '/'
        ? {}
        : { publicPath: scenario.generatedPath || scenario.publicPath }),
      apiUpstream: 'http://mock-gateway:9003'
    })
    const image = `isp-ui-contract:${id}-${scenario.label}`
    console.log(`Building ${scenario.preset} for ${scenario.publicPath}...`)
    await docker([
      'build',
      ...(scenario.publicPath === '/'
        ? []
        : [
            '--build-arg',
            `PUBLIC_PATH=${scenario.buildPath || scenario.publicPath}`
          ]),
      '-t',
      image,
      result.directory
    ])
    images.push(image)
    await verifyHttp({
      ...scenario,
      name,
      image,
      ...(scenario.publicPath === '/'
        ? { appName: `Runtime <name> "quoted" \\ Кириллица\n` }
        : {})
    })
    await verifyHttp({ ...scenario, name, image, defaults: true })
    for (const invalid of [
      'ENABLE_PASSWORD_LOGIN=not-a-boolean',
      'PUBLIC_PATH=relative'
    ]) {
      const rejected = await docker(['run', '--rm', '-e', invalid, image], true)
      assert.notEqual(
        rejected.code,
        undefined,
        `Invalid env must reject startup: ${invalid}`
      )
    }
    if (scenario.label === 'nested') {
      const mismatch = await docker(
        ['run', '--rm', '-e', 'PUBLIC_PATH=/wrong/', image],
        true
      )
      assert.notEqual(
        mismatch.code,
        undefined,
        'Different runtime PUBLIC_PATH must not silently serve another directory'
      )
    }
  }
  success = true
  console.log(
    'Docker deployment contract passed for all presets, root and subdirectories.'
  )
} finally {
  for (const container of containers.reverse())
    await docker(['rm', '-f', container], true)
  if (networkCreated) await docker(['network', 'rm', network], true)
  for (const image of images) await docker(['image', 'rm', image], true)
  if (success) await rm(directory, { recursive: true, force: true })
  else
    console.error(`Deployment fixtures retained for diagnostics: ${directory}`)
}
