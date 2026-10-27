export function normalizeBasePath(value = '/') {
  if (!/^\/(?:[a-zA-Z0-9_-]+\/?)*$/.test(value)) {
    throw new Error('PUBLIC_PATH must be a path such as / or /my-app/')
  }
  return value === '/' ? '/' : `/${value.split('/').filter(Boolean).join('/')}/`
}
