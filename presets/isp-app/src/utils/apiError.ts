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
  if ('status' in error && error.status === 403)
    return 'Недостаточно прав для этой операции'
  if ('status' in error && error.status === 401)
    return 'Сессия завершена. Войдите повторно.'
  return 'Не удалось выполнить запрос. Повторите попытку.'
}
