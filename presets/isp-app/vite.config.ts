import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { demoApi } from './demo/server'
import { normalizeBasePath } from './scripts/config.mjs'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const metadata = JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8')
  )
  const appName = metadata.config?.appName || metadata.name
  const base = normalizeBasePath(env.PUBLIC_PATH || '/')
  if (command === 'build' && mode === 'demo')
    throw new Error(
      'Демо работает только в dev. Для production используйте npm run build.'
    )
  return {
    base,
    define: {
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
      APP_NAME: JSON.stringify(appName)
    },
    plugins: [react(), ...(mode === 'demo' ? [demoApi(base)] : [])],
    build: { outDir: 'build', target: 'es2020' },
    server: {
      host: '127.0.0.1',
      port: 8002,
      strictPort: true,
      proxy:
        mode !== 'demo' && env.PROXY_URL
          ? { [`${base}api`]: env.PROXY_URL }
          : undefined
    }
  }
})
