import { readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

export function normalizeUpstream(value) {
  if (value === undefined) return undefined
  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error('API upstream must be http(s)://host[:port]')
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    !/^(?:[a-z0-9_.-]+|\[[a-f0-9:]+\])$/i.test(url.hostname) ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'API upstream: http(s)://host[:port] only; no credentials, path, query or fragment'
    )
  }
  return url.origin
}

export async function configureDeployment(
  directory,
  { name, publicPath, apiUpstream }
) {
  const deploymentName = name.split('/').at(-1)
  const nginxConfig = `${deploymentName}.conf`
  const substitute = (value) =>
    value
      .replaceAll('project-name', deploymentName)
      .replaceAll('template_cfg.conf', nginxConfig)
  for (const file of ['Dockerfile', 'entrypoint.sh']) {
    const filename = path.join(directory, file)
    let contents = substitute(await readFile(filename, 'utf8'))
    if (file === 'Dockerfile')
      contents = contents.replace(
        /^ARG PUBLIC_PATH=.*$/gm,
        `ARG PUBLIC_PATH=${publicPath}`
      )
    await writeFile(filename, contents)
  }
  const source = path.join(directory, 'cfg/template_cfg.conf')
  let config = substitute(await readFile(source, 'utf8'))
  if (apiUpstream) {
    const proxy = /^\s*#\s*proxy_pass http:\/\/isp-gate-service:9003;$/m
    if (!proxy.test(config))
      throw new Error('API upstream marker missing in nginx template')
    config = config.replace(proxy, `        proxy_pass ${apiUpstream};`)
  }
  const destination = path.join(directory, 'cfg', nginxConfig)
  if (destination === source) await writeFile(destination, config)
  else {
    await writeFile(destination, config, { flag: 'wx' })
    await rm(source)
  }
  return { deploymentName, nginxConfig, apiUpstream }
}
