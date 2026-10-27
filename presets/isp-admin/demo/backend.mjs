import { randomUUID } from 'node:crypto'

// Только учебный backend. Не используется в production и не хранит реальные данные.
export function createDemoBackend(appName = 'ISP Admin') {
  const sessions = new Map()
  let items = [
    { id: '1', name: 'Первая запись' },
    { id: '2', name: 'Пример справочника' }
  ]
  const reply = (status, data) => ({ status, data })
  const fail = (status, message) => reply(status, { message })
  return (path, body = {}, token) => {
    if (path === '/admin/auth/login') {
      if (
        body.password !== 'demo' ||
        ![
          'editor@example.test',
          'viewer@example.test',
          'blocked@example.test'
        ].includes(body.email)
      ) {
        return fail(401, 'Проверьте демо-логин и пароль')
      }
      const token = randomUUID()
      sessions.set(token, body.email)
      return reply(200, { headerName: 'x-template-demo-session', token })
    }
    const email = sessions.get(token)
    if (!email) return fail(401, 'Демо-сессия завершена')
    if (path === '/admin/auth/logout') {
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
    if (path === '/admin/user/get_profile')
      return reply(200, {
        email,
        firstName: 'Демо',
        lastName: canWrite ? 'Редактор' : 'Читатель',
        role: canWrite ? 'editor' : 'viewer',
        roles: [],
        roleNames: [],
        permissions,
        idleTimeoutMs: 0
      })
    if (path === '/admin/user/get_design')
      return reply(200, { name: `${appName} · Демо`, primaryColor: '#245bcc' })
    if (!path.startsWith('/example/items/'))
      return fail(501, 'Этот API не реализован в демо')
    if (!canView || (path !== '/example/items/list' && !canWrite))
      return fail(403, 'Недостаточно прав')
    if (path === '/example/items/list')
      return reply(
        200,
        items.map((item) => ({ ...item }))
      )
    if (path === '/example/items/create' || path === '/example/items/update') {
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      if (!name || name.length > 100)
        return fail(400, 'Название: от 1 до 100 символов')
      if (
        items.some(
          (item) =>
            item.name.toLocaleLowerCase() === name.toLocaleLowerCase() &&
            item.id !== body.id
        )
      ) {
        return fail(400, 'Запись с таким названием уже существует')
      }
      if (path.endsWith('/create')) {
        const item = { id: randomUUID(), name }
        items.push(item)
        return reply(200, { ...item })
      }
      const item = items.find((item) => item.id === body.id)
      if (!item) return fail(404, 'Запись не найдена')
      item.name = name
      return reply(200, { ...item })
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
