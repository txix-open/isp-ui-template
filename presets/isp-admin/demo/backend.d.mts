export function createDemoBackend(
  appName?: string
): (
  path: string,
  body?: Record<string, unknown>,
  token?: string
) => { status: number; data: unknown }
