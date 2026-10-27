import type { Plugin } from 'vite'
import { createDemoBackend } from './backend.mjs'

export function demoApi(base: string, appName?: string): Plugin {
  const handle = createDemoBackend(appName)
  return {
    name: 'template-demo-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const prefix = `${base}api`
        const pathname = new URL(request.url || '/', 'http://localhost')
          .pathname
        if (!pathname.startsWith(`${prefix}/`)) return next()
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.setHeader('Cache-Control', 'no-store')
        if (request.method !== 'POST') {
          response.statusCode = 405
          response.end(JSON.stringify({ message: 'Ожидается POST' }))
          return
        }
        try {
          let input = ''
          for await (const chunk of request) {
            input += chunk.toString()
            if (input.length > 65536) throw new Error('Слишком большой запрос')
          }
          const body: unknown = input ? JSON.parse(input) : {}
          if (!body || typeof body !== 'object' || Array.isArray(body))
            throw new Error('Ожидается JSON object')
          const header = request.headers['x-template-demo-session']
          const result = handle(
            pathname.slice(prefix.length),
            body as Record<string, unknown>,
            typeof header === 'string' ? header : undefined
          )
          response.statusCode = result.status
          response.end(JSON.stringify(result.data))
        } catch {
          response.statusCode = 400
          response.end(JSON.stringify({ message: 'Некорректный запрос' }))
        }
      })
    }
  }
}
