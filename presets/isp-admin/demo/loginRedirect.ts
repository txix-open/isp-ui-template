import type { Connect, Plugin } from 'vite'

// Совместимость с абсолютным /login в interceptor текущего AdminBase.
export function loginRedirect(base: string): Plugin {
  const middleware: Connect.NextHandleFunction = (request, response, next) => {
    const url = new URL(request.url || '/', 'http://localhost')
    if (base === '/' || url.pathname !== '/login') return next()
    response.statusCode = 302
    response.setHeader('Location', `${base}login${url.search}`)
    response.end()
  }
  return {
    name: 'admin-login-base-path',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    }
  }
}
