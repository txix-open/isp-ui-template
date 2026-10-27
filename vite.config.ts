import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import svgr from 'vite-plugin-svgr'

import { normalizeBasePath } from './scripts/config.mjs'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const metadata = JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8')
  )
  const appName = metadata.config?.appName || metadata.name
  const base = normalizeBasePath(env.PUBLIC_PATH || '/')
  return {
    base,
    define: {
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
      APP_NAME: JSON.stringify(appName)
    },
    plugins: [react(), svgr(), tsconfigPaths()],
    build: { outDir: 'build', target: 'es2020' },
    server: {
      host: '127.0.0.1',
      port: 8000,
      strictPort: true,
      proxy: env.PROXY_URL ? { [`${base}api`]: env.PROXY_URL } : undefined
    }
  }
})
