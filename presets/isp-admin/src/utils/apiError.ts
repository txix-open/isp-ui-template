export function getApiErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null)
    return 'Не удалось выполнить запрос'
  if (
    'data' in error &&
    typeof error.data === 'object' &&
    error.data !== null &&
    'message' in error.data &&
    typeof error.data.message === 'string'
  )
    return error.data.message
  if ('response' in error) return getApiErrorMessage(error.response)
  return 'Не удалось выполнить запрос. Повторите попытку.'
}
