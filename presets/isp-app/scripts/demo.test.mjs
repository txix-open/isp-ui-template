import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createDemoBackend } from '../demo/backend.mjs'

function login(backend, email = 'editor@example.test') {
  return backend('/example/auth/login', { email, password: 'demo' }).data.token
}

test('server-side filters, stable sorting and pagination describe the same result set', () => {
  const backend = createDemoBackend()
  const token = login(backend)
  const list = (body) => backend('/example/items/list', body, token).data
  const first = list({ page: 1, pageSize: 10 })
  const second = list({ page: 2, pageSize: 10 })
  assert.equal(first.total, 24)
  assert.equal(first.items.length, 10)
  assert.equal(second.items[0].name, 'Запись 11')
  assert.equal(list({ status: 'archived' }).total, 8)
  assert.equal(
    list({ search: '24', status: 'active' }).items[0].name,
    'Запись 24'
  )
  assert.equal(list({ order: 'desc' }).items[0].name, 'Запись 24')
  assert.equal(list({ search: 'no-match' }).total, 0)
  assert.equal(
    backend('/example/items/list', { pageSize: 0 }, token).status,
    400
  )
})

test('CRUD validates input, rejects duplicates and invalidates the server list', () => {
  const backend = createDemoBackend()
  const token = login(backend)
  assert.equal(
    backend('/example/items/create', { name: ' ', status: 'active' }, token)
      .status,
    400
  )
  assert.equal(
    backend('/example/items/create', { name: 'Новая', status: 'wrong' }, token)
      .status,
    400
  )
  const item = backend(
    '/example/items/create',
    { name: 'Новая', status: 'active' },
    token
  ).data
  assert.equal(
    backend('/example/items/create', { name: 'Новая', status: 'active' }, token)
      .status,
    400
  )
  assert.equal(
    backend('/example/items/update', { ...item, status: 'archived' }, token)
      .data.status,
    'archived'
  )
  assert.equal(
    backend('/example/items/delete', { id: item.id }, token).status,
    200
  )
  assert.equal(backend('/example/items/list', {}, token).data.total, 24)
})

test('401 ends authentication; 403 denies an operation without ending the session', () => {
  const backend = createDemoBackend()
  assert.equal(
    backend('/example/auth/login', {
      email: 'editor@example.test',
      password: 'wrong'
    }).status,
    401
  )
  assert.equal(backend('/example/auth/profile').status, 401)
  const viewer = login(backend, 'viewer@example.test')
  assert.equal(backend('/example/items/list', {}, viewer).status, 200)
  for (const operation of ['create', 'update', 'delete'])
    assert.equal(backend(`/example/items/${operation}`, {}, viewer).status, 403)
  assert.equal(backend('/example/auth/profile', {}, viewer).status, 200)
  const blocked = login(backend, 'blocked@example.test')
  assert.equal(backend('/example/items/list', {}, blocked).status, 403)
  backend('/example/auth/logout', {}, viewer)
  assert.equal(backend('/example/auth/profile', {}, viewer).status, 401)
})
