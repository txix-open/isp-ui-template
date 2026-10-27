export function createDemoBackend(): (
  path: string,
  body?: Record<string, unknown>,
  token?: string
) => { status: number; data: unknown }
