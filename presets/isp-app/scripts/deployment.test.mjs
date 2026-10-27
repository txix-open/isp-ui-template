import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  writeFile,
  access
} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))

async function fixture(t) {
  const folder = await mkdtemp(path.join(os.tmpdir(), 'isp-entrypoint-'))
  t.after(() => rm(folder, { recursive: true, force: true }))
  const source = await readFile(path.join(projectRoot, 'entrypoint.sh'), 'utf8')
  const sourceRoot = source.match(
    /^CONFIG_DIR="([^"$]+)\$\{PUBLIC_PATH\}"$/m
  )?.[1]
  const sourceNginx = source.match(/^NGINX_SRC="([^"]+)"$/m)?.[1]
  assert.match(sourceRoot, /^\/opt\/msp\/[a-zA-Z0-9._-]+$/)
  assert.ok(sourceNginx.startsWith('/etc/nginx/conf.d/'))
  const config = path.join(folder, 'nginx.conf')
  const appRoot = path.join(folder, 'app')
  const script = path.join(folder, 'entrypoint.sh')
  const args = path.join(folder, 'nginx.args')
  const bin = path.join(folder, 'bin')
  await mkdir(bin)
  await writeFile(
    path.join(bin, 'nginx'),
    '#!/bin/sh\nprintf "%s\\n" "$@" > "$NGINX_ARGS_LOG"\n',
    { mode: 0o755 }
  )
  await writeFile(
    script,
    source.replaceAll(sourceRoot, appRoot).replaceAll(sourceNginx, config)
  )
  await writeFile(
    config,
    (
      await readFile(
        path.join(projectRoot, 'cfg', path.basename(sourceNginx)),
        'utf8'
      )
    ).replaceAll(sourceRoot, appRoot)
  )
  const run = (publicPath, env = {}) =>
    spawnSync('sh', [script], {
      encoding: 'utf8',
      env: {
        PATH: `${bin}${path.delimiter}${process.env.PATH}`,
        NGINX_ARGS_LOG: args,
        PUBLIC_PATH: publicPath,
        ...env
      }
    })
  const readConfig = async (prefix) => {
    const code = await readFile(path.join(appRoot, prefix, 'config.js'), 'utf8')
    const context = { window: {} }
    runInNewContext(code, context)
    return {
      value: context.window.config,
      code,
      injected: context.window.injected
    }
  }
  return { folder, sourceRoot, sourceNginx, run, readConfig, config, args }
}

for (const prefix of ['/', '/admin', '/team/admin/']) {
  test(`entrypoint preserves runtime config, PUBLIC_PATH and nginx startup at ${prefix}`, async (t) => {
    const setup = await fixture(t)
    const result = setup.run(prefix)
    assert.equal(result.status, 0, result.stderr)
    const { value } = await setup.readConfig(prefix)
    assert.equal(value.APP_TOKEN, 'default_token')
    assert.equal(value.CLIENT_NAME, path.basename(setup.sourceRoot))
    assert.equal(value.ENABLE_PASSWORD_LOGIN, true)
    assert.equal(value.ENABLE_OAUTH_LOGIN, false)
    assert.equal(Object.hasOwn(value, 'APP_NAME'), false)
    assert.equal(await readFile(setup.args, 'utf8'), '-g\ndaemon off;\n')
    const nginx = await readFile(setup.config, 'utf8')
    const normalized = prefix.endsWith('/') ? prefix : `${prefix}/`
    assert.ok(nginx.includes(`location ${normalized}api {`))
    assert.ok(nginx.includes(`rewrite ^${normalized}api/(.*)$ /api/$1 break;`))
    assert.ok(nginx.includes(`try_files $uri ${normalized}index.html;`))
    assert.ok(
      nginx.includes(
        'proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;'
      )
    )
    assert.equal(nginx.includes('__PUBLIC_PATH__'), false)
  })
}

test('runtime config preserves quoted Unicode strings and trailing newlines without executing code', async (t) => {
  const setup = await fixture(t)
  const token = `Пример ' " \\ \t\r\n</script>; window.injected = true;\n\n`
  const result = setup.run('/admin/', {
    APP_TOKEN: token,
    APP_NAME: 'Название проекта',
    ENABLE_PASSWORD_LOGIN: 'false',
    ENABLE_OAUTH_LOGIN: 'true',
    CLIENT_NAME: 'my-client'
  })
  assert.equal(result.status, 0, result.stderr)
  const { value, code, injected } = await setup.readConfig('/admin/')
  assert.equal(value.APP_TOKEN, token)
  assert.equal(value.APP_NAME, 'Название проекта')
  assert.equal(value.CLIENT_NAME, 'my-client')
  assert.equal(value.ENABLE_PASSWORD_LOGIN, false)
  assert.equal(value.ENABLE_OAUTH_LOGIN, true)
  assert.equal(code.includes('</script>'), false)
  assert.equal(injected, undefined)
  const second = setup.run('/admin/', { APP_TOKEN: 'new-token' })
  assert.equal(second.status, 0, second.stderr)
  assert.equal((await setup.readConfig('/admin/')).value.APP_TOKEN, 'new-token')
})

test('invalid public paths and booleans fail before starting nginx', async (t) => {
  for (const [prefix, env] of [
    ['/admin/', { ENABLE_OAUTH_LOGIN: 'yes' }],
    ['/../bad/', {}],
    ['admin', {}]
  ]) {
    const setup = await fixture(t)
    const result = setup.run(prefix, env)
    assert.notEqual(result.status, 0)
    await assert.rejects(access(setup.args))
  }
})

test('Docker keeps the original nginx-only runtime and deployment filesystem layout', async () => {
  const docker = await readFile(path.join(projectRoot, 'Dockerfile'), 'utf8')
  assert.match(docker, /WORKDIR \/usr\/src\/app/)
  assert.match(docker, /FROM nginx:alpine-slim AS final/)
  assert.match(docker, /COPY --from=build \/usr\/src\/app\/build \/opt\/msp\//)
  assert.match(docker, /COPY cfg\/[^\s]+\.conf \/etc\/nginx\/conf\.d\//)
  assert.match(docker, /ENV PUBLIC_PATH=\$PUBLIC_PATH/)
  assert.equal(docker.includes('/docker-entrypoint.d/40-app-config.sh'), false)
  assert.equal(docker.includes('apk add'), false)
  const entry = JSON.parse(docker.match(/^ENTRYPOINT (.+)$/m)[1])
  assert.deepEqual(entry.slice(0, 2), ['sh', '-c'])
  assert.match(
    entry[2],
    /^exec "\/opt\/msp\/[^\s]+\$\{PUBLIC_PATH\}\/entrypoint.sh"$/
  )
})
