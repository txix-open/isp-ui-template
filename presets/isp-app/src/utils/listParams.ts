import type { ListParams } from '../services/itemsApi'
export function parseListParams(params: URLSearchParams): ListParams {
  const page = Number(params.get('page') || '1')
  const status = params.get('status')
  return {
    search: params.get('search') || '',
    status: status === 'active' || status === 'archived' ? status : '',
    page: Number.isInteger(page) && page > 0 && page <= 10000 ? page : 1,
    pageSize: 10,
    order: params.get('order') === 'desc' ? 'desc' : 'asc'
  }
}
