import { randomUUID } from 'node:crypto'

// Явный учебный backend. Не включается обычным dev или production-сборкой.
export function createDemoBackend() {
  const sessions = new Map()
  let items = Array.from({ length: 24 }, (_, index) => ({
    id: String(index + 1),
    name: `Запись ${String(index + 1).padStart(2, '0')}`,
    status: index % 3 === 0 ? 'archived' : 'active'
  }))
  const reply = (status, data) => ({ status, data })
  const fail = (status, message) => reply(status, { message })
  return (path, body = {}, token) => {
    if (path === '/example/auth/login') {
      if (
        body.password !== 'demo' ||
        ![
          'editor@example.test',
          'viewer@example.test',
          'blocked@example.test'
        ].includes(body.email)
      )
        return fail(401, 'Проверьте демо-логин и пароль')
      const token = randomUUID()
      sessions.set(token, body.email)
      return reply(200, { headerName: 'x-template-demo-session', token })
    }
    const email = sessions.get(token)
    if (!email) return fail(401, 'Сессия завершена. Войдите повторно.')
    if (path === '/example/auth/logout') {
      sessions.delete(token)
      return reply(200, {})
    }
    const canView = email !== 'blocked@example.test'
    const canWrite = email === 'editor@example.test'
    const permissions = canView ? ['example_item_view'] : []
    if (canWrite)
      permissions.push(
        'example_item_create',
        'example_item_edit',
        'example_item_delete'
      )
    if (path === '/example/auth/profile')
      return reply(200, {
        id: email,
        email,
        displayName: canWrite ? 'Демо Редактор' : 'Демо Читатель',
        permissions
      })
    if (!path.startsWith('/example/items/'))
      return fail(501, 'Этот API не реализован в демо')
    if (!canView || (path !== '/example/items/list' && !canWrite))
      return fail(403, 'Недостаточно прав')
    if (path === '/example/items/list') {
      const page = Number(body.page ?? 1)
      const pageSize = Number(body.pageSize ?? 10)
      if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(pageSize) ||
        pageSize < 1 ||
        pageSize > 100
      )
        return fail(400, 'Некорректная пагинация')
      const search =
        typeof body.search === 'string' ? body.search.toLocaleLowerCase() : ''
      const filtered = items.filter(
        (item) =>
          item.name.toLocaleLowerCase().includes(search) &&
          (!body.status || item.status === body.status)
      )
      filtered.sort(
        (a, b) =>
          a.name.localeCompare(b.name, 'ru') * (body.order === 'desc' ? -1 : 1)
      )
      return reply(200, {
        items: filtered
          .slice((page - 1) * pageSize, page * pageSize)
          .map((item) => ({ ...item })),
        total: filtered.length
      })
    }
    if (path.endsWith('/create') || path.endsWith('/update')) {
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      if (!name || name.length > 100)
        return fail(400, 'Название: от 1 до 100 символов')
      if (!['active', 'archived'].includes(body.status))
        return fail(400, 'Некорректный статус')
      if (
        items.some(
          (item) =>
            item.name.toLocaleLowerCase() === name.toLocaleLowerCase() &&
            item.id !== body.id
        )
      )
        return fail(400, 'Запись с таким названием уже существует')
      if (path === '/example/items/create') {
        const item = { id: randomUUID(), name, status: body.status }
        items.push(item)
        return reply(200, { ...item })
      }
      if (path === '/example/items/update') {
        const item = items.find((item) => item.id === body.id)
        if (!item) return fail(404, 'Запись не найдена')
        Object.assign(item, { name, status: body.status })
        return reply(200, { ...item })
      }
    }
    if (path === '/example/items/delete') {
      if (!items.some((item) => item.id === body.id))
        return fail(404, 'Запись не найдена')
      items = items.filter((item) => item.id !== body.id)
      return reply(200, {})
    }
    return fail(404, 'API не найден')
  }
}
