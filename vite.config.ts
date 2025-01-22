import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import svgr from 'vite-plugin-svgr'

import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    envPrefix: 'DEV_',
    define: {
      __APP_ENV__: env.APP_ENV,
      APP_VERSION: JSON.stringify(process.env.npm_package_version)
    },
    build: {
      minify: 'esbuild',
      outDir: 'build',
      chunkSizeWarningLimit: 1600,
      commonjsOptions: { transformMixedEsModules: true },
      sourcemap: mode !== 'production',
      esbuild: {
        target: 'es2020',
        legalComments: 'none'
      }
    },
    server: {
      watch: {
        usePolling: true
      },
      host: true,
      strictPort: true,
      port: 8000,
      proxy: {
        '/api': env.DEV_PROXY_URL
      }
    },
    resolve: {
      alias: {
        '@src': resolve(__dirname, './src')
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs']
    },
    plugins: [
      react(),
      svgr(),
      tsconfigPaths()
    ]
  }
})
